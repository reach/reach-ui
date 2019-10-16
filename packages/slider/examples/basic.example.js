import React from "react";
import "../styles.css";
import { Slider, SliderMarker } from "@reach/slider";

export const name = "Basic";

export const Example = () => {
  return (
    <div>
      <h2>Look ma, no markers or props!</h2>
      <Slider />
      <h2>Now look what we can do</h2>
      <Slider min={-50} max={250}>
        <SliderMarker value={-10}>
          <span>-10</span>
        </SliderMarker>
        <SliderMarker value={90}>
          <span>90</span>
        </SliderMarker>
        <SliderMarker value={190}>
          <span>190</span>
        </SliderMarker>
      </Slider>
    </div>
  );
};
