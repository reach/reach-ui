////////////////////////////////////////////////////////////////////////////////
// Welcome to @reach/slider!

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useRef,
  useState
} from "react";
import { node, func, number, string, bool, oneOf, oneOfType } from "prop-types";
import { useId } from "@reach/auto-id";
import { wrapEvent } from "@reach/utils";

// A11y reference:
//   - http://www.oaa-accessibility.org/examplep/slider1/
//   - https://github.com/Stanko/aria-progress-range-slider

// TODO: Screen reader testing
// TODO: Figure out capturing pointerUp outside of the window when handle is focused
// TODO: Warnings when switching from controlled/uncontrolled, etc.

// Random thoughts/notes:
//  - There is a bit of jank, particularly with vertical sliders, when reacting to the mouse
//    moving out of the element boundaries while the mouse is still down.
//    Currently testing this against the behavior of the native input range element to get
//    our slider on par.
//  - Normally I'd be inclined to use transform to move the handle in response
//    to a change for max performance benefit, but doing so would conflict
//    with user applied transform styles to the handle.
//  - I imagine there will be use cases where RTL languages will need a
//    reversed slider, so we'll want to update the math to deal
//    with that somehow. Maybe `reverse` prop? Should we do the same for vertical sliders?
//    How does the native range input react to RTL language detection (if at all)?
//    And if so, would we approach it differently with a multi-handle slider?

const SliderOrientation = {
  horizontal: "horizontal",
  vertical: "vertical"
};

const SliderContext = createContext({});
const useSliderContext = () => useContext(SliderContext);

////////////////////////////////////////////////////////////////////////////////
export const Slider = forwardRef(function Slider(
  {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-valuetext": ariaValueText,
    defaultValue,
    disabled,
    value: controlledValue,
    getValueText,
    id,
    max = 100,
    min = 0,
    name,
    onBlur,
    onFocus,
    onChange,
    onKeyDown,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    orientation = SliderOrientation.horizontal,
    step = 1,
    children,
    ...rest
  },
  ref
) {
  const { current: isControlled } = useRef(controlledValue != null);
  const [value, setValue] = useState(defaultValue || min);
  const _value = isControlled ? controlledValue : value;
  const actualValue = getAllowedValue(_value, min, max);
  const trackPercent = valueToPercent(actualValue, min, max);

  const trackRef = useRef();
  const handleRef = useRef();
  const _id = useId();

  const updateValue = useCallback(
    newValue => {
      if (!isControlled) {
        setValue(newValue);
      }
      if (onChange) {
        onChange(newValue, { min, max });
      }
    },
    [isControlled, onChange]
  );

  const isVertical = orientation === SliderOrientation.vertical;

  const {
    handleKeyDown,
    handlePointerDown,
    handlePointerUp,
    handlePointerMove
  } = useSliderEvents({
    disabled,
    handleRef,
    isVertical,
    min,
    max,
    onKeyDown,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    step,
    value: actualValue,
    trackRef,
    updateValue
  });

  const valueText = getValueText ? getValueText(actualValue) : ariaValueText;

  const sliderId = id || _id;

  const ctx = {
    ariaLabelledBy,
    onKeyDown,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onHandleBlur: onBlur,
    onHandleFocus: onFocus,
    onHandleKeyDown: handleKeyDown,
    sliderId,
    sliderMax: max,
    sliderMin: min,
    sliderValue: actualValue,
    valueText,
    disabled,
    isVertical,
    orientation,
    handleRef,
    sliderStep: step,
    trackPercent,
    trackRef,
    updateValue
  };

  const dataAttributes = makeDataAttributes("slider", {
    disabled,
    orientation
  });
  const trackSegmentStyle = isVertical
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

  return (
    <SliderContext.Provider value={ctx}>
      <div
        role="presentation"
        ref={ref}
        tabIndex="-1"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        aria-disabled={disabled}
        id={sliderId}
        {...dataAttributes}
        {...rest}
      >
        <Track
          ref={trackRef}
          trackSegmentStyle={trackSegmentStyle}
          children={children}
        />
        {name && (
          // If the slider is used in a form we'll need an input field to capture the value.
          // We'll assume this when the component is given a form field name.
          <input
            type="hidden"
            value={actualValue}
            name={name}
            id={`input:${sliderId}`}
          />
        )}
      </div>
    </SliderContext.Provider>
  );
});

Slider.propTypes = {
  defaultValue: number,
  disabled: bool,
  getValueText: func,
  min: number,
  max: number,
  name: string,
  orientation: oneOf([
    SliderOrientation.horizontal,
    SliderOrientation.vertical
  ]),
  onChange: func,
  children: node,
  step: number,
  value: number
};

////////////////////////////////////////////////////////////////////////////////
export const Track = forwardRef(function Track(
  { children, style = {}, trackSegmentStyle = {}, ...props },
  ref
) {
  const { disabled, orientation } = useSliderContext();

  const dataAttributes = makeDataAttributes("slider-track", {
    orientation,
    disabled
  });
  const innerDataAttributes = makeDataAttributes("slider-track-highlight", {
    orientation,
    disabled
  });
  return (
    <div
      ref={ref}
      id="track"
      style={{ ...style, position: "relative" }}
      {...dataAttributes}
      {...props}
    >
      <div
        style={{ position: "absolute", ...trackSegmentStyle, ...style }}
        {...innerDataAttributes}
      />
      {children}
    </div>
  );
});

////////////////////////////////////////////////////////////////////////////////
export const Handle = forwardRef(function Handle(
  {
    centered = false,
    // min, // TODO: Create separate min/max for handles
    // max,
    style = {},
    ...props
  },
  forwardedRef
) {
  const {
    ariaLabelledBy,
    disabled,
    handleRef,
    isVertical,
    onHandleBlur: onBlur,
    onHandleFocus: onFocus,
    onHandleKeyDown: onKeyDown,
    orientation,
    sliderMin,
    sliderMax,
    sliderValue,
    trackPercent,
    valueText
  } = useSliderContext();

  const ownRef = useRef(null);
  const ref = forwardedRef || ownRef;
  const { width, height } = useDimensions(ref);
  const dataAttributes = makeDataAttributes("slider-handle", {
    orientation,
    disabled
  });

  const dimension = isVertical ? height : width;
  const absoluteStartPosition = `calc(${trackPercent}% - ${
    centered ? `${dimension}px / 2` : `${dimension}px * ${trackPercent * 0.01}`
  })`;

  return (
    <div
      onBlur={onBlur}
      onFocus={onFocus}
      ref={node => mergeRefs([ref, handleRef], node)}
      role="slider"
      tabIndex={disabled ? undefined : 0}
      aria-disabled={disabled}
      aria-valuemin={sliderMin}
      aria-valuetext={valueText}
      aria-orientation={orientation}
      aria-valuenow={sliderValue}
      aria-valuemax={sliderMax}
      aria-labelledby={ariaLabelledBy}
      onKeyDown={onKeyDown}
      style={{
        position: "absolute",
        ...(isVertical
          ? { bottom: absoluteStartPosition }
          : { left: absoluteStartPosition }),
        ...style
      }}
      {...dataAttributes}
      {...props}
    />
  );
});

Handle.propTypes = {
  centered: bool
};

////////////////////////////////////////////////////////////////////////////////
export const Marker = forwardRef(function Marker(
  { children, style = {}, value, ...props },
  forwardedRef
) {
  const {
    disabled,
    isVertical,
    orientation,
    sliderMin,
    sliderMax,
    sliderValue
  } = useSliderContext();

  const ownRef = useRef(null);
  const ref = forwardedRef || ownRef;
  const actualValue = valueToPercent(value, sliderMin, sliderMax);
  const highlight = sliderValue >= value;
  const dataAttributes = makeDataAttributes("slider-marker", {
    orientation,
    disabled,
    highlight
  });

  const absoluteStartPosition = `${actualValue}%`;

  return value != null ? (
    <div
      role="presentation"
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

Marker.propTypes = {
  value: oneOfType([string, number]).isRequired
};

////////////////////////////////////////////////////////////////////////////////
export function valueToPercent(value, min, max) {
  return ((value - min) * 100) / (max - min);
}

export function percentToValue(percent, min, max) {
  return (max - min) * percent + min;
}

export function makeValuePrecise(value, step) {
  const stepDecimalPart = step.toString().split(".")[1];
  const stepPrecision = stepDecimalPart ? stepDecimalPart.length : 0;
  return Number(value.toFixed(stepPrecision));
}

export function roundValueToStep(value, step) {
  return makeValuePrecise(Math.round(value / step) * step, step);
}

export function getAllowedValue(val, min, max) {
  return val > max ? max : val < min ? min : val;
}

export const makeDataAttributes = (
  component = "slider",
  { orientation, highlight, disabled }
) => {
  return {
    [`data-reach-${component}`]: "",
    [`data-reach-${component}-orientation`]: orientation,
    [`data-reach-${component}-disabled`]: disabled ? orientation : undefined,
    [`data-reach-${component}-highlight`]: highlight ? orientation : undefined
  };
};

export const makeId = (id, index) => `${id}:${index}`;

const useSliderEvents = ({
  disabled,
  handleRef,
  isVertical,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  min,
  max,
  step,
  value,
  trackRef,
  updateValue
}) => {
  const [active, setActive] = useState(false);
  const getNewValue = event => {
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
  };

  const handleKeyDown = wrapEvent(onKeyDown, event => {
    let flag = false;
    let newValue;
    const tenSteps = (max - min) / 10;

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        newValue = value - step;
        flag = true;
        break;
      case "ArrowRight":
      case "ArrowUp":
        newValue = value + step;
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
      event.preventDefault();
      event.stopPropagation();
    }
    if (step) {
      newValue = roundValueToStep(newValue, step);
    }
    newValue = getAllowedValue(newValue, min, max);
    updateValue(newValue);
  });

  const handlePointerMove = wrapEvent(onPointerMove, event => {
    if (disabled) {
      if (active) setActive(false);
      return;
    }
    event.preventDefault();
    if (active) {
      const newValue = getNewValue(event);
      if (newValue !== value) {
        updateValue(newValue);
      }
    }
  });

  const handlePointerDown = wrapEvent(onPointerDown, event => {
    if (disabled) {
      if (active) setActive(false);
      return;
    }
    handleRef.current.focus();

    if (handleRef.current) {
      const newValue = getNewValue(event);
      handleRef.current.setPointerCapture(event.pointerId);
      setActive(true);
      if (newValue !== value) {
        updateValue(newValue);
      }
    }

    // We need to make sure the handle is moveable immediately on first click, so we need
    // to prevent the slider from getting focus by calling `preventDefault.
    // The problem is, this also screws up the pointer events resulting in some jank if the
    // user moves the pointer outside the element before releasing.
    // This needs some work.
    event.preventDefault();
  });

  const handlePointerUp = wrapEvent(onPointerUp, event => {
    if (handleRef.current && event.pointerId) {
      handleRef.current.releasePointerCapture(event.pointerId);
    }
    setActive(false);
  });

  return {
    handleKeyDown,
    handlePointerDown,
    handlePointerUp,
    handlePointerMove
  };
};

// https://github.com/chakra-ui/chakra-ui/blob/master/packages/chakra-ui/src/utils/index.js#L9
export function assignRef(ref, value) {
  if (ref == null) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    try {
      ref.current = value;
    } catch (error) {
      throw new Error(`Cannot assign value "${value}" to ref "${ref}"`);
    }
  }
}

export function mergeRefs(refs, value) {
  refs.forEach(ref => assignRef(ref, value));
}

export function useDimensions(passedRef) {
  const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });
  // Many existing `useDimensions` type hooks will use `getBoundingClientRect`
  // getBoundingClientRect does not work here when borders are applied.
  // getComputedStyle is not as performant so we may want to create a utility to check
  // for any conflicts with box sizing first and only use `getComputedStyle` if neccessary.
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

// TODO: Move this to @reach/utils
export let callEventWithDefault = (theirHandler, ourHandler) => event => {
  theirHandler && theirHandler(event);
  if (!event.defaultPrevented) {
    ourHandler && ourHandler(event);
  }
};
