import React from "react";
import { Slider, SLIDER_HANDLE_ALIGN_CONTAIN } from "@reach/slider";
import "@reach/slider/styles.css";

export const name = "Contained Handle";

export function Example() {
  return <Slider handleAlignment={SLIDER_HANDLE_ALIGN_CONTAIN}></Slider>;
}
