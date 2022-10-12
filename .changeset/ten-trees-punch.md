---
"@reach/accordion": minor
"@reach/alert-dialog": minor
"@reach/checkbox": minor
"@reach/combobox": minor
"@reach/dialog": minor
"@reach/disclosure": minor
"@reach/dropdown": minor
"@reach/listbox": minor
"@reach/menu-button": minor
"@reach/popover": minor
"@reach/skip-nav": minor
"@reach/slider": minor
"@reach/tabs": minor
"@reach/tooltip": minor
---

We no longer check that our internal styles are included by looking for a defined CSS custom property. You can still include our base styles as before, but this removes the need to define `--reach-<pkg>` in your own stylesheets to silence dev warnings.
