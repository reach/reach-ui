# @reach/listbox

[![Stable release](https://img.shields.io/npm/v/@reach/listbox.svg)](https://npm.im/@reach/listbox) ![MIT license](https://badgen.now.sh/badge/license/MIT)

[Docs](https://reach.tech/listbox) | [Source](https://github.com/reach/reach-ui/tree/main/packages/listbox) | [WAI-ARIA](https://www.w3.org/TR/wai-aria-practices-1.2/#Listbox)

An accessible listbox for custom select inputs.

```jsx
import * as React from "react";
import { Listbox, ListboxOption } from "@reach/listbox";
import "@reach/listbox/styles.css";

function Example(props) {
	let [value, setValue] = React.useState("default");
	return (
		<Listbox value={value} onChange={(value) => setValue(value)}>
			<ListboxOption value="default">🌮 Choose a taco</ListboxOption>
			<hr />
			<ListboxOption value="asada" valueText="Carne Asada">
				🌮 Carne Asada
			</ListboxOption>
			<ListboxOption value="pollo" valueText="Pollo">
				🌮 Pollo
			</ListboxOption>
			<ListboxOption value="pastor" valueText="Pastor">
				🌮 Pastor
			</ListboxOption>
			<ListboxOption value="lengua" valueText="Lengua">
				🌮 Lengua
			</ListboxOption>
		</Listbox>
	);
}
```
