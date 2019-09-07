import React from "react";
// import { useTransition, useSprings, animated } from "react-spring";
import "../styles.css";
import { Slider, Handle } from "../src";

export const name = "Animated";

export const Example = () => {
  const MIN = 0;
  const MAX = 100;
  const [values, setValues] = React.useState([0, 0, 0]);

  const handleChange = index => (
    newValue,
    { handlePosition: newHandlePosition }
  ) => {
    setValues([
      ...values.slice(0, index),
      newValue,
      ...values.slice(index + 1)
    ]);
  };

  return (
    <div>
      {values.map((value, index) => {
        return (
          <Slider
            onChange={handleChange(index)}
            value={value}
            key={index}
            min={MIN}
            max={MAX}
          >
            <Handle centered />
          </Slider>
        );
      })}
      <button onClick={() => setValues(values.map(() => MIN))}>
        Bring it Down!
      </button>
      <button onClick={() => setValues(values.map(() => MAX))}>Max Out!</button>
    </div>
  );
};

function usePrevious(value) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
