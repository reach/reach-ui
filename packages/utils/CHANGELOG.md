# `@reach/utils`

## 0.18.0

### BREAKING Changes

- All default exports have been removed. Replace all default imports with the appropriate documented named export.
- The output directory structure has changed slightly. Module files are now named `reach-<pkg>.mjs` instead of `reach-<pkg>.esm.js`.
- Removed the `useCheckStyles` export
- All `Polymorphic` types that were previously exported from `@reach/utils` have been moved to a separate package `@reach/polymorphic`. As `@reach/utils` is an internal package, this [breaking] change should not affect you [if you listened to us and did not use the package directly].

### Minor Changes

- We have simplified our build setup to remove a boatload of dependencies. Build output for all packages may look slightly different, though functionally packages that don't have explicit changes marked in the release notes have not changed.

  This may affect you if you use `patch-package` to modify output code. If you need support for legacy browsers, the new bundle may not transpile the same ECMA features as before. In that case you may want to transpile Reach packages directly.
