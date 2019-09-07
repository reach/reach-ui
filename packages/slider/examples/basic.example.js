import React from "react";
import "../styles.css";
import { Slider, Handle, Track, TrackHighlight, Marker } from "../src";

export const name = "Basic";

export const Example = () => (
  <Slider>
    <Track>
      <TrackHighlight />
      <Marker value={10}>
        <span>10</span>
      </Marker>
      <Marker value={90}>
        <span>90</span>
      </Marker>
      <Handle />
    </Track>
  </Slider>
);
