# Admin Reporting Frontend Bundle

This folder contains the frontend code for the Admin Reporting page and its dependencies.

## Included
- `src/views/admin/reporting/**` (all report UI components + mock data)
- `src/app/[lang]/(dashboard)/(private)/admin/reporting/page.tsx` (Next.js route page)
- `src/@core/components/mui/Avatar.tsx` (CustomAvatar)
- `src/@core/components/mui/TextField.tsx` (CustomTextField)
- `src/@core/types.ts` (ThemeColor type)

## Dependencies
- MUI (`@mui/material`, `@mui/system`, `@mui/styles`)
- `@emotion/react`, `@emotion/styled`
- CSS variables used by this template (e.g. `--mui-palette-*`, `--mui-customShadows-*`)
- Tabler icon CSS (icons use `tabler-...` class names)
- Utility classes like `flex`, `gap-*` etc (Tailwind or compatible utility CSS)

## Notes
- `ExportButton` currently logs to console. Replace with your real export logic.
- If your project already has `@core/components/mui/Avatar` and `TextField`, you can remove those copies.
