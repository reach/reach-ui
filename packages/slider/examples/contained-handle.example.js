import React from "react";
import "../styles.css";
import { Slider, Handle } from "../src";

export const name = "Contained Handle";

export const Example = () => (
  <Slider handleAlignment="contain">
    <Handle />
  </Slider>
);
