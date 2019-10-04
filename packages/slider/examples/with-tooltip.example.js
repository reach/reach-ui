import React from "react";
import "../styles.css";
import {
  Slider,
  SliderHandle,
  SliderTooltip,
  SliderTrack,
  SliderTrackHighlight
} from "../src";

export const name = "With Tooltip";

export const Example = () => {
  return (
    <Slider>
      <SliderTrack>
        <SliderTrackHighlight />
        <SliderTooltip getLabel={value => `Value: ${value}`}>
          <SliderHandle />
        </SliderTooltip>
      </SliderTrack>
    </Slider>
  );
};
