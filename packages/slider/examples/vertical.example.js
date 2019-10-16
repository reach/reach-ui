import React from "react";
import "../styles.css";
import {
  Slider,
  SliderHandle,
  SliderMarker,
  SliderTrack,
  SliderTrackHighlight,
  SLIDER_ORIENTATION_VERTICAL
} from "@reach/slider";

export const name = "Vertical";

export const Example = () => (
  <Slider orientation={SLIDER_ORIENTATION_VERTICAL}>
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
  </Slider>
);
