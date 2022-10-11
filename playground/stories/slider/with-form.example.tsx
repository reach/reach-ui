import * as React from "react";
import { Slider, SliderMarker } from "@reach/slider";
import "@reach/slider/styles.css";
import "./examples.css";

let name = "With a Form (TS)";

function Example() {
	return (
		<form onSubmit={(e) => e.preventDefault()}>
			<label>
				<p>Range</p>
				<Slider name="range" defaultValue={20}>
					<SliderMarker value={10}>
						<span>10</span>
					</SliderMarker>
					<SliderMarker value={90}>
						<span>90</span>
					</SliderMarker>
				</Slider>
			</label>
			<div style={{ height: 60 }} />
			<button type="reset">Reset</button>
		</form>
	);
}

Example.storyName = name;
export { Example };
