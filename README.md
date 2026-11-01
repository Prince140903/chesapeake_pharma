# Chesapeake Pharma LLC

This is the first reviewable MVP slice for the Chesapeake Pharma drug-delivery consulting website and private database portal.

## Included in this checkpoint

The implementation includes responsive public marketing routes, supplied wordmark usage, mobile navigation, contact-form validation states, demo-safe login/request-access/reset/pending screens, a table-first DB1/DB2 portal preview, an admin overview preview, dataset-specific demo records, and the complete page route manifest.

## Demo mode boundary

Supabase is not connected in this checkpoint. The project does not contain production credentials, a reviewed external schema, or approved RLS policies. Portal data is illustrative and clearly labeled. Login, registration, email delivery, subscriptions, exports, imports, and administrator mutations are not claimed to be operational.

Copy `.env.example` to a local environment only after receiving the approved Supabase project URL and publishable key through the secure project configuration flow. Do not place a service-role key in browser code. Before enabling real access, review the existing `drugs`, `drug_references`, `profiles`, `subscriptions`, and `import_jobs` tables, functions, policies, and the stable import matching key.

## Development

```bash
pnpm install
pnpm dev
```

Checks:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

The app uses Next.js App Router, React, TypeScript, Tailwind CSS, Lucide icons, React Hook Form/Zod dependencies, and a typed repository boundary ready for the Supabase implementation.


I found a bug in website. Where client login is getting overlapped by admin loggin.

 

Why this occured? i will tell u what i was doing. 

 

I opened localhost/portal on one tab and on other tab localhost/admin on same browser. 

this might be the reason but still it shouldnt overlap.

 

Where did i found bug. The admin was already logged in because of it persist it, but on client login i logged using client creds it worked but the drug data was coming because of admin login, as i log out of admin it gave me no data found for drugs. 

 

this indicates that - 

- drugs data can only being fetched by admin

- client page is getting overlapped by admin auths