import React from "react";
import "../styles.css";
import {
  Slider,
  SliderHandle,
  SliderTrack,
  SliderTrackHighlight,
  SliderMarker
} from "@reach/slider";

export const name = "Basic";

export const Example = () => (
  <Slider>
    <SliderTrack>
      <SliderTrackHighlight />
      <SliderMarker value={10}>
        <span>10</span>
      </SliderMarker>
      <SliderMarker value={90}>
        <span>90</span>
      </SliderMarker>
      <SliderHandle />
    </SliderTrack>
  </Slider>
);
