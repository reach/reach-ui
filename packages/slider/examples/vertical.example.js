import React from "react";
import "../styles.css";
import { Slider, Handle, Marker } from "../src";

export const name = "Vertical";

export const Example = () => (
  <Slider orientation="vertical">
    <Handle centered />
    <Marker value={10} label="10" />
    <Marker value={90} label="90" />
  </Slider>
);
