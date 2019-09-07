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

  // Thoughts:
  //  - In order to animate using something like React Spring, user may need
  //    to access some state from inside the component. Perhaps we allow them
  //    to pass children as a function for that? Any better ideas?
  //    <Slider>
  //      {(handlePosition) => {
  //        const transition = useTransition( ...use handlePosition to create animation styles );
  //        transitions.map(({ item, key, props }) => (
  //          <animated.div {...props} key={key}>
  //            <Handle />
  //          </animated.div>
  //        ))
  //        <Handle />
  //      }}
  //    </Slider>

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
            <Handle />
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
