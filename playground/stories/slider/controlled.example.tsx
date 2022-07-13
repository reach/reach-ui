import * as React from "react";
import { Slider, SliderMarker } from "@reach/slider";
import "@reach/slider/styles.css";
import "./examples.css";

let name = "Controlled";

const MIN = 0;
const MAX = 120;

function Example() {
  const [value, setValue] = React.useState(0);
  const [status, setStatus] = React.useState("Give us some happiness!");
  const markers = [
    {
      face: "🙁",
      value: 0,
      label: "frowny face",
    },
    {
      face: "😐",
      value: 60,
      label: "neutral face",
    },
    {
      face: "🙂",
      value: 120,
      label: "smiley face",
    },
  ];

  React.useEffect(() => {
    const absVar = 0 - MIN;
    const absMin = MIN + absVar;
    const absMax = MAX + absVar;
    const range = absMax - absMin;
    const absValue = value + absVar;
    if (value === MAX) {
      setStatus("We are so happy!");
    } else if (absValue >= 0.75 * range) {
      setStatus("Almost happy enough!");
    } else if (absValue >= 0.25 * range) {
      setStatus("We could be a little happier!");
    } else {
      setStatus("Why so sad?");
    }
  }, [value]);

  return (
    <div>
      <button onClick={() => setValue(MIN)}>Bring it Down!</button>
      <button onClick={() => setValue(MAX)}>Max Out!</button>
      <br />
      <br />
      <Slider onChange={setValue} value={value} min={MIN} max={MAX}>
        {markers.map(({ face, label, value: val }) => (
          <SliderMarker value={val} key={val}>
            <span role="img" aria-label={label}>
              {face}
            </span>
          </SliderMarker>
        ))}
      </Slider>
      <br />
      <br />
      <p role="status" style={{ color: "crimson" }}>
        Happieness level at {value}% – {status}
      </p>
    </div>
  );
}

Example.storyName = name;
export { Example };
