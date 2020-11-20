import * as React from "react";
import {
  Slider,
  SliderMarker,
  SLIDER_ORIENTATION_VERTICAL,
} from "@reach/slider";
import "@reach/slider/styles.css";
import "./examples.css";

let name = "Vertical";

function Example() {
  return (
    <Slider orientation={SLIDER_ORIENTATION_VERTICAL}>
      <SliderMarker value={10}>
        <span>10</span>
      </SliderMarker>
      <SliderMarker value={90}>
        <span>90</span>
      </SliderMarker>
    </Slider>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Slider" };
