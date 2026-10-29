# Task: Implement a Fully Dynamic Drug Data Importer in the Existing Admin CMS

## Project Context

I have an existing Next.js website for Chesapeake Pharma LLC, built with Next.js, Tailwind CSS, and Supabase.

The admin dashboard already contains a demo/static bulk-upload workflow with multiple steps. I want to preserve the existing UI, layout, step sequence, and user experience while replacing all static/demo behavior with a fully functional, database-connected drug importer.

**Important: Do not use mock drug data, hardcoded sample records, or placeholder import results.** Actual drug data must come from CSV/XLSX files uploaded through this feature.

## 1. Two Independent Drug Datasets

The application manages two separate datasets:

- **Database 1:** Approximately 300+ drug records.
- **Database 2:** Approximately 3,500+ drug records.

Both datasets use the existing `public.drugs` table and are distinguished using its `dataset_type` column.

Use the actual values already defined in the database schema and existing application code for `dataset_type`. Do not invent new dataset identifiers or create a separate table for the second dataset.

The administrator must select the target dataset before starting an import. Every imported row must be assigned to that dataset.

The importer must never accidentally mix records between datasets.

## 2. Preserve the Existing Multi-Step UI

First, inspect the current bulk-upload/import interface and its existing step-by-step workflow.

Keep the existing visual design, components, navigation between steps, styling, and general user experience. Replace the underlying static behavior with real functionality.

Do not redesign the page unnecessarily or create a separate importer that duplicates the existing interface.

Each step must reflect the actual uploaded file, column mappings, validation results, and import progress.

## 3. File Upload and Parsing

Support:

- CSV files.
- Excel `.xlsx` files.
- Clear file selection and replacement.
- File name, size, and detected row/column counts.
- Appropriate loading, validation, and error states.

Parse the uploaded file dynamically. Do not assume a fixed number of rows, a fixed set of columns, or a predefined column order.

The uploaded file may contain hundreds or thousands of records.

Validate file types and handle malformed files, empty files, blank rows, duplicate headers, missing values, and invalid cell values gracefully.

Do not send the entire file to the browser as one enormous database request. Process imports in manageable batches and provide meaningful progress feedback.

## 4. Dynamic Column Detection and Mapping

This is a critical requirement.

The two datasets have different column structures. Some fields overlap, while others may only exist in one dataset. Incoming spreadsheet headers may also differ from the database column names.

Build a dynamic column-mapping step that:

1. Reads the actual column headers from the uploaded file.
2. Retrieves or uses the actual supported destination columns for `public.drugs`.
3. Attempts to suggest mappings based on normalized header names and aliases.
4. Allows the administrator to change every suggested mapping.
5. Allows an uploaded column to be ignored.
6. Allows optional database fields to remain empty when the spreadsheet does not contain them.
7. Clearly identifies required fields that have no mapping.
8. Shows which fields will be imported and which will be skipped.

For example, a spreadsheet might use `Drug Name`, while the database uses `drug_name`. The importer may suggest a mapping, but the administrator must be able to correct it.

Do not require every optional database field to be present in every spreadsheet.

Do not create new database columns automatically from arbitrary spreadsheet headers. Only map to supported destination fields unless an explicit schema change is separately approved.

**Column mapping must be driven by the actual file and existing schema, not a hardcoded list of spreadsheet columns.**

## 5. Data Preview and Validation

Before importing, show a preview based on the actual uploaded file and selected mappings.

Include:

- A preview of the mapped data.
- Total detected rows.
- Valid rows.
- Invalid rows.
- Duplicate or potentially duplicate records.
- Missing required fields.
- Field conversion and formatting errors.

Validate values against the actual database schema, including field types, allowed values, nullability, and constraints where applicable.

For example, numeric columns must be converted safely, text values must not be inserted into numeric fields, and invalid dataset values must be rejected.

Do not silently discard invalid data or claim that an import succeeded when records failed.

Give the administrator a clear way to review errors and return to the mapping step.

## 6. Duplicate Handling and Import Safety

Inspect the existing database schema to determine whether a reliable unique drug identifier or uniqueness constraint already exists.

Do not invent a unique key or assume that drug names are always unique.

Provide an appropriate duplicate-handling strategy based on the actual schema. If reliable duplicate detection is not possible, explain that limitation and allow the administrator to review potential duplicates before proceeding.

Never delete existing drug records as part of a normal import.

Do not overwrite existing records automatically unless the administrator has explicitly selected an appropriate update strategy and the matching criteria are reliable.

The administrator should be able to understand whether the import will insert new records, update matching records, skip duplicates, or reject invalid rows before confirming.

## 7. Import Execution

After the administrator confirms the preview and validation results:

1. Insert valid records into the existing `public.drugs` table.
2. Set the correct `dataset_type` for every inserted record.
3. Respect the existing database schema, defaults, constraints, and row-level security policies.
4. Process records in manageable batches.
5. Track successful, skipped, and failed records accurately.
6. Provide progress feedback and a final import summary.

Do not report success based only on a successful file upload or parsing operation. Success must reflect the actual database write results.

Handle partial failures carefully. If a batch fails, report which records or batches failed and provide enough information to resolve the problem without blindly repeating successful inserts.

Avoid duplicate imports when a user retries an interrupted operation. Use a reliable idempotency or reconciliation strategy where feasible, based on the existing schema.

## 8. Import History and Existing Database Tables

Inspect the existing `public.import_jobs` table and use it to track import activity if its current schema supports the required information.

Record relevant details such as:

- Importing administrator.
- Target dataset.
- Original file name.
- Start and completion times.
- Total rows processed.
- Inserted, skipped, and failed row counts.
- Import status.
- Useful error information.

Adapt to the actual existing table definition. Do not assume columns exist without checking.

If additional fields or schema changes are genuinely required, explain the proposed changes before implementing them.

## 9. Security and Permissions

The importer is an administrator-only feature.

Reuse the existing Supabase authentication and admin authorization implementation. Verify that the current authenticated user has an approved administrator profile before permitting imports.

Do not rely on hiding UI buttons or protecting routes only on the client side.

All database writes must respect the existing RLS policies and permissions. Do not disable RLS or weaken the existing security policies to make importing easier.

Never expose the Supabase service-role key in browser code or `NEXT_PUBLIC_` environment variables.

If a trusted server-side operation is necessary, implement it using an appropriately secured server-side workflow. Do not introduce a separate Express backend.

## 10. Database Schema and Field Compatibility

Use the existing `public.drugs` schema, which includes fields such as:

- `dataset_type`
- `drug_name`
- `company`
- `partner`
- `route`
- `iv_shift_nce`
- `type`
- `device_formulation`
- `dose`
- `iv_dose_mg`
- `sc_dose_mg`
- `est_sc_volume_ml`
- `frequency`
- `phase`
- `pharmacology`
- `indication`
- `field`
- `entry_date`
- `updated_at`

This is a reference to the known fields, not a complete or exclusive list. Inspect the actual schema and support other existing importable fields where appropriate.

Respect database-managed fields, generated IDs, defaults, timestamps, foreign keys, and constraints. Do not allow spreadsheet input to override protected system-managed fields such as generated IDs or administrator-controlled metadata.

If the two datasets require different field mappings, support those differences through the mapping configuration rather than maintaining two unrelated hardcoded import implementations.

## 11. Implementation Requirements

- Use the existing Next.js architecture and Supabase clients.
- Reuse existing components and styles.
- Inspect the actual file structure and current importer implementation before editing.
- Do not introduce mock drug data or mock import outcomes.
- Do not rebuild the authentication system.
- Do not create duplicate database tables unnecessarily.
- Do not modify unrelated pages.
- Do not introduce a separate Express backend.
- Keep file parsing, validation, database operations, and UI responsibilities cleanly separated.
- Provide proper loading, empty, success, warning, and error states.
- Ensure the implementation works with both datasets and differing spreadsheet columns.

## 12. Acceptance Criteria

The feature is complete only when:

1. An administrator can select either dataset.
2. The administrator can upload a real CSV or XLSX file.
3. The system detects the actual headers and row count.
4. The administrator can map, ignore, and adjust columns dynamically.
5. Optional columns can be absent without breaking the import.
6. Required fields and invalid values are validated before importing.
7. The preview displays actual uploaded data, not sample records.
8. The administrator can confirm and execute the import.
9. Valid records are written to the correct dataset in Supabase.
10. Errors and partial failures are reported accurately.
11. Import results and history reflect actual database operations.
12. Existing drug records are not accidentally deleted or overwritten.
13. The importer remains restricted to authorized administrators.
14. The existing multi-step design is preserved.
15. Both datasets work despite having different column structures.

## Working Approach

First inspect the existing importer, Supabase schema, RLS policies, `import_jobs` definition, and authentication helpers.

Then implement the feature within the existing architecture, keeping changes focused on the importer.

Do not stop at a visual implementation or a simulated import. Complete the actual upload, parsing, mapping, validation, database insertion, and result reporting workflow.

At the end, summarize the files changed, any required SQL migrations, the import strategy, and the tests performed. Clearly identify anything that could not be verified.