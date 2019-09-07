import React from "react";
import "../styles.css";
import { Slider, Handle, Marker } from "../src";

export const name = "Basic";

export const Example = () => (
  <Slider>
    <Handle />
    <Marker value={10}>
      <span>10</span>
    </Marker>
    <Marker value={90}>
      <span>90</span>
    </Marker>
  </Slider>
);
