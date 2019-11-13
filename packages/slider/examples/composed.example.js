import "@reach/slider/styles.css";

import React from "react";
import {
  SliderMarker,
  SliderInput,
  SliderTrack,
  SliderTrackHighlight,
  SliderHandle
} from "@reach/slider";

export const name = "Composed of Parts";

export function Example() {
  return (
    <div>
      <SliderInput id="mySliderInput">
        <SliderTrack id="mySliderTrack">
          <SliderTrackHighlight id="mySliderTrackHighlight" />
          <SliderMarker id="mySliderMarker" value={50} />
          <SliderHandle id="mySliderHandle" />
        </SliderTrack>
      </SliderInput>
    </div>
  );
}
