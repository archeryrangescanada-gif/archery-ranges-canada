---
name: Client-Side i18n
description: Safe, client-side translation architecture for Next.js App Router that preserves static generation (ISR) and SEO without middleware or directory restructuring.
---

# Client-Side i18n for Next.js App Router

This skill provides a robust, safe pattern for adding bilingual (or multilingual) support to a Next.js App Router application. It intentionally avoids `next-intl` middleware and `[locale]` dynamic routing directories to prevent Vercel build/runtime crashes and to preserve existing SEO URLs.

## When to Use This Skill
- The project needs multi-language support (e.g., English/French).
- The project relies heavily on Incremental Static Regeneration (ISR) or static page generation.
- Changing URLs to include language prefixes (e.g., `/fr/about`) is undesirable or risks breaking existing SEO.
- Previous attempts with server-side i18n libraries caused production crashes.

## Core Principles
1. **Zero Route Changes:** URLs remain exactly the same.
2. **Client-Side Translation:** Translations happen instantly in the browser via React Context.
3. **Server Component Preservation:** Pages remain Server Components, but their UI is extracted into Client Components to consume the `LanguageContext`.
4. **Cookie Persistence:** The user's language choice is saved in a cookie to persist across sessions.
5. **Inlined Translations:** Translation dictionaries are hardcoded/inlined directly into the context file to prevent Webpack JSON import errors on Vercel.

## Implementation Steps

### 1. Create the `LanguageContext.tsx`
Create `src/lib/i18n/LanguageContext.tsx`. This file must contain:
- The full translation dictionaries (inlined to avoid build issues).
- A `LanguageProvider` component that reads from and writes to a `locale` cookie.
- A `useLanguage` hook that provides `t()` (for translations) and `locale`.

### 2. Create the `LanguageSwitcher.tsx` Component
Create a small, accessible button component that toggles the language state using the `setLocale` function from `useLanguage()`.

### 3. Wrap the App
In `src/app/layout.tsx`, wrap the `{children}` with the `<LanguageProvider>`. This makes the translation hook available globally to all Client Components.

### 4. Adapt Server Components (The "Client Component Extraction" Pattern)
Server Components (like `page.tsx`) **cannot** use React Context directly. To translate a Server Component while preserving its SEO/static data fetching:
1. Keep the data fetching in the server `page.tsx`.
2. Move all the JSX/UI rendering into a new file named `[ComponentName]Client.tsx` (e.g., `ProvinceClient.tsx`).
3. Add `'use client'` to the top of the new client file.
4. Pass the fetched data from `page.tsx` into the Client Component as props.
5. Use the `useLanguage()` hook inside the Client Component to translate the UI strings.

## Code Templates

You can find the exact code templates for this pattern in the adjacent `templates/` directory:
- `templates/LanguageContext.tsx.txt`
- `templates/LanguageSwitcher.tsx.txt`
- `templates/ServerComponentExtraction.txt`
