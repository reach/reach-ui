import "@reach/slider/styles.css";

import React from "react";
import { Slider, SLIDER_HANDLE_ALIGN_CONTAIN } from "@reach/slider";

export const name = "Contained Handle";

export const Example = () => (
  <Slider handleAlignment={SLIDER_HANDLE_ALIGN_CONTAIN}></Slider>
);
