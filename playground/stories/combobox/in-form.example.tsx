import * as React from "react";
import {
	Combobox,
	ComboboxInput,
	ComboboxList,
	ComboboxOption,
	ComboboxPopover,
} from "@reach/combobox";
import { Alert } from "@reach/alert";
import { useCityMatch } from "./utils";
import "@reach/combobox/styles.css";

let name = "In a form";

function showOpts<R>(
	results: R[],
	render: (props: { result: R; index: number }) => React.ReactNode
) {
	return results.slice(0, 10).map((result, index) => render({ result, index }));
}

function MyCombobox() {
	let [term, setTerm] = React.useState("");
	let [showAlert, setShowAlert] = React.useState(false);
	let results = useCityMatch(term);
	let tid = React.useRef(-1);
	React.useEffect(() => {
		return () => {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			window.clearTimeout(tid.current);
		};
	}, []);

	return (
		<div>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					window.clearTimeout(tid.current);
					setShowAlert(true);
					tid.current = window.setTimeout(() => {
						setShowAlert(false);
					}, 3000);
				}}
			>
				<label>
					<div>Name</div>
					<input type="text" name="name" />
				</label>
				<Combobox as="label">
					<div>City</div>
					<ComboboxInput
						onChange={(event: any) => setTerm(event.target.value)}
						autoComplete="off"
						autoCorrect="off"
						autoSave="off"
					/>
					{results ? (
						<ComboboxPopover portal={false}>
							<ComboboxList as="ul">
								{showOpts(results, ({ result, index }) => (
									<ComboboxOption as="li" key={index} value={result.city} />
								))}
							</ComboboxList>
						</ComboboxPopover>
					) : null}
				</Combobox>
				<div>
					<button>Submit</button>
					<button type="reset">Reset</button>
				</div>
			</form>
			<hr />
			{showAlert ? <Alert>Submitted!</Alert> : null}
		</div>
	);
}

function Example() {
	return <MyCombobox />;
}

Example.storyName = name;
export { Example };

////////////////////////////////////////////////////////////////////////////////
