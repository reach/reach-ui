import React from "react";
import "../styles.css";
import {
  SliderInput,
  SliderHandle,
  SliderMarker,
  SliderTrack,
  SliderTrackHighlight,
  SLIDER_ORIENTATION_VERTICAL
} from "@reach/slider";

export const name = "Vertical";

export const Example = () => (
  <SliderInput orientation={SLIDER_ORIENTATION_VERTICAL}>
    <SliderTrack>
      <SliderTrackHighlight />
      <SliderHandle />
      <SliderMarker value={10}>
        <span>10</span>
      </SliderMarker>
      <SliderMarker value={90}>
        <span>90</span>
      </SliderMarker>
    </SliderTrack>
  </SliderInput>
);
