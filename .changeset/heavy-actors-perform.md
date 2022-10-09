---
"@reach/accordion": minor
"@reach/alert": minor
"@reach/alert-dialog": minor
"@reach/auto-id": minor
"@reach/checkbox": minor
"@reach/combobox": minor
"@reach/descendants": minor
"@reach/dialog": minor
"@reach/disclosure": minor
"@reach/dropdown": minor
"@reach/listbox": minor
"@reach/machine": minor
"@reach/menu-button": minor
"@reach/popover": minor
"@reach/portal": minor
"@reach/rect": minor
"@reach/skip-nav": minor
"@reach/slider": minor
"@reach/tabs": minor
"@reach/tooltip": minor
"@reach/utils": minor
"@reach/visually-hidden": minor
"@reach/window-size": minor
---

We have simplified our build setup to remove a boatload of dependencies. Build output for all packages may look slightly different, though functionally packages that don't have explicit changes marked in the release notes have not changed.

This may affect you if you use `patch-package` to modify output code. If you need support for legacy browsers, the new bundle may not transpile the same ECMA features as before. In that case you may want to transpile Reach packages directly.
