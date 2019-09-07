import React from "react";
import "../styles.css";
import { Slider, Handle, Marker, Track, TrackHighlight } from "../src";

export const name = "Vertical";

export const Example = () => (
  <Slider orientation="vertical">
    <Track>
      <TrackHighlight />
      <Handle />
      <Marker value={10}>
        <span>10</span>
      </Marker>
      <Marker value={90}>
        <span>90</span>
      </Marker>
    </Track>
  </Slider>
);
