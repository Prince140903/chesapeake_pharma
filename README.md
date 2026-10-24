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
