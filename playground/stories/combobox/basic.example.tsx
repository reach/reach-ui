import * as React from "react";
import {
	Combobox,
	ComboboxInput,
	ComboboxList,
	ComboboxOption,
	ComboboxPopover,
} from "@reach/combobox";
import { useCityMatch } from "./utils";
import "@reach/combobox/styles.css";

let name = "Basic";

function MyCombobox() {
	let [term, setTerm] = React.useState("");
	let results = useCityMatch(term);
	console.log(results);

	return (
		<div>
			<Combobox data-testid="box" as="span">
				<ComboboxInput
					data-testid="input"
					as="textarea"
					onChange={(event: any) => setTerm(event.target.value)}
				/>
				{results ? (
					<ComboboxPopover portal={false}>
						<ComboboxList data-testid="list" as="ul">
							{results.slice(0, 10).map((result, index) => (
								<ComboboxOption
									key={index}
									value={`${result.city}, ${result.state}`}
								/>
							))}
						</ComboboxList>
					</ComboboxPopover>
				) : null}
			</Combobox>
		</div>
	);
}

function Example() {
	return <MyCombobox />;
}

Example.storyName = name;
export { Example };
