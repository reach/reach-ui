import "@reach/slider/styles.css";

import React from "react";
import {
  Slider,
  SliderMarker,
  SLIDER_ORIENTATION_VERTICAL
} from "@reach/slider";

export const name = "Vertical (TS)";

export const Example = () => (
  <Slider orientation={SLIDER_ORIENTATION_VERTICAL}>
    <SliderMarker value={10}>
      <span>10</span>
    </SliderMarker>
    <SliderMarker value={90}>
      <span>90</span>
    </SliderMarker>
  </Slider>
);
