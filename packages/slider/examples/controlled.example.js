import React from "react";
import "../styles.css";
import { Slider, Handle, Marker, Track, TrackHighlight } from "../src";

export const name = "Controlled";

export const Example = () => {
  const [value, setValue] = React.useState(0);
  const [status, setStatus] = React.useState("Give us some happiness!");
  const markers = [
    {
      face: "🙁",
      value: 0,
      label: "frowny face"
    },
    {
      face: "😐",
      value: 60,
      label: "neutral face"
    },
    {
      face: "🙂",
      value: 120,
      label: "smiley face"
    }
  ];
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
        <Track>
          <TrackHighlight />
          <Handle />
          {markers.map(({ face, label, value: val }) => (
            <Marker value={val}>
              <span role="img" aria-label={label}>
                {face}
              </span>
            </Marker>
          ))}
        </Track>
      </Slider>
      <p role="status" style={{ color: "crimson" }}>
        Happieness level at {value}% – {status}
      </p>
    </div>
  );
};
