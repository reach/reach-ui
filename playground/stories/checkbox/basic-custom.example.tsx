import * as React from "react";
import { CustomCheckbox } from "@reach/checkbox";
import "@reach/checkbox/styles.css";
import "./basic-custom.css";

let name = "Basic CustomCheckbox";

function Example() {
	return (
		<div className="example">
			<form onSubmit={(e) => e.preventDefault()}>
				<div>
					<CustomCheckbox name="options" value="one" id="one" />
					<label htmlFor="one">Option 1</label>
					<label>
						<CustomCheckbox name="options" value="two" defaultChecked />
						Option 2
					</label>
					<br />
				</div>
				<div>
					<button type="reset">Reset</button>
				</div>
			</form>
		</div>
	);
}

Example.storyName = name;
export { Example };
