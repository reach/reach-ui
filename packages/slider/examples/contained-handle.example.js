import "@reach/slider/styles.css";

import React from "react";
import {
  Slider,
  SliderHandle,
  SliderTrack,
  SliderTrackHighlight
} from "@reach/slider";

export const name = "Contained Handle";

export const Example = () => (
  <Slider handleAlignment="contain">
    <SliderTrack>
      <SliderTrackHighlight />
      <SliderHandle />
    </SliderTrack>
  </Slider>
);
