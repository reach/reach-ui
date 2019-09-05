////////////////////////////////////////////////////////////////////////////////
// Welcome to @reach/slider!

import React, {
  forwardRef,
  useRef,
  useState,
  useCallback,
  cloneElement
} from "react";
import { node, func, number, string, bool, oneOfType } from "prop-types";
import { useId } from "@reach/auto-id";

// A11y reference:
//   - http://www.oaa-accessibility.org/examplep/slider1/
//   - https://github.com/Stanko/aria-progress-range-slider
// TODO: Screen reader testing

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
//    And if so, would we approach it differently with a multi-thumb slider?

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
    onChange,
    onFocus,
    onKeyDown,
    onMouseDown,
    onMouseLeave,
    step = 1,
    vertical = false,
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
  const thumbRef = useRef();
  const _id = useId();

  const updateValue = useCallback(
    newValue => {
      if (!isControlled) {
        setValue(newValue);
      }
      if (onChange) {
        onChange(newValue);
      }
    },
    [isControlled, onChange]
  );

  const orientation = vertical ? "vertical" : "horizontal";
  const isVertical = orientation === "vertical";

  const { handleKeyDown, handleMouseDown, handleMouseUp } = useSliderEvents({
    value: actualValue,
    disabled,
    step,
    isVertical,
    min,
    max,
    updateValue,
    onKeyDown,
    onMouseDown,
    thumbRef,
    trackRef
  });

  const valueText = getValueText ? getValueText(actualValue) : ariaValueText;

  const sliderId = id || _id;

  const clones = React.Children.map(children, (child, index) => {
    // ignore random <div/>s etc.
    if (typeof child.type === "string") return child;
    const clone = cloneElement(child, {
      onThumbKeyDown: handleKeyDown,
      onThumbFocus: onFocus,
      _trackPercent: trackPercent,
      ariaLabelledBy,
      _isVertical: isVertical,
      _orientation: orientation,
      _disabled: disabled,
      _thumbRef: thumbRef,
      _trackRef: trackRef,
      min,
      max,
      valueText,
      _value: actualValue,
      sliderId,
      _id: makeId(sliderId, index)
    });
    return clone;
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
    <div
      role="presentation"
      ref={ref}
      data-reach-slider=""
      data-reach-slider-horizontal={!isVertical ? "" : undefined}
      data-reach-slider-vertical={isVertical ? "" : undefined}
      data-reach-slider-disabled={disabled ? "" : undefined}
      tabIndex="-1"
      onMouseDown={handleMouseDown}
      onMouseLeave={event => {
        handleMouseUp();
        onMouseLeave && onMouseLeave(event);
      }}
      onBlur={event => {
        handleMouseUp();
        onBlur && onBlur(event);
      }}
      aria-disabled={disabled}
      id={sliderId}
      {...rest}
    >
      <Track
        ref={trackRef}
        isVertical={orientation === "vertical"}
        trackSegmentStyle={trackSegmentStyle}
        disabled={disabled}
        children={clones}
      />

      {/* do we need this? */}
      <input
        type="hidden"
        value={actualValue}
        name={name}
        id={`input:${sliderId}`}
      />
    </div>
  );
});

Slider.propTypes = {
  min: number,
  max: number,
  vertical: bool,
  onChange: func,
  children: node
};

////////////////////////////////////////////////////////////////////////////////
export const Track = forwardRef(function Track(
  {
    children,
    isVertical,
    disabled,
    style = {},
    trackSegmentStyle = {},
    ...props
  },
  ref
) {
  return (
    <div
      ref={ref}
      data-reach-slider-track=""
      data-reach-slider-track-horizontal={!isVertical ? "" : undefined}
      data-reach-slider-track-vertical={isVertical ? "" : undefined}
      data-reach-slider-track-disabled={disabled ? "" : undefined}
      id="track"
      style={{ ...style, position: "relative" }}
      {...props}
    >
      <div
        data-reach-slider-track-highlight=""
        data-reach-slider-track-highlight-horizontal={
          !isVertical ? "" : undefined
        }
        data-reach-slider-track-highlight-vertical={isVertical ? "" : undefined}
        data-reach-slider-track-highlight-disabled={disabled ? "" : undefined}
        style={{ position: "absolute", ...trackSegmentStyle, ...style }}
      />
      {children}
    </div>
  );
});

////////////////////////////////////////////////////////////////////////////////
export const Handle = forwardRef(function Handle(
  {
    onThumbKeyDown: onKeyDown,
    onThumbFocus: onFocus,
    _trackPercent,
    ariaLabelledBy,
    _isVertical: isVertical,
    _orientation,
    _disabled,
    _thumbRef,
    _trackRef,
    centered = false,
    min,
    max,
    valueText,
    _value,
    sliderId,
    _id,
    style = {},
    ...props
  },
  forwardedRef
) {
  const ownRef = useRef(null);
  const ref = forwardedRef || ownRef;
  const { width, height } = useDimensions(ref);

  const dimension = isVertical ? height : width;
  const absoluteStartPosition = `calc(${_trackPercent}% - ${
    centered ? `${dimension}px / 2` : `${dimension}px * ${_trackPercent * 0.01}`
  })`;

  return (
    <div
      data-reach-slider-handle=""
      data-reach-slider-handle-horizontal={!isVertical ? "" : undefined}
      data-reach-slider-handle-vertical={isVertical ? "" : undefined}
      data-reach-slider-handle-disabled={_disabled ? "" : undefined}
      onFocus={onFocus}
      ref={node => mergeRefs([ref, _thumbRef], node)}
      role="slider"
      tabIndex={_disabled ? undefined : 0}
      aria-disabled={_disabled}
      aria-valuemin={min}
      aria-valuetext={valueText}
      aria-orientation={_orientation}
      aria-valuenow={_value}
      aria-valuemax={max}
      aria-labelledby={ariaLabelledBy}
      onKeyDown={onKeyDown}
      style={{
        position: "absolute",
        ...(isVertical
          ? { bottom: absoluteStartPosition }
          : { left: absoluteStartPosition }),
        ...style
      }}
      {...props}
    />
  );
});

////////////////////////////////////////////////////////////////////////////////
export const Marker = forwardRef(function Marker(
  {
    ariaLabelledBy,
    children,
    centered,
    label,
    min,
    max,
    onThumbFocus: onFocus,
    onThumbKeyDown: onKeyDown,
    sliderId,
    style = {},
    value,
    valueText,
    _disabled,
    _id,
    _isVertical: isVertical,
    _orientation,
    _thumbRef,
    _trackPercent,
    _trackRef,
    _value,
    ...props
  },
  forwardedRef
) {
  const ownRef = useRef(null);
  const ref = forwardedRef || ownRef;
  const actualValue = valueToPercent(value, min, max);
  const { width, height } = useDimensions(ref);

  const dimension = isVertical ? height : width;

  const absoluteStartPosition = `calc(${actualValue}% - ${
    centered ? `${dimension}px / 2` : `${dimension}px * ${actualValue * 0.01}`
  })`;
  const highlight = _value > value;

  // Label might be a zero, so we can't rely on truthy/falsy checks
  const hasLabel = label != null;

  return value != null ? (
    <div
      data-reach-slider-marker=""
      data-reach-slider-marker-highlight={highlight ? "" : undefined}
      data-reach-slider-marker-highlight-horizontal={
        highlight && !isVertical ? "" : undefined
      }
      data-reach-slider-marker-highlight-vertical={
        highlight && isVertical ? "" : undefined
      }
      data-reach-slider-marker-highlight-disabled={
        highlight && _disabled ? "" : undefined
      }
      data-reach-slider-marker-horizontal={!isVertical ? "" : undefined}
      data-reach-slider-marker-vertical={isVertical ? "" : undefined}
      data-reach-slider-marker-disabled={_disabled ? "" : undefined}
      role="presentation"
      ref={ref}
      style={{
        position: "absolute",
        ...(isVertical
          ? { bottom: absoluteStartPosition }
          : { left: absoluteStartPosition }),
        ...style
      }}
      {...props}
    >
      {(hasLabel || children) && (
        <div
          data-reach-slider-marker-label=""
          data-reach-slider-marker-label-horizontal={
            !isVertical ? "" : undefined
          }
          data-reach-slider-marker-label-vertical={isVertical ? "" : undefined}
          data-reach-slider-marker-label-disabled={_disabled ? "" : undefined}
        >
          {hasLabel ? label : children}
        </div>
      )}
    </div>
  ) : null;
});

Marker.propTypes = {
  value: oneOfType([string, number]).isRequired
};

////////////////////////////////////////////////////////////////
// UTILS
////////////////////////////////////////////////////////////////
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

export const makeId = (id, index) => `${id}:${index}`;

const useSliderEvents = ({
  step,
  value,
  isVertical,
  min,
  max,
  updateValue,
  onKeyDown,
  onMouseDown,
  thumbRef,
  disabled,
  trackRef
}) => {
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

  const handleKeyDown = event => {
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

    onKeyDown && onKeyDown(event);
  };

  const handleMouseDown = event => {
    if (disabled) return;
    onMouseDown && onMouseDown(event);
    event.preventDefault();

    let newValue = getNewValue(event);
    if (newValue !== value) {
      updateValue(newValue);
    }

    document.body.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseup", handleMouseUp);
    thumbRef.current && thumbRef.current.focus();
  };

  const handleMouseUp = () => {
    document.body.removeEventListener("mousemove", handleMouseMove);
    document.body.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = event => {
    let newValue = getNewValue(event);
    updateValue(newValue);
  };

  return { handleKeyDown, handleMouseDown, handleMouseUp, handleMouseMove };
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
