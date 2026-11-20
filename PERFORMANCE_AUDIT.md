# Website Performance & Admin Panel Loading Audit Report

**Audit Target:** Chesapeake Pharma Biologics Intelligence Platform & Administrator CMS  
**Date of Audit:** November 14, 2026  
**Auditor:** Antigravity AI Engineering Diagnostics  
**Status:** Complete — Investigation & Recommendations Only (Code Untouched)

---

## 1. Executive Summary

A comprehensive, read-only performance and architectural audit of the Chesapeake Pharma web platform was performed. The evaluation covered the public marketing pages, subscriber portal, database queries, and particularly the **Administrator Management Console (`/admin`)**.

### Key Diagnostic Findings:
1. **Critical Monolithic Admin Data Fetching Pattern**:
   - The primary culprit behind admin panel loading lag is located in `components/admin/admin-context.tsx`. Upon authentication hydration, four comprehensive unbounded queries (`fetchDrugsAction()`, `fetchUsersAction()`, `fetchSubscriptionsAction()`, and `fetchAccessRequestsAction()`) execute in parallel across the wire, regardless of which admin sub-route the user requested.
   - For every visit to `/admin`, the entire catalog of drug records (`drugs`), user profiles (`profiles`), subscriptions (`subscriptions`), and customer access requests (`access_requests`) is downloaded into client React state without pagination or server-side filtering.
2. **Missing Loading States Causing "Data Zero" Illusion**:
   - In `app/admin/page.tsx`, dashboard metric counters (`totalDb1`, `totalDb2`, `pendingRequests`, `activeDb1Subs + activeDb2Subs`) derive directly from `admin-context.tsx` arrays initialized as `[]`. Because there is no granular loading state or skeleton UI on the dashboard cards, these KPI counters render as `0` while data fetches over the network. To an admin, the system appears empty or wiped before abruptly flashing actual numbers seconds later.
   - Similar issues occur in data tables (`/admin/drugs`, `/admin/users`, `/admin/subscriptions`): while the global context is fetching, tables render empty table states ("No records match...") before abruptly populating.
3. **Severe Network & Layout Bottlenecks on Marketing Pages**:
   - In `public/assets/`, three large raster graphics are loaded on public pages:
     - `public/assets/bispecific antibodies 1.png`: **7.57 MB**
     - `public/assets/monoclonal antibodies 1.png`: **7.56 MB**
     - `public/assets/nucleic acids 1.png`: **7.23 MB**
   - Combining these uncompressed 7.5 MB PNGs creates over **22.3 MB** of asset payload on routes serving them.
   - Furthermore, `app/(marketing)/page.tsx` line 149 uses an empty string `sizes=""` on an Next.js `<Image fill>`, breaking responsive srcset calculation and forcing the browser to fetch maximum resolution desktop assets on all viewports.
4. **Database & API Query Inefficiencies**:
   - Lack of indexed queries on `dataset_type`, `status`, and `created_at` on large tables (`drugs`, `subscriptions`, `access_requests`).
   - Portal drug queries (`fetchPortalDrugsAction()`) fetch the entire multi-thousand row table with `SELECT *` without pagination limits, causing client-side memory bloat and UI freezing during filtering.
   - Subscription listing (`fetchSubscriptionsAction()`) executes a manual two-step in-memory join between `subscriptions` and `profiles` instead of using Postgres Foreign Key relations.

---

## 2. Overall Website Performance Findings

### [ISSUE-WEB-01] Massive Uncompressed Marketing Image Assets (22+ MB)
- **Priority:** Critical
- **Category:** General Website / Frontend
- **Affected files:**
  - `public/assets/bispecific antibodies 1.png` (7.57 MB)
  - `public/assets/monoclonal antibodies 1.png` (7.56 MB)
  - `public/assets/nucleic acids 1.png` (7.23 MB)
  - `app/(marketing)/page.tsx`
- **Problem:** Several marketing graphics deployed in `public/assets` exceed 7 MB each. If loaded, a single user visit pulls down over 22 MB of uncompressed raster PNG data.
- **Impact:** Drastic drop in Google Lighthouse Performance score (< 30), severe Largest Contentful Paint (LCP) delays (> 6-10s on 4G networks), high bandwidth consumption, and page jank.
- **Root cause:** Raw high-resolution production art files (PNG-24) placed directly in the static public folder without WebP/AVIF modern compression or downscaling.
- **Recommended solution:**
  1. Compress and convert images to modern `.webp` or `.avif` format at 1200px max width and 82% quality (reducing size from 7.5 MB to ~120 KB each — a >98% byte reduction).
  2. Ensure all `<Image>` tags declare explicit `sizes="(max-width: 768px) 100vw, 50vw"` to let Next.js image optimization serve appropriate screen resolutions.
- **Evidence:**
  `Get-ChildItem -Path public\assets` confirms file lengths of `7,570,960` bytes, `7,555,937` bytes, and `7,233,530` bytes.

---

### [ISSUE-WEB-02] Broken `sizes` Attribute on Next.js Hero / Strategic Leadership Images
- **Priority:** High
- **Category:** Frontend / General Website
- **Affected files:**
  - `app/(marketing)/page.tsx` (Line 148)
- **Problem:** The `<Image>` component for the strategic leadership banner provides `sizes=""`:
  ```tsx
  <Image
    src={strat.image || "/assets/Picture1.png"}
    alt={strat.image_alt || "Advancing drug delivery and biologics commercialization"}
    fill
    sizes=""
    className="object-contain object-center w-[50%]"
  />
  ```
- **Impact:** Next.js uses `sizes` to generate `srcset` hints. An empty `sizes=""` violates the HTML specification, causing browsers to either ignore srcset and download the largest desktop asset or trigger layout shifts (CLS).
- **Root cause:** Incomplete image migration during layout implementation.
- **Recommended solution:** Replace `sizes=""` with a correct viewport breakpoint string, e.g.:
  `sizes="(max-width: 1024px) 100vw, 50vw"`.
- **Evidence:** `app/(marketing)/page.tsx:148`.

---

### [ISSUE-WEB-03] Full Client-Side Loading of Unbounded Portal Datasets
- **Priority:** High
- **Category:** Frontend / API
- **Affected files:**
  - `app/portal/page.tsx` (Lines 50–86)
  - `app/portal/db1/page.tsx` (Lines 23–48)
  - `app/portal/db2/page.tsx` (Lines 12–37)
  - `app/admin/drug-actions.ts` (`fetchPortalDrugsAction`)
- **Problem:** The subscriber portal fetches the complete dataset of drugs into client memory (`fetchPortalDrugsAction()`) upon mounting. All searching, filtering by route/phase/volume/indication, and pagination (`ITEMS_PER_PAGE = 10`) occur inside the browser via client-side JavaScript.
- **Impact:** As the database grows to hundreds or thousands of records, initial page load latency scales linearly with database size. Memory footprint in the browser causes mobile devices to experience frame drops and scrolling lag.
- **Root cause:** Lack of server-side pagination and query parameter filtering on the database level.
- **Recommended solution:**
  1. Refactor `fetchPortalDrugsAction` to accept `{ page, pageSize, search, filters }`.
  2. Implement Supabase server-side `.range((page - 1) * pageSize, page * pageSize - 1)` with database `ilike` and `eq` filtering.
  3. Return `{ data, totalCount, page, totalPages }` to client components.
- **Evidence:** `app/portal/page.tsx:54`: `const result = await fetchPortalDrugsAction();` fetching all records unconditionally.

---

## 3. Admin Panel Audit

### [ISSUE-ADMIN-01] Monolithic Global State Hydration on Admin Root
- **Priority:** Critical
- **Category:** Admin Panel / Frontend / Architecture
- **Affected files:**
  - `components/admin/admin-context.tsx` (Lines 139–158)
  - `components/admin/admin-layout-shell.tsx`
  - `app/admin/page.tsx`
- **Problem:** When any page under `/admin/*` loads (e.g. `/admin`, `/admin/content`, `/admin/drugs`, `/admin/users`, `/admin/subscriptions`, `/admin/imports`), `AdminProvider` executes an eager `Promise.all` fetching four massive global datasets simultaneously:
  ```ts
  const [drugsResponse, usersResponse, subscriptionsResponse, accessRequestsResponse] = await Promise.all([
    fetchDrugsAction(),
    fetchUsersAction(),
    fetchSubscriptionsAction(),
    fetchAccessRequestsAction()
  ]);
  ```
- **Impact:**
  - Every single route in the admin panel waits for ALL four database tables to be queried and transferred before the page becomes interactive or populates.
  - If an administrator merely wants to edit a typo in `/admin/content` or inspect an import job in `/admin/imports`, the browser needlessly downloads the entire `drugs` table, `profiles` table, `subscriptions` table, and `access_requests` table.
  - Multiplies database egress costs and network latency by 4x on every admin page load.
- **Root cause:** Over-centralization of data fetching inside a single top-level React Context provider rather than co-locating data requirements within their respective route page components or React Server Components.
- **Recommended solution:**
  1. De-couple page-specific data fetching from `admin-context.tsx`.
  2. Convert admin pages (`/admin`, `/admin/drugs`, `/admin/users`, `/admin/subscriptions`) into React Server Components or use route-level data hooks (e.g., SWR or TanStack Query) so that `/admin/drugs` only fetches drugs, `/admin/users` only fetches users, etc.
  3. In `AdminDashboardPage` (`/admin`), create a lightweight aggregated stats query (`getAdminDashboardMetricsAction()`) that returns counts (`COUNT(*)`) instead of downloading thousands of full drug row payloads just to calculate `.length`.
- **Evidence:** Lines 139–158 in `components/admin/admin-context.tsx`.

---

### [ISSUE-ADMIN-02] Admin Dashboard Calculates High-Level Metrics by Fetching and Counting Entire Tables Client-Side
- **Priority:** High
- **Category:** Admin Panel / Database / API
- **Affected files:**
  - `app/admin/page.tsx` (Lines 24–43)
  - `components/admin/admin-context.tsx`
- **Problem:** The admin overview dashboard calculates KPI metrics by running JavaScript array `.filter()` calls in the browser:
  ```ts
  const totalDb1 = drugs.filter((d) => d.dataset_type === "DB1").length;
  const totalDb2 = drugs.filter((d) => d.dataset_type === "DB2").length;
  const pendingRequests = accessRequests.filter((r) => r.status === "pending").length;
  const activeDb1Subs = subscriptions.filter(
    (s) => s.dataset_type === "DB1" && s.status === "active"
  ).length;
  ```
- **Impact:** Huge network bandwidth wastage and computation overhead. To show four numbers on the screen (e.g., `totalDb1 = 120`), the client receives megabytes of detailed drug columns (pharmacology, indications, doses, device formulation, created dates) across the wire.
- **Root cause:** Dashboard UI lacks a dedicated aggregation API endpoint or RPC.
- **Recommended solution:**
  Create a single optimized Postgres query or server action:
  ```sql
  SELECT 
    COUNT(*) FILTER (WHERE dataset_type = 'DB1') as total_db1,
    COUNT(*) FILTER (WHERE dataset_type = 'DB2') as total_db2
  FROM drugs;
  ```
  Supabase provides `.select('*', { count: 'exact', head: true })` which returns only the integer count header with 0 rows transferred.
- **Evidence:** `app/admin/page.tsx:25–43`.

---

### [ISSUE-ADMIN-03] In-Memory N+1 Join Pattern in `fetchSubscriptionsAction`
- **Priority:** High
- **Category:** Backend / Database / Admin Panel
- **Affected files:**
  - `app/admin/subscription-actions.ts` (Lines 41–73)
- **Problem:** In `fetchSubscriptionsAction()`, subscriptions are fetched with `SELECT * FROM subscriptions`. Then, the action loops through the returned rows to collect `uniqueUserIds`, and executes a second query against `profiles` with `.in("id", uniqueUserIds)`:
  ```ts
  const { data, error } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false });
  // ... collects uniqueUserIds ...
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, email, company_name")
    .in("id", uniqueUserIds);
  ```
- **Impact:** Sequential blocking round-trips to the database. If there are 1,000 subscriptions with hundreds of distinct IDs, the `.in()` clause query payload grows excessively large and bypasses database foreign key joins.
- **Root cause:** Failure to utilize Supabase PostgREST relational foreign key joins in the initial `select()` statement.
- **Recommended solution:**
  Define the foreign key relationship in Supabase and execute a single joined query:
  ```ts
  const { data, error } = await supabase
    .from("subscriptions")
    .select(`
      id,
      dataset_type,
      status,
      starts_at,
      expires_at,
      renewal_date,
      admin_notes,
      created_at,
      profiles:user_id (id, full_name, email, company_name)
    `)
    .order("created_at", { ascending: false });
  ```
- **Evidence:** `app/admin/subscription-actions.ts:41–73`.

---

### [ISSUE-ADMIN-04] Fixed Hardcoded Date in Expiring Subscriptions Calculation
- **Priority:** Medium
- **Category:** Admin Panel / Frontend Logic
- **Affected files:**
  - `app/admin/page.tsx` (Line 39)
  - `app/admin/subscriptions/page.tsx` (Line 270)
- **Problem:** Both dashboard and subscription management calculate "expiring soon" subscriptions using a hardcoded past date:
  ```ts
  const now = new Date("2026-10-26").getTime();
  const diffDays = (expiry - now) / (1000 * 3600 * 24);
  return diffDays > 0 && diffDays <= 60;
  ```
- **Impact:** Miscalculates subscription expiry status relative to real-time clock. Any subscriptions expiring in the current month or future will be compared against a static date from October 2026, leading to false alerts or missed renewals.
- **Root cause:** Leftover demo timestamp that was not replaced with `Date.now()`.
- **Recommended solution:** Replace `new Date("2026-10-26").getTime()` with `Date.now()`.
- **Evidence:** `app/admin/page.tsx:39` and `app/admin/subscriptions/page.tsx:270`.

---

### [ISSUE-ADMIN-05] Sequential Sub-Queries in Spreadsheet Bulk Import Processing
- **Priority:** High
- **Category:** Backend / Database / Admin Panel
- **Affected files:**
  - `lib/import/database.ts` (Lines 182–257)
- **Problem:** In `insertDrugsInBatches()`, when processing spreadsheet rows:
  1. The function fetches all existing drugs into memory via `getExistingDrugs(datasetType)` (`SELECT id, drug_name, company FROM drugs`).
  2. It inserts new drugs in batches.
  3. Then, inside an inner loop over the inserted drugs (`for (const refData of batchReferences)`), it calls `await insertDrugReferences(matchedDrug.id, refsToInsert)` for each drug one-by-one.
- **Impact:** Inserting a 500-row spreadsheet with references triggers hundreds of sequential database roundtrips for references. This can cause the server action to hit serverless execution timeouts (10s/15s timeout on Vercel/Node).
- **Root cause:** N-query pattern for reference insertions rather than a single bulk batch insert of all reference records.
- **Recommended solution:**
  Accumulate all references across the entire batch into a single flat array:
  ```ts
  const allReferencesToInsert = [];
  // Populate allReferencesToInsert with { drug_id: matchedDrug.id, reference_value, ... }
  await client.from("drug_references").insert(allReferencesToInsert);
  ```
  Perform one bulk insert per batch.
- **Evidence:** `lib/import/database.ts:233–257`.

---

## 4. Loading States & Skeleton UI Audit

### [ISSUE-UX-01] Dashboard KPI Statistics Display "0" Prior to Data Arrival
- **Priority:** Critical
- **Category:** Loading States / UX / Admin Panel
- **Affected files:**
  - `app/admin/page.tsx` (Lines 82, 105, 128, 154)
  - `components/admin/admin-context.tsx` (Lines 100–104)
- **Problem:** 
  In `admin-context.tsx`, state arrays are initialized as empty arrays:
  ```ts
  const [drugs, setDrugs] = useState<AdminDrug[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  ```
  In `app/admin/page.tsx`, metrics are derived synchronously:
  ```ts
  const totalDb1 = drugs.filter((d) => d.dataset_type === "DB1").length; // Evaluates to 0
  const totalDb2 = drugs.filter((d) => d.dataset_type === "DB2").length; // Evaluates to 0
  const pendingRequests = accessRequests.filter((r) => r.status === "pending").length; // Evaluates to 0
  ```
  While the async `Promise.all` inside `hydrateAuth()` is running, the page renders immediately and displays:
  - DB1 Subcutaneous: **0 records**
  - DB2 Injectables: **0 records**
  - Pending Access Requests: **0 Needs review**
  - Active Subscriptions: **0 (DB1: 0 | DB2: 0)**
- **Impact:** Severe UX degradation. The user is misled into thinking there are 0 records in the system or that data has failed to load, until the counters suddenly "jump" to their actual values several seconds later.
- **Root cause:** Lack of an explicit `isLoading` state in `AdminContext` and lack of skeleton placeholders in the KPI cards.
- **Recommended solution:**
  1. Add `isLoadingData: boolean` to `AdminContext` (true initially, set to false in `finally` of `hydrateAuth`).
  2. In `app/admin/page.tsx`, render animated pulse skeleton blocks (`<div className="h-8 w-16 bg-slate-200 animate-pulse rounded" />`) when `isLoadingData` is true, replacing the `0` counter.
- **Evidence:** `app/admin/page.tsx:82, 105, 128, 154`.

---

### [ISSUE-UX-02] Tables Flash "No Records Found" Empty State During Data Retrieval
- **Priority:** High
- **Category:** Loading States / UX / Admin Panel
- **Affected files:**
  - `app/admin/drugs/page.tsx` (Lines 332–336)
  - `app/admin/users/page.tsx` (Lines 198–202)
  - `app/admin/subscriptions/page.tsx` (Lines 252–260)
  - `app/admin/page.tsx` (Lines 194–198)
- **Problem:**
  In all three admin management tables, when data has not yet finished loading, `filteredDrugs.length === 0` (or `filteredRequests.length === 0`, `filteredSubscriptions.length === 0`) evaluates to `true`.
  The tables immediately render:
  ```tsx
  <tr>
    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
      No DB1 drug records match the current filters.
    </td>
  </tr>
  ```
  Similarly on the dashboard:
  ```tsx
  <p className="py-6 text-center text-xs text-slate-400">
    No pending access requests at this time.
  </p>
  ```
- **Impact:** Misrepresents actual system state. Administrators see a flash of "No records match" or "No pending requests", leading them to assume there is no work to do, until records suddenly snap into place.
- **Root cause:** Tables do not distinguish between an initial `loading` state, an `empty` state (0 records in DB), and an `active filtered` state.
- **Recommended solution:**
  Introduce table skeleton rows:
  ```tsx
  {isLoadingData ? (
    Array.from({ length: 6 }).map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-4 py-3"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
        <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
        <td className="px-4 py-3"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
        <td className="px-4 py-3"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
        <td className="px-4 py-3"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
        <td className="px-4 py-3"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
        <td className="px-4 py-3 text-right"><div className="h-4 w-12 bg-slate-200 rounded ml-auto" /></td>
      </tr>
    ))
  ) : filteredDrugs.length === 0 ? (
    // Real empty state
  ) : (
    // Real data rows
  )}
  ```
- **Evidence:** `app/admin/drugs/page.tsx:332–336`, `app/admin/users/page.tsx:198–202`, `app/admin/subscriptions/page.tsx:252–260`.

---

### [ISSUE-UX-03] Full Screen Blocking "Verifying Session..." Overlay Causes Flash
- **Priority:** Medium
- **Category:** Loading States / UX
- **Affected files:**
  - `components/admin/admin-layout-shell.tsx` (Lines 50–68)
- **Problem:**
  `admin-layout-shell.tsx` displays a full-screen spinner for 100ms:
  ```tsx
  React.useEffect(() => {
    const timer = setTimeout(() => setIsHydrating(false), 100);
    return () => clearTimeout(timer);
  }, []);
  ```
  After 100ms, `isHydrating` becomes false, but `admin-context.tsx` is still fetching the actual session via `supabase.auth.getUser()`. If the user is unauthenticated, it flips to `AdminLoginCard`; if authenticated, it mounts the dashboard which displays "0 records" while still loading.
- **Impact:** An artificial visual flicker (100ms full screen spinner -> white flash -> dashboard showing 0s -> populated data).
- **Root cause:** Arbitrary `setTimeout` timer instead of tying loading state directly to the actual Supabase session resolution promise.
- **Recommended solution:**
  Tie `isHydrating` directly to `isHydrated` state in `admin-context.tsx`. Do not render children until authentication is verified, and once verified, mount the layout shell with skeleton inner components rather than full-screen blank spinners.
- **Evidence:** `components/admin/admin-layout-shell.tsx:50–68`.

---

### [ISSUE-UX-04] Full-Page Blocking Spinner in Website Content Editor (`/admin/content`)
- **Priority:** Medium
- **Category:** Loading States / UX / Admin Panel
- **Affected files:**
  - `app/admin/content/page.tsx` (Lines 180–192)
- **Problem:**
  While loading website content on `/admin/content`, the entire UI is replaced with a single centered spinner:
  ```tsx
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-[#135C70]/30 border-t-[#135C70] rounded-full animate-spin" />
        <p className="text-xs text-[#637786]">Loading website content & publications...</p>
      </div>
    );
  }
  ```
- **Impact:** Replaces the tab navigation, header, and structure with an unstyled spinner, causing layout shift and preventing the admin from seeing which tab they are on.
- **Root cause:** Full-page conditional rendering instead of inline skeleton form inputs.
- **Recommended solution:** Retain the page header and tab bar, and render skeleton form input placeholders inside the active tab panel.
- **Evidence:** `app/admin/content/page.tsx:180–192`.

---

## 5. API & Database Investigation

### [ISSUE-DB-01] Absence of Explicit Database Indexes on High-Frequency Filters
- **Priority:** High
- **Category:** Database / Backend
- **Affected files:**
  - `supabase/migrations/`
  - `app/admin/drug-actions.ts`
  - `app/admin/subscription-actions.ts`
  - `app/admin/access-request-actions.ts`
- **Problem:**
  Inspecting the migration files and queries reveals frequent queries filtering and ordering by:
  - `drugs`: `dataset_type`, `created_at` (line 59 in `drug-actions.ts`)
  - `subscriptions`: `user_id`, `status`, `expires_at`, `created_at` (line 44 in `subscription-actions.ts`)
  - `access_requests`: `status`, `created_at` (line 166 in `access-request-actions.ts`)
  - `profiles`: `role`, `approval_status` (line 576 in `drug-actions.ts`)
  No corresponding composite indexes are defined in migrations for these columns.
- **Impact:** In PostgreSQL, queries on unindexed columns default to sequential table scans (`Seq Scan`). As the drug dataset and subscriber tables grow, every filter, status check, and order operation degrades from $O(\log N)$ to $O(N)$ disk I/O operations.
- **Root cause:** Database tables were created without indexing strategy for filter and sort attributes.
- **Recommended solution:**
  Apply the following indexes via a new migration:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_drugs_dataset_created ON public.drugs(dataset_type, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);
  CREATE INDEX IF NOT EXISTS idx_access_requests_status_created ON public.access_requests(status, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON public.profiles(role, approval_status);
  ```
- **Evidence:** Queries in `app/admin/drug-actions.ts:59`, `app/admin/subscription-actions.ts:44`, `app/admin/access-request-actions.ts:166`.

---

### [ISSUE-DB-02] Redundant Verification Queries on Every Server Action
- **Priority:** Medium
- **Category:** Backend / API
- **Affected files:**
  - `app/admin/drug-actions.ts` (Lines 559–605)
  - `app/admin/access-request-actions.ts` (Lines 490–520)
  - `lib/supabase/admin-auth.ts`
- **Problem:** In `fetchPortalDrugsAction()`, the server action executes 3 sequential roundtrips before fetching a single drug:
  1. `await supabase.auth.getUser()` (network roundtrip to Supabase Auth API)
  2. `await supabase.from("profiles").select(...).eq("id", user.id).single()` (Postgres query 1)
  3. `await supabase.from("subscriptions").select(...).eq("user_id", user.id)` (Postgres query 2)
  4. `await supabase.from("drugs").select("*").in(...)` (Postgres query 3)
- **Impact:** Each subscriber portal drug query suffers a minimum penalty of 3 database roundtrips plus 1 auth validation roundtrip (~200ms–600ms network latency aggregate) before data can be streamed to the client.
- **Root cause:** Permissions and entitlements are checked via multi-step application code instead of using PostgreSQL Row Level Security (RLS) policies or a consolidated SQL stored procedure/view.
- **Recommended solution:**
  1. Leverage PostgreSQL RLS to encode the subscription check directly into the `drugs` table security policy, allowing a single `SELECT * FROM drugs` query that automatically filters to allowed datasets based on `auth.uid()`.
  2. Alternatively, combine profiles and active subscriptions into a single helper view (`v_user_entitlements`).
- **Evidence:** Lines 559–642 in `app/admin/drug-actions.ts`.

---

### [ISSUE-DB-03] Unnecessary `SELECT *` Returning Unused Heavy Columns
- **Priority:** Medium
- **Category:** Database / Backend
- **Affected files:**
  - `app/admin/drug-actions.ts` (Line 58, Line 639)
- **Problem:**
  Both `fetchDrugsAction()` and `fetchPortalDrugsAction()` perform `SELECT * FROM drugs`.
  The `drugs` table includes large text columns (`pharmacology`, `device_formulation`, `indication`, etc.).
  When rendering the admin dashboard overview (`/admin`) or the summary table views, only `id`, `drug_name`, `company`, `dataset_type`, and `phase` are required.
- **Impact:** Excessive data transfer (bandwidth consumption) and slower JSON serialization between PostgreSQL, Node.js server action, and browser client.
- **Root cause:** Generalized wildcard selection instead of projecting required column fields.
- **Recommended solution:**
  Specify explicit column projections for list views:
  `select("id, drug_name, company, partner, dataset_type, route, phase, est_sc_volume_ml, created_at")`.
- **Evidence:** `app/admin/drug-actions.ts:58`.

---

## 6. Prioritization & Summary Matrix

| ID | Title | Priority | Category | Estimated Impact |
|---|---|---|---|---|
| **ISSUE-ADMIN-01** | Monolithic Global State Hydration on Admin Root | **Critical** | Admin Panel / Architecture | Massive delay on every admin route |
| **ISSUE-UX-01** | Dashboard KPI Statistics Display "0" Prior to Data Arrival | **Critical** | Loading States / UX | Visual illusion that dashboard is empty |
| **ISSUE-WEB-01** | Massive Uncompressed Marketing Image Assets (22+ MB) | **Critical** | General Website / Frontend | Extreme LCP and mobile data consumption |
| **ISSUE-UX-02** | Tables Flash "No Records Found" Empty State During Loading | **High** | Loading States / UX | Jarring flicker and misleading empty state |
| **ISSUE-ADMIN-02** | Dashboard Calculates Metrics by Downloading Full Datasets | **High** | Admin Panel / Database | Megabytes of unnecessary payload transfer |
| **ISSUE-ADMIN-03** | In-Memory N+1 Join in `fetchSubscriptionsAction` | **High** | Backend / Database | Multiple sequential network roundtrips |
| **ISSUE-DB-01** | Missing Database Indexes on High-Frequency Filters | **High** | Database | Slow sequential table scans as records grow |
| **ISSUE-WEB-03** | Full Client-Side Loading of Unbounded Portal Datasets | **High** | Frontend / API | Laggy search & high browser memory usage |
| **ISSUE-WEB-02** | Broken `sizes=""` Attribute on Strategic Image | **High** | Frontend | Responsive image optimization disabled |
| **ISSUE-ADMIN-05** | Sequential Sub-Queries in Spreadsheet Bulk Import | **High** | Admin Panel / Backend | Risk of serverless timeout on bulk imports |
| **ISSUE-UX-03** | Full Screen Blocking "Verifying Session..." 100ms Flash | **Medium** | Loading States / UX | Visual jumpiness during session check |
| **ISSUE-UX-04** | Full-Page Blocking Spinner in Website Content Editor | **Medium** | Loading States / UX | Layout shift on `/admin/content` |
| **ISSUE-ADMIN-04** | Hardcoded Date in Expiring Subscriptions Calculation | **Medium** | Admin Panel | Inaccurate 60-day expiry counts |
| **ISSUE-DB-02** | Redundant Multi-Hop Verification Queries | **Medium** | Backend / API | 200–600ms latency on portal drug fetches |
| **ISSUE-DB-03** | Unnecessary `SELECT *` on List Views | **Medium** | Database / API | Slower JSON parsing and payload bloat |

---

## 7. Suggested Order of Implementation

To resolve these issues systematically with minimal risk of regressions, the recommended phased execution plan is:

### Phase 1: High-Impact UX & Loading States (Zero-Risk UI Layer)
1. **Add `isLoading` and Skeleton UI to Admin Dashboard KPI Cards (`/admin`)**:
   - Introduce pulse skeleton placeholders for `totalDb1`, `totalDb2`, `pendingRequests`, and `activeSubscriptions`.
   - Prevent counters from displaying `0` during network fetches.
2. **Add Skeleton Rows to Admin Tables (`/admin/drugs`, `/admin/users`, `/admin/subscriptions`)**:
   - Replace premature "No records found" empty states with 5–8 animated skeleton table rows.
3. **Smooth Session Verification in `admin-layout-shell.tsx`**:
   - Eliminate arbitrary `setTimeout` delays and avoid jarring full-screen spinners.

### Phase 2: Static Asset & Frontend Optimization (Immediate Page Speed Wins)
4. **Compress and Modernize Public Assets (`public/assets`)**:
   - Convert the three 7.5 MB PNGs (`bispecific antibodies 1.png`, `monoclonal antibodies 1.png`, `nucleic acids 1.png`) to WebP/AVIF (< 150 KB each).
5. **Fix Responsive Image `sizes`**:
   - Update `sizes=""` in `app/(marketing)/page.tsx` line 148 to appropriate responsive breakpoints.

### Phase 3: Architectural Decoupling & Server-Side Optimization (Admin & Portal)
6. **Decouple Monolithic `AdminProvider` Fetching**:
   - Remove the four-way `Promise.all` in `admin-context.tsx`.
   - Co-locate data loading directly within route page components or implement lightweight data-fetching hooks per page.
7. **Create Aggregated Metrics Server Action for Admin Dashboard**:
   - Replace full dataset downloads in `/admin` with a lightweight SQL count action (`COUNT(*)` via Supabase head query).
8. **Add Server-Side Pagination & Filtering to Portal**:
   - Update `fetchPortalDrugsAction` to support `{ page, limit, search, filters }` using Supabase `.range()`.

### Phase 4: Database Indexing & Query Cleanup
9. **Apply Database Indexes via Migration**:
   - Index `dataset_type`, `status`, `user_id`, and `created_at` across `drugs`, `subscriptions`, and `access_requests`.
10. **Refactor Relational Joins & Bulk Inserts**:
    - Replace the two-step in-memory user lookup in `subscription-actions.ts` with a PostgREST relational join.
    - Batch reference insertions during spreadsheet import in `lib/import/database.ts`.
    - Fix the hardcoded date in subscription expiry calculation (`app/admin/page.tsx`).

---

## 8. Verification & Profiling Notes

- **Production / Staging Profiling**:
  Because the local sandbox environment operates without real-time production analytics and with mock/sample database records, measuring exact millisecond query latency at scale (e.g. 100,000+ drug records) requires executing `EXPLAIN ANALYZE` directly within the Supabase SQL Editor in staging or production.
- **No Existing Code Was Modified**:
  As mandated by the audit instructions, all findings above represent observational inspection and static analysis. All source code and database migrations remain completely untouched.

