import "@reach/slider/styles.css";

import React from "react";
import { Slider, SliderMarker } from "@reach/slider";

export const name = "Basic";

export const Example = () => (
  <Slider id="gee-whiz">
    <SliderMarker value={10}>
      <span>10</span>
    </SliderMarker>
    <SliderMarker value={90}>
      <span>90</span>
    </SliderMarker>
  </Slider>
);
