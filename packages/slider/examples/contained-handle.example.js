import "@reach/slider/styles.css";

import React from "react";
import {
  Slider,
  SliderHandle,
  SliderTrack,
  SliderTrackHighlight,
  SLIDER_HANDLE_ALIGN_CONTAIN
} from "@reach/slider";

export const name = "Contained Handle";

export const Example = () => (
  <Slider handleAlignment={SLIDER_HANDLE_ALIGN_CONTAIN}>
    <SliderTrack>
      <SliderTrackHighlight />
      <SliderHandle />
    </SliderTrack>
  </Slider>
);
