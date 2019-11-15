////////////////////////////////////////////////////////////////////////////////
// Welcome to @reach/slider!

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import PropTypes from "prop-types";
import warning from "warning";
import { useId } from "@reach/auto-id";
import { wrapEvent, useForkedRef, makeId } from "@reach/utils";

// A11y reference:
//   - http://www.oaa-accessibility.org/examplep/slider1/
//   - https://github.com/Stanko/aria-progress-range-slider

// Example todos:
//  - Compose with other Reach elements (popover, tooltip, etc.)

// Random thoughts/notes:
//  - Currently testing this against the behavior of the native input range
//    element to get our slider on par. We'll explore animated and multi-handle
//    sliders next.
//  - We may want to research some use cases for reversed sliders in RTL
//    languages if that's a thing

export const SLIDER_ORIENTATION_HORIZONTAL = "horizontal";
export const SLIDER_ORIENTATION_VERTICAL = "vertical";

// Handle is centered directly over the current value marker
export const SLIDER_HANDLE_ALIGN_CENTER = "center";

// Handle is contained within the bounds of the track, offset
// slightly from the value's center mark to accommodate
export const SLIDER_HANDLE_ALIGN_CONTAIN = "contain";

const SliderContext = createContext({});
const useSliderContext = () => useContext(SliderContext);

// These proptypes are shared between the composed SliderInput component and the
// simplified Slider
const sliderPropTypes = {
  defaultValue: PropTypes.number,
  disabled: PropTypes.bool,
  getValueText: PropTypes.func,
  handleAlignment: PropTypes.oneOf([
    SLIDER_HANDLE_ALIGN_CENTER,
    SLIDER_HANDLE_ALIGN_CONTAIN
  ]),
  min: PropTypes.number,
  max: PropTypes.number,
  name: PropTypes.string,
  orientation: PropTypes.oneOf([
    SLIDER_ORIENTATION_HORIZONTAL,
    SLIDER_ORIENTATION_VERTICAL
  ]),
  onChange: PropTypes.func,
  step: PropTypes.number,
  value: PropTypes.number
};

////////////////////////////////////////////////////////////////////////////////
export const Slider = forwardRef(function Slider(
  { children, ...props },
  forwardedRef
) {
  return (
    <SliderInput ref={forwardedRef} {...props}>
      <SliderTrack>
        <SliderTrackHighlight />
        <SliderHandle />
        {children}
      </SliderTrack>
    </SliderInput>
  );
});

Slider.displayName = "Slider";

if (__DEV__) {
  Slider.propTypes = {
    ...sliderPropTypes,
    children: PropTypes.node
  };
}

export default Slider;

////////////////////////////////////////////////////////////////////////////////
export const SliderInput = forwardRef(function SliderInput(
  {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-valuetext": ariaValueText,
    defaultValue,
    disabled,
    value: controlledValue,
    getValueText,
    handleAlignment = SLIDER_HANDLE_ALIGN_CENTER,
    id,
    max = 100,
    min = 0,
    name,
    onChange,
    onKeyDown,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    orientation = SLIDER_ORIENTATION_HORIZONTAL,
    step: stepProp,
    children,
    ...rest
  },
  forwardedRef
) {
  // Verify that the component is either controlled or uncontrolled throughout
  // its lifecycle
  const { current: isControlled } = useRef(controlledValue != null);

  warning(
    !(isControlled && controlledValue == null),
    "Slider is changing from controlled to uncontrolled. Slider should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled Slider for the lifetime of the component. Check the `value` prop being passed in."
  );

  warning(
    !(!isControlled && controlledValue != null),
    "Slider is changing from uncontrolled to controlled. Slider should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled Slider for the lifetime of the component. Check the `value` prop being passed in."
  );

  const _id = makeId("slider", useId());

  const trackRef = useRef(null);
  const handleRef = useRef(null);
  const ownRef = useRef(null);
  const sliderRef = forwardedRef || ownRef;

  const [hasFocus, setHasFocus] = useState(false);
  const [isPointerDown, setPointerDown] = useState(false);
  const [internalValue, setValue] = useState(defaultValue || min);

  const { ref: x, ...handleDimensions } = useDimensions(handleRef);

  const _value = isControlled ? controlledValue : internalValue;
  const value = getAllowedValue(_value, min, max);
  const trackPercent = valueToPercent(value, min, max);
  const isVertical = orientation === SLIDER_ORIENTATION_VERTICAL;
  const step = stepProp || 1;

  const handleSize = isVertical
    ? handleDimensions.height
    : handleDimensions.width;

  const handlePosition = `calc(${trackPercent}% - ${
    handleAlignment === SLIDER_HANDLE_ALIGN_CENTER
      ? `${handleSize}px / 2`
      : `${handleSize}px * ${trackPercent * 0.01}`
    })`;

  const updateValue = useCallback(
    function updateValue(newValue) {
      if (!isControlled) {
        setValue(newValue);
      }
      if (onChange) {
        onChange(newValue, { min, max, handlePosition });
      }
    },
    [handlePosition, isControlled, max, min, onChange]
  );

  const getNewValueFromPointer = useCallback(
    function getNewValueFromPointer(event) {
      if (trackRef.current) {
        const {
          left,
          width,
          bottom,
          height
        } = trackRef.current.getBoundingClientRect();
        const { clientX, clientY } = event;
        let diff = isVertical ? bottom - clientY : clientX - left;
        let percent = diff / (isVertical ? height : width);
        let newValue = percentToValue(percent, min, max);

        if (step) {
          newValue = roundValueToStep(newValue, step);
        }
        newValue = getAllowedValue(newValue, min, max);
        return newValue;
      }
    },
    [isVertical, max, min, step]
  );

  const handleKeyDown = wrapEvent(onKeyDown, function (event) {
    let flag = false;
    let newValue;
    const tenSteps = (max - min) / 10;
    const keyStep = stepProp || (max - min) / 100;

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        newValue = value - keyStep;
        flag = true;
        break;
      case "ArrowRight":
      case "ArrowUp":
        newValue = value + keyStep;
        flag = true;
        break;
      case "PageDown":
        newValue = value - tenSteps;
        flag = true;
        break;
      case "PageUp":
        newValue = value + tenSteps;
        flag = true;
        break;
      case "Home":
        newValue = min;
        flag = true;
        break;
      case "End":
        newValue = max;
        flag = true;
        break;
      default:
        return;
    }

    if (flag) {
      // event.preventDefault();
      // event.stopPropagation();
    }

    newValue = roundValueToStep(newValue, keyStep);
    newValue = getAllowedValue(newValue, min, max);
    updateValue(newValue);
  });

  const handlePointerDown = wrapEvent(onPointerDown, function (event) {
    event.preventDefault();
    if (disabled) {
      if (isPointerDown) setPointerDown(false);
      return;
    }
    if (sliderRef.current && handleRef.current) {
      setPointerDown(true);
      const newValue = getNewValueFromPointer(event);
      sliderRef.current.setPointerCapture &&
        sliderRef.current.setPointerCapture(event.pointerId);
      if (newValue !== value) {
        updateValue(newValue);
      }
      handleRef.current.focus();
    }
  });

  const handlePointerUp = wrapEvent(onPointerUp, function (event) {
    if (sliderRef.current && event.pointerId) {
      sliderRef.current.releasePointerCapture &&
        sliderRef.current.releasePointerCapture(event.pointerId);
    }
    setPointerDown(false);
  });

  const valueText = getValueText ? getValueText(value) : ariaValueText;

  const sliderId = id || _id;

  const trackHighlightStyle = isVertical
    ? {
      width: `100%`,
      height: `${trackPercent}%`,
      bottom: 0
    }
    : {
      width: `${trackPercent}%`,
      height: `100%`,
      left: 0
    };

  const ctx = {
    ariaLabelledBy,
    handleDimensions,
    handlePosition,
    handleRef,
    hasFocus,
    onKeyDown,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onHandleKeyDown: handleKeyDown,
    setHasFocus,
    sliderId,
    sliderMax: max,
    sliderMin: min,
    value,
    valueText,
    disabled,
    isVertical,
    orientation,
    sliderStep: step,
    trackPercent,
    trackRef,
    trackHighlightStyle,
    updateValue
  };

  const dataAttributes = makeDataAttributes("slider", {
    disabled,
    orientation
  });

  useEffect(() => {
    const handlePointerMove = wrapEvent(onPointerMove, function (event) {
      const newValue = getNewValueFromPointer(event);
      if (newValue !== value) {
        updateValue(newValue);
      }
    });

    if (isPointerDown) {
      document.addEventListener("pointermove", handlePointerMove);
    }

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
    };
  }, [
    onPointerMove,
    getNewValueFromPointer,
    updateValue,
    isPointerDown,
    value
  ]);

  return (
    <SliderContext.Provider value={ctx}>
      <div
        ref={sliderRef}
        tabIndex={-1}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        aria-disabled={disabled}
        id={sliderId}
        {...dataAttributes}
        {...rest}
      >
        {typeof children === "function"
          ? children({
            hasFocus,
            id: sliderId,
            max,
            min,
            value,
            valueText
          })
          : children}
        {name && (
          // If the slider is used in a form we'll need an input field to
          // capture the value. We'll assume this when the component is given a
          // form field name (A `name` prop doesn't really make sense in any
          // other context).
          <input
            type="hidden"
            value={value}
            name={name}
            id={makeId("input", sliderId)}
          />
        )}
      </div>
    </SliderContext.Provider>
  );
});

SliderInput.displayName = "SliderInput";

if (__DEV__) {
  SliderInput.propTypes = {
    ...sliderPropTypes,
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired
  };
}

////////////////////////////////////////////////////////////////////////////////
export const SliderTrack = forwardRef(function SliderTrack(
  { children, style = {}, ...props },
  forwardedRef
) {
  const { disabled, orientation, trackRef } = useSliderContext();
  const ownRef = useRef(null);
  const ref = forwardedRef || ownRef;
  const actualRef = useForkedRef(ref, trackRef);

  const dataAttributes = makeDataAttributes("slider-track", {
    orientation,
    disabled
  });

  return (
    <div
      ref={actualRef}
      style={{ ...style, position: "relative" }}
      {...dataAttributes}
      {...props}
    >
      {children}
    </div>
  );
});

SliderTrack.displayName = "SliderTrack";

if (__DEV__) {
  SliderTrack.propTypes = {
    children: PropTypes.node.isRequired
  };
}

////////////////////////////////////////////////////////////////////////////////
export const SliderTrackHighlight = forwardRef(function SliderTrackHighlight(
  { children, style = {}, ...props },
  forwardedRef
) {
  const { disabled, orientation, trackHighlightStyle } = useSliderContext();
  const ownRef = useRef(null);
  const ref = forwardedRef || ownRef;

  const dataAttributes = makeDataAttributes("slider-track-highlight", {
    orientation,
    disabled
  });
  return (
    <div
      ref={ref}
      style={{ position: "absolute", ...trackHighlightStyle, ...style }}
      {...dataAttributes}
      {...props}
    />
  );
});

SliderTrackHighlight.displayName = "SliderTrackHighlight";

if (__DEV__) {
  SliderTrackHighlight.propTypes = {};
}

////////////////////////////////////////////////////////////////////////////////
export const SliderHandle = forwardRef(function SliderHandle(
  {
    // min,
    // max,
    onBlur,
    onFocus,
    style = {},
    onKeyDown,
    ...props
  },
  forwardedRef
) {
  const {
    ariaLabelledBy,
    disabled,
    handlePosition,
    handleRef,
    isVertical,
    onHandleKeyDown,
    orientation,
    setHasFocus,
    sliderMin,
    sliderMax,
    value,
    valueText
  } = useSliderContext();

  const ownRef = useRef(null);
  const ref = forwardedRef || ownRef;
  const actualRef = useForkedRef(ref, handleRef);
  const dataAttributes = makeDataAttributes("slider-handle", {
    orientation,
    disabled
  });

  return (
    <div
      ref={actualRef}
      role="slider"
      tabIndex={disabled ? undefined : 0}
      aria-disabled={disabled}
      aria-valuemin={sliderMin}
      aria-valuetext={valueText}
      aria-orientation={orientation}
      aria-valuenow={value}
      aria-valuemax={sliderMax}
      aria-labelledby={ariaLabelledBy}
      onBlur={wrapEvent(onBlur, () => {
        setHasFocus(false);
      })}
      onFocus={wrapEvent(onFocus, () => {
        setHasFocus(true);
      })}
      onKeyDown={wrapEvent(onKeyDown, onHandleKeyDown)}
      style={{
        position: "absolute",
        ...(isVertical ? { bottom: handlePosition } : { left: handlePosition }),
        ...style
      }}
      {...dataAttributes}
      {...props}
    />
  );
});

SliderHandle.displayName = "SliderHandle";

if (__DEV__) {
  SliderHandle.propTypes = {};
}

////////////////////////////////////////////////////////////////////////////////
export const SliderMarker = forwardRef(function SliderMarker(
  { children, style = {}, value: valueProp, ...props },
  forwardedRef
) {
  const {
    disabled,
    isVertical,
    orientation,
    sliderMin,
    sliderMax,
    value: sliderValue
  } = useSliderContext();

  const ownRef = useRef(null);
  const ref = forwardedRef || ownRef;
  const value = valueToPercent(valueProp, sliderMin, sliderMax);
  const highlight = sliderValue >= value;
  const dataAttributes = makeDataAttributes("slider-marker", {
    orientation,
    disabled,
    highlight
  });

  const absoluteStartPosition = `${value}%`;

  return value != null ? (
    <div
      ref={ref}
      style={{
        position: "absolute",
        ...(isVertical
          ? { bottom: absoluteStartPosition }
          : { left: absoluteStartPosition }),
        ...style
      }}
      {...dataAttributes}
      {...props}
      children={children}
    />
  ) : null;
});

SliderMarker.displayName = "SliderMarker";

if (__DEV__) {
  SliderMarker.propTypes = {
    value: PropTypes.number.isRequired
  };
}

////////////////////////////////////////////////////////////////////////////////
function valueToPercent(value, min, max) {
  return ((value - min) * 100) / (max - min);
}

function percentToValue(percent, min, max) {
  return (max - min) * percent + min;
}

function makeValuePrecise(value, step) {
  const stepDecimalPart = step.toString().split(".")[1];
  const stepPrecision = stepDecimalPart ? stepDecimalPart.length : 0;
  return Number(value.toFixed(stepPrecision));
}

function roundValueToStep(value, step) {
  return makeValuePrecise(Math.round(value / step) * step, step);
}

function getAllowedValue(val, min, max) {
  return val > max ? max : val < min ? min : val;
}

function makeDataAttributes(
  component = "slider",
  { orientation, highlight, disabled }
) {
  return {
    [`data-reach-${component}`]: "",
    [`data-reach-${component}-disabled`]: disabled ? "" : undefined,
    [`data-reach-${component}-orientation`]: orientation,
    [`data-reach-${component}-highlight`]: highlight ? orientation : undefined
  };
}

function useDimensions(passedRef) {
  const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });
  // Many existing `useDimensions` type hooks will use `getBoundingClientRect`
  // getBoundingClientRect does not work here when borders are applied.
  // getComputedStyle is not as performant so we may want to create a utility to
  // check for any conflicts with box sizing first and only use
  // `getComputedStyle` if neccessary.
  /* const { width, height } = ref.current
    ? ref.current.getBoundingClientRect()
    : 0; */
  const ownRef = useRef(null);
  const ref = passedRef || ownRef;

  React.useLayoutEffect(() => {
    if (ref.current) {
      const { height: newHeight, width: newWidth } = window.getComputedStyle(
        ref.current
      );
      if (newHeight !== height || newWidth !== width) {
        setDimensions({
          height: parseFloat(newHeight),
          width: parseFloat(newWidth)
        });
      }
    }
  }, [ref, width, height]);
  return { ref, width, height };
}
