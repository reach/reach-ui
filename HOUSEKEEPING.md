# Housekeeping notes

- Dependencies

  - Consider ditching Jest for Vite
  - Consider simplifying the build, ditch Babel for esbuild
  - Do not upgrade `@testing-library/react` to the next major version until React 18 support is in order; they have deprecated support for React 17
  - `@testing-library/user-event` has a number of breaking changes; review carefully before updating
  - Use Node 16
