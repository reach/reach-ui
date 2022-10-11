---
"@reach/checkbox": patch
---

`useMixedCheckbox` mistakenly derived its `checked` value incorrectly. In practice this was unlikely to cause an issue, but it now derives the guaranteed value from the active component state.
