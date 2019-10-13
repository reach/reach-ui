import React from "react";
import "../styles.css";
import {
  Slider,
  SliderHandle,
  SliderTrack,
  SliderTrackHighlight
} from "../src";

export const name = "Contained Handle";

export const Example = () => (
  <Slider handleAlignment="contain">
    <SliderTrack>
      <SliderTrackHighlight />
      <SliderHandle />
    </SliderTrack>
  </Slider>
);
