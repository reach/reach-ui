import React from "react";
import "../styles.css";
import { Slider, Handle, Track, TrackHighlight } from "../src";

export const name = "Contained Handle";

export const Example = () => (
  <Slider handleAlignment="contain">
    <Track>
      <TrackHighlight />
      <Handle />
    </Track>
  </Slider>
);
