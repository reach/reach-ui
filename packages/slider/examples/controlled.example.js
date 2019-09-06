import React from "react";
import "../styles.css";
import { Slider, Handle, Marker } from "../src";

export const name = "Controlled";

export const Example = () => {
  const [value, setValue] = React.useState(0);
  const [status, setStatus] = React.useState("Give us some happiness!");
  const handleChange = (newValue, { min, max }) => {
    const absVar = 0 - min;
    const absMin = min + absVar;
    const absMax = max + absVar;
    const range = absMax - absMin;
    const absValue = newValue + absVar;
    if (newValue === max) {
      setStatus("We are so happy!");
    } else if (absValue >= 0.75 * range) {
      setStatus("Almost happy enough!");
    } else if (absValue >= 0.25 * range) {
      setStatus("We could be a little happier!");
    } else {
      setStatus("Why so sad?");
    }
    setValue(newValue);
  };
  return (
    <div>
      <Slider onChange={handleChange} value={value} min={0} max={120}>
        <Handle centered />
        <Marker value={0}>
          <span role="img" aria-label="frowny face">
            🙁
          </span>
        </Marker>
        <Marker value={60}>
          <span role="img" aria-label="neutral face">
            😐
          </span>
        </Marker>
        <Marker value={120}>
          <span role="img" aria-label="smiley face">
            🙂
          </span>
        </Marker>
      </Slider>
      <p role="status" style={{ color: "crimson" }}>
        Happieness level at {value}% – {status}
      </p>
    </div>
  );
};
