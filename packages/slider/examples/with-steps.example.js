import React from "react";
import "../styles.css";
import { Slider, Handle, Marker } from "../src";

export const name = "With Steps";

export const Example = () => {
  const step = 20;
  const min = 0;
  const max = 120;
  const range = max - min;
  const steps = Array.from(Array(range / step + 1).keys());
  return (
    <Slider step={step} min={min} max={max}>
      <Handle centered />
      {steps.map(key => {
        const value = key * step;
        return <Marker key={key} value={value} label={value} centered />;
      })}
    </Slider>
  );
};
