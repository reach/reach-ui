import * as React from "react";
import {
	Combobox,
	ComboboxInput,
	ComboboxList,
	ComboboxOption,
	ComboboxPopover,
} from "@reach/combobox";
import type { ComboboxProps, ComboboxInputProps } from "@reach/combobox";
import { composeEventHandlers } from "@reach/utils";
import { useCityMatch } from "./utils";
import "@reach/combobox/styles.css";

let name = "Token Input";

const Context = React.createContext<ContextType>(null!);

function Example() {
	let [term, setTerm] = React.useState("");
	let [selections, setSelections] = React.useState<string[]>([]);
	let results = useCityMatch(term);

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		setTerm(event.target.value);
	}

	function handleSelect(value: string) {
		setSelections(selections.concat([value]));
		setTerm("");
	}

	return (
		<div>
			<h2>Tokenbox</h2>
			<ExampleTokenbox onSelect={handleSelect}>
				<ExampleTokenLabel
					onRemove={(item) => {
						setSelections(selections.filter((s) => s !== item));
					}}
					style={{
						border: "1px solid #888",
						display: "flex",
						flexWrap: "wrap",
					}}
				>
					{selections.map((selection) => (
						<ExampleToken value={selection} key={selection} />
					))}
					<ExampleTokenInput
						value={term}
						onChange={handleChange}
						autocomplete={false}
						style={{
							outline: "none",
							border: "none",
							flexGrow: 1,
							margin: "0.25rem",
							font: "inherit",
						}}
					/>
				</ExampleTokenLabel>
				{results && (
					<ComboboxPopover>
						{results.length === 0 && (
							<p>
								No Results{" "}
								<button
									onClick={() => {
										setTerm("");
									}}
								>
									clear
								</button>
							</p>
						)}
						<ComboboxList>
							{results.slice(0, 10).map((result, index) => (
								<ComboboxOption
									key={index}
									value={`${result.city}, ${result.state}`}
								/>
							))}
						</ComboboxList>
					</ComboboxPopover>
				)}
			</ExampleTokenbox>
		</div>
	);
}

Example.storyName = name;
export { Example };

////////////////////////////////////////////////////////////////////////////////

function ExampleTokenLabel({
	onRemove,
	onKeyDown,
	...props
}: React.ComponentPropsWithoutRef<"label"> & {
	onRemove: ContextType["onRemove"];
}) {
	const selectionsRef = React.useRef<string[]>([]);
	const [selectionNavIndex, setSelectionNavIndex] = React.useState(-1);

	React.useLayoutEffect(() => {
		selectionsRef.current = [];
		return () => {
			selectionsRef.current = [];
		};
	});

	function handleKeyDown(event: React.KeyboardEvent) {
		if (event.key === "ArrowLeft") {
			if (selectionNavIndex > 0) {
				setSelectionNavIndex(selectionNavIndex - 1);
			} else if (selectionsRef.current.length > 0) {
				setSelectionNavIndex(selectionsRef.current.length - 1);
			}
		}
	}

	const context: ContextType = {
		onRemove,
		selectionsRef,
		selectionNavIndex,
	};

	return (
		<Context.Provider value={context}>
			<label
				onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
				{...props}
			/>
		</Context.Provider>
	);
}

function ExampleToken({
	value,
	...props
}: React.ComponentPropsWithRef<"span"> & { value: string }) {
	const { selectionsRef } = React.useContext(Context);
	// NEXT: need to know my index so that I can be highlighted on ArrowLeft!

	React.useEffect(() => {
		selectionsRef.current.push(value);
	});

	return (
		<span style={selectionStyle} {...props}>
			{value}
		</span>
	);
}

function ExampleTokenbox({ onSelect, ...props }: ComboboxProps) {
	const handleSelect = () => {};
	return (
		<Combobox
			onSelect={(val) => {
				onSelect?.(val);
				handleSelect();
			}}
			aria-label="choose a city"
			{...props}
		/>
	);
}

function ExampleTokenInput({
	onKeyDown,
	...props
}: ComboboxInputProps & React.ComponentPropsWithoutRef<"input">) {
	const { onRemove, selectionsRef } = React.useContext(Context);
	function handleKeyDown(event: React.KeyboardEvent) {
		const { value } = event.target as HTMLInputElement;
		if (
			event.key === "Backspace" &&
			value === "" &&
			selectionsRef.current.length > 0
		) {
			onRemove(selectionsRef.current[selectionsRef.current.length - 1]);
		}
	}
	return (
		<ComboboxInput
			onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
			{...props}
		/>
	);
}

const selectionStyle: React.CSSProperties = {
	fontSize: "11px",
	background: "#eee",
	border: "solid 1px #aaa",
	margin: "0.25rem",
	borderRadius: "1000px",
	padding: "0.2rem 0.5rem",
	userSelect: "none",
};

interface ContextType {
	onRemove(item: string): void;
	selectionsRef: React.MutableRefObject<string[]>;
	selectionNavIndex: number;
}
