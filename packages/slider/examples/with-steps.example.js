import React from "react";
import "../styles.css";
import { Slider, Handle, Marker, Track, TrackHighlight } from "../src";

export const name = "With Steps";

export const Example = () => {
  const step = 20;
  const min = 0;
  const max = 120;
  const range = max - min;
  const steps = Array.from(Array(range / step + 1).keys());
  return (
    <Slider step={step} min={min} max={max}>
      <Track>
        <TrackHighlight />
        <Handle />
        {steps.map(key => {
          const value = key * step;
          return (
            <Marker key={key} value={value}>
              <span>{value}</span>
            </Marker>
          );
        })}
      </Track>
    </Slider>
  );
};
