import React from "react";
import { Slider, SliderMarker } from "@reach/slider";
import "@reach/slider/styles.css";

export const name = "Basic";

export function Example() {
  return (
    <Slider id="gee-whiz">
      <SliderMarker value={10}>
        <span>10</span>
      </SliderMarker>
      <SliderMarker value={90}>
        <span>90</span>
      </SliderMarker>
    </Slider>
  );
}
