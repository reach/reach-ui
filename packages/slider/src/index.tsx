/**
 * Welcome to @reach/slider!
 *
 * A UI input component where the user selects a value from within a given
 * range. A Slider has a handle that can be moved along a track to change its
 * value. When the user's mouse or focus is on the Slider's handle, the value
 * can be incremented with keyboard controls.
 *
 * Random thoughts/notes:
 *  - Currently testing this against the behavior of the native input range
 *    element to get our slider on par. We'll explore animated and multi-handle
 *    sliders next.
 *  - We may want to research some use cases for reversed sliders in RTL
 *    languages if that's a thing
 *
 * @see Docs     https://reacttraining.com/reach-ui/slider
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/slider
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#slider
 * @see          https://github.com/Stanko/aria-progress-range-slider
 * @see          http://www.oaa-accessibility.org/examplep/slider1/
 */

import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import warning from "warning";
import { useId } from "@reach/auto-id";
import {
  checkStyles,
  createNamedContext,
  getOwnerDocument,
  isFunction,
  makeId,
  useForkedRef,
  useIsomorphicLayoutEffect,
  wrapEvent,
} from "@reach/utils";

export type SliderAlignment = "center" | "contain";
export enum SliderOrientation {
  Horizontal = "horizontal",
  Vertical = "vertical",
}
export enum SliderHandleAlignment {
  // Handle is centered directly over the current value marker
  Center = "center",
  // Handle is contained within the bounds of the track, offset slightly from
  // the value's center mark to accommodate
  Contain = "contain",
}

// TODO: Remove in 1.0, maybe?
export const SLIDER_ORIENTATION_HORIZONTAL = SliderOrientation.Horizontal;
export const SLIDER_ORIENTATION_VERTICAL = SliderOrientation.Vertical;
export const SLIDER_HANDLE_ALIGN_CENTER = SliderHandleAlignment.Center;
export const SLIDER_HANDLE_ALIGN_CONTAIN = SliderHandleAlignment.Contain;

const SliderContext = createNamedContext<ISliderContext>(
  "SliderContext",
  {} as ISliderContext
);
const useSliderContext = () => useContext(SliderContext);

// These proptypes are shared between the composed SliderInput component and the
// simplified Slider
const sliderPropTypes = {
  defaultValue: PropTypes.number,
  disabled: PropTypes.bool,
  getValueText: PropTypes.func,
  handleAlignment: PropTypes.oneOf([
    SliderHandleAlignment.Center,
    SliderHandleAlignment.Contain,
  ]),
  min: PropTypes.number,
  max: PropTypes.number,
  name: PropTypes.string,
  orientation: PropTypes.oneOf([
    SliderOrientation.Horizontal,
    SliderOrientation.Vertical,
  ]),
  onChange: PropTypes.func,
  step: PropTypes.number,
  value: PropTypes.number,
};

////////////////////////////////////////////////////////////////////////////////

/**
 * Slider
 *
 * @see Docs https://reacttraining.com/reach-ui/slider#slider
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  { children, ...props },
  forwardedRef
) {
  return (
    <SliderInput ref={forwardedRef} data-reach-slider="" {...props}>
      <SliderTrack>
        <SliderTrackHighlight />
        <SliderHandle />
        {children}
      </SliderTrack>
    </SliderInput>
  );
});

/**
 * @see Docs https://reacttraining.com/reach-ui/slider#slider-props
 */
export type SliderProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "onPointerMove"
> & {
  /**
   * `Slider` can accept `SliderMarker` children to enhance display of specific
   * values along the track.
   *
   * @see Docs https://reacttraining.com/reach-ui/slider#slider-children
   */
  children?: React.ReactNode;
  /**
   * The defaultValue is used to set an initial value for an uncontrolled
   * Slider.
   *
   * @see Docs https://reacttraining.com/reach-ui/slider#slider-defaultvalue
   */
  defaultValue?: number;
  /**
   * @see Docs https://reacttraining.com/reach-ui/slider#slider-disabled
   */
  disabled?: boolean;
  /**
   * Whether or not the slider should be disabled from user interaction.
   *
   * @see Docs https://reacttraining.com/reach-ui/slider#slider-value
   */
  value?: number;
  /**
   * A function used to set human readable value text based on the slider's
   * current value.
   * @see Docs https://reacttraining.com/reach-ui/slider#slider-getvaluetext
   */
  getValueText?(value: number): string;
  /**
   * When set to `center`, the slider's handle will be positioned directly
   * centered over the slider's curremt value on the track. This means that when
   * the slider is at its min or max value, a visiable slider handle will extend
   * beyond the width (or height in vertical mode) of the slider track. When set
   * to `contain`, the slider handle will always be contained within the bounds
   * of the track, meaning its position will be slightly offset from the actual
   * value depending on where it sits on the track.
   *
   * @see Docs https://reacttraining.com/reach-ui/slider#slider-handlealignment
   */
  handleAlignment?: "center" | "contain" | SliderAlignment;
  /**
   * The maximum value of the slider. Defaults to `100`.
   *
   * @see Docs https://reacttraining.com/reach-ui/slider#slider-max
   */
  max?: number;
  /**
   * The minimum value of the slider. Defaults to `0`.
   *
   * @see Docs https://reacttraining.com/reach-ui/slider#slider-min
   */
  min?: number;
  /**
   * If the slider is used as a form input, it should accept a `name` prop to
   * identify its value in context of the form.
   *
   * @see Docs https://reacttraining.com/reach-ui/slider#slider-name
   */
  name?: string;
  /**
   * Callback that fires when the slider value changes. When the `value` prop is
   * set, the Slider state becomes controlled and `onChange` must be used to
   * update the value in response to user interaction.
   *
   * @see Docs https://reacttraining.com/reach-ui/slider#slider-onchange
   */
  onChange?(
    newValue: number,
    props?: {
      min?: number;
      max?: number;
      handlePosition?: string;
    }
  ): void;
  onPointerMove?(event: PointerEvent): void;
  /**
   * Sets the slider to horizontal or vertical mode.
   *
   * @see Docs https://reacttraining.com/reach-ui/slider#slider-orientation
   */
  orientation?: SliderOrientation;
  /**
   * The step attribute is a number that specifies the granularity that the
   * value must adhere to as it changes. Step sets minimum intervals of change,
   * creating a "snap" effect when the handle is moved along the track.
   *
   * @see Docs https://reacttraining.com/reach-ui/slider#slider-step
   */
  step?: number;
};

if (__DEV__) {
  Slider.displayName = "Slider";
  Slider.propTypes = {
    ...sliderPropTypes,
    children: PropTypes.node,
  };
}

export default Slider;

////////////////////////////////////////////////////////////////////////////////

/**
 * SliderInput
 *
 * The parent component of the slider interface. This is a lower level component
 * if you need more control over styles or rendering the slider's inner
 * components.
 *
 * @see Docs https://reacttraining.com/reach-ui/slider#sliderinput
 */
export const SliderInput = forwardRef<HTMLDivElement, SliderInputProps>(
  function SliderInput(
    {
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-valuetext": ariaValueText,
      defaultValue,
      disabled = false,
      value: controlledValue,
      getValueText,
      handleAlignment = SliderHandleAlignment.Center,
      max = 100,
      min = 0,
      name,
      onChange,
      onKeyDown,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      orientation = SliderOrientation.Horizontal,
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

    const id = useId(rest.id);

    const trackRef: TrackRef = useRef(null);
    const handleRef: HandleRef = useRef(null);
    const sliderRef: SliderRef = useRef(null);
    const ref = useForkedRef(sliderRef, forwardedRef);

    const [hasFocus, setHasFocus] = useState(false);
    const [isPointerDown, setPointerDown] = useState(false);
    const [internalValue, setValue] = useState(defaultValue || min);

    const { ref: x, ...handleDimensions } = useDimensions(handleRef);

    const _value = isControlled ? (controlledValue as number) : internalValue;
    const value = getAllowedValue(_value, min, max);
    const trackPercent = valueToPercent(value, min, max);
    const isVertical = orientation === SliderOrientation.Vertical;
    const step = stepProp || 1;

    const handleSize = isVertical
      ? handleDimensions.height
      : handleDimensions.width;

    const handlePosition = `calc(${trackPercent}% - ${
      handleAlignment === SliderHandleAlignment.Center
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
      (event: React.PointerEvent | PointerEvent) => {
        if (trackRef.current) {
          const {
            left,
            width,
            bottom,
            height,
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
        return null;
      },
      [isVertical, max, min, step]
    );

    // https://www.w3.org/TR/wai-aria-practices-1.2/#slider_kbd_interaction
    const handleKeyDown = wrapEvent(onKeyDown, event => {
      let flag = false;
      let newValue;
      const tenSteps = (max - min) / 10;
      const keyStep = stepProp || (max - min) / 100;

      switch (event.key) {
        // Decrease the value of the slider by one step.
        case "ArrowLeft":
        case "ArrowDown":
          newValue = value - keyStep;
          flag = true;
          break;
        // Increase the value of the slider by one step
        case "ArrowRight":
        case "ArrowUp":
          newValue = value + keyStep;
          flag = true;
          break;
        // Decrement the slider by an amount larger than the step change made by
        // `ArrowDown`.
        case "PageDown":
          newValue = value - tenSteps;
          flag = true;
          break;
        // Increment the slider by an amount larger than the step change made by
        // `ArrowUp`.
        case "PageUp":
          newValue = value + tenSteps;
          flag = true;
          break;
        // Set the slider to the first allowed value in its range.
        case "Home":
          newValue = min;
          flag = true;
          break;
        // Set the slider to the last allowed value in its range.
        case "End":
          newValue = max;
          flag = true;
          break;
        default:
          return;
      }

      if (flag) {
        event.preventDefault();
        newValue = roundValueToStep(newValue, keyStep);
        newValue = getAllowedValue(newValue, min, max);
        updateValue(newValue);
      }
    });

    const handlePointerDown = wrapEvent(onPointerDown, event => {
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
        if (newValue != null && newValue !== value) {
          updateValue(newValue);
        }
        handleRef.current.focus();
      }
    });

    const handlePointerUp = wrapEvent(onPointerUp, function(event) {
      if (sliderRef.current && event.pointerId) {
        sliderRef.current.releasePointerCapture &&
          sliderRef.current.releasePointerCapture(event.pointerId);
      }
      setPointerDown(false);
    });

    const valueText = getValueText ? getValueText(value) : ariaValueText;

    const trackHighlightStyle = isVertical
      ? {
          width: `100%`,
          height: `${trackPercent}%`,
          bottom: 0,
        }
      : {
          width: `${trackPercent}%`,
          height: `100%`,
          left: 0,
        };

    const ctx: ISliderContext = {
      ariaLabel,
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
      sliderId: id,
      sliderMax: max,
      sliderMin: min,
      value,
      valueText,
      disabled: !!disabled,
      isVertical,
      orientation,
      sliderStep: step,
      trackPercent,
      trackRef,
      trackHighlightStyle,
      updateValue,
    };

    useEffect(() => {
      const ownerDocument = getOwnerDocument(sliderRef.current) || document;
      const handlePointerMove = wrapEvent(onPointerMove, event => {
        const newValue = getNewValueFromPointer(event);
        if (newValue !== value) {
          updateValue(newValue);
        }
      });

      if (isPointerDown) {
        ownerDocument.addEventListener("pointermove", handlePointerMove);
      }

      return () => {
        ownerDocument.removeEventListener("pointermove", handlePointerMove);
      };
    }, [
      getNewValueFromPointer,
      isPointerDown,
      onPointerMove,
      updateValue,
      value,
    ]);

    useEffect(() => checkStyles("slider"), []);

    return (
      <SliderContext.Provider value={ctx}>
        <div
          {...rest}
          ref={ref}
          data-reach-slider-input=""
          data-disabled={disabled ? "" : undefined}
          data-orientation={orientation}
          tabIndex={-1}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          {isFunction(children)
            ? children({
                hasFocus,
                id,
                max,
                min,
                value,
                valueText,
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
              id={id && makeId("input", id)}
            />
          )}
        </div>
      </SliderContext.Provider>
    );
  }
);

/**
 * @see Docs https://reacttraining.com/reach-ui/slider#sliderinput-props
 */
export type SliderInputProps = Omit<SliderProps, "children"> & {
  /**
   * Slider expects `<SliderTrack>` as its child; The track will accept all
   * additional slider sub-components as children. It can also accept a
   * function/render prop as its child to expose some of its internal state
   * variables.
   *
   * @see Docs https://reacttraining.com/reach-ui/slider#sliderinput-children
   */
  children: React.ReactNode | SliderChildrenRender;
};

if (__DEV__) {
  SliderInput.displayName = "SliderInput";
  SliderInput.propTypes = {
    ...sliderPropTypes,
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * SliderTrack
 *
 * @see Docs https://reacttraining.com/reach-ui/slider#slidertrack
 */
export const SliderTrack = forwardRef<HTMLDivElement, SliderTrackProps>(
  function SliderTrack({ children, style = {}, ...props }, forwardedRef) {
    const { disabled, orientation, trackRef } = useSliderContext();
    const ref = useForkedRef(trackRef, forwardedRef);

    return (
      <div
        ref={ref}
        style={{ ...style, position: "relative" }}
        {...props}
        data-reach-slider-track=""
        data-disabled={disabled ? "" : undefined}
        data-orientation={orientation}
      >
        {children}
      </div>
    );
  }
);

/**
 * @see Docs https://reacttraining.com/reach-ui/slider#slidertrack-props
 */
export type SliderTrackProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * `SliderTrack` expects `<SliderHandle>`, at minimum, for the Slider to
   * function. All other Slider subcomponents should be passed as children
   * inside the `SliderTrack`.
   *
   * @see Docs https://reacttraining.com/reach-ui/slider#slidertrack-children
   */
  children: React.ReactNode;
};

if (__DEV__) {
  SliderTrack.displayName = "SliderTrack";
  SliderTrack.propTypes = {
    children: PropTypes.node.isRequired,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * SliderTrackHighlight
 *
 * The (typically) highlighted portion of the track that represents the space
 * between the slider's `min` value and its current value.
 *
 * TODO: Consider renaming to `SliderTrackProgress`
 *
 * @see Docs https://reacttraining.com/reach-ui/slider#slidertrackhighlight
 */
export const SliderTrackHighlight = forwardRef<
  HTMLDivElement,
  SliderTrackHighlightProps
>(function SliderTrackHighlight(
  { children, style = {}, ...props },
  forwardedRef
) {
  let { disabled, orientation, trackHighlightStyle } = useSliderContext();
  return (
    <div
      ref={forwardedRef}
      style={{ position: "absolute", ...trackHighlightStyle, ...style }}
      {...props}
      data-reach-slider-track-highlight=""
      data-disabled={disabled ? "" : undefined}
      data-orientation={orientation}
    />
  );
});

/**
 * `SliderTrackHighlight` accepts any props that a HTML div component accepts.
 * `SliderTrackHighlight` will not accept or render any children.
 *
 * @see Docs https://reacttraining.com/reach-ui/slider#slidertrackhighlight-props
 */
export type SliderTrackHighlightProps = React.HTMLAttributes<HTMLDivElement>;

if (__DEV__) {
  SliderTrackHighlight.displayName = "SliderTrackHighlight";
  SliderTrackHighlight.propTypes = {};
}

////////////////////////////////////////////////////////////////////////////////

/**
 * SliderHandle
 *
 * The handle that the user drags along the track to set the slider value.
 *
 * @see Docs https://reacttraining.com/reach-ui/slider#sliderhandle
 */
export const SliderHandle = forwardRef<HTMLDivElement, SliderHandleProps>(
  function SliderHandle(
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
      ariaLabel,
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
      valueText,
    } = useSliderContext();

    const ref = useForkedRef(handleRef, forwardedRef);

    return (
      <div
        aria-disabled={disabled || undefined}
        // If the slider has a visible label, it is referenced by
        // `aria-labelledby` on the slider element. Otherwise, the slider
        // element has a label provided by `aria-label`.
        // https://www.w3.org/TR/wai-aria-practices-1.2/#slider_roles_states_props
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
        // If the slider is vertically oriented, it has `aria-orientation` set
        // to vertical. The default value of `aria-orientation` for a slider is
        // horizontal.
        // https://www.w3.org/TR/wai-aria-practices-1.2/#slider_roles_states_props
        aria-orientation={orientation}
        // The slider element has the `aria-valuemax` property set to a decimal
        // value representing the maximum allowed value of the slider.
        // https://www.w3.org/TR/wai-aria-practices-1.2/#slider_roles_states_props
        aria-valuemax={sliderMax}
        // The slider element has the `aria-valuemin` property set to a decimal
        // value representing the minimum allowed value of the slider.
        // https://www.w3.org/TR/wai-aria-practices-1.2/#slider_roles_states_props
        aria-valuemin={sliderMin}
        // The slider element has the `aria-valuenow` property set to a decimal
        // value representing the current value of the slider.
        // https://www.w3.org/TR/wai-aria-practices-1.2/#slider_roles_states_props
        aria-valuenow={value}
        // If the value of `aria-valuenow` is not user-friendly, e.g., the day
        // of the week is represented by a number, the `aria-valuetext` property
        // is set to a string that makes the slider value understandable, e.g.,
        // "Monday".
        // https://www.w3.org/TR/wai-aria-practices-1.2/#slider_roles_states_props
        aria-valuetext={valueText}
        // The element serving as the focusable slider control has role
        // `slider`.
        // https://www.w3.org/TR/wai-aria-practices-1.2/#slider_roles_states_props
        role="slider"
        tabIndex={disabled ? -1 : 0}
        {...props}
        data-reach-slider-handle=""
        ref={ref}
        onBlur={wrapEvent(onBlur, () => {
          setHasFocus(false);
        })}
        onFocus={wrapEvent(onFocus, () => {
          setHasFocus(true);
        })}
        onKeyDown={wrapEvent(onKeyDown, onHandleKeyDown)}
        style={{
          position: "absolute",
          ...(isVertical
            ? { bottom: handlePosition }
            : { left: handlePosition }),
          ...style,
        }}
      />
    );
  }
);

/**
 * `SliderTrackHighlight` accepts any props that a HTML div component accepts.
 *
 * @see Docs https://reacttraining.com/reach-ui/slider#sliderhandle-props
 */
export type SliderHandleProps = React.HTMLAttributes<HTMLDivElement>;

if (__DEV__) {
  SliderHandle.displayName = "SliderHandle";
  SliderHandle.propTypes = {};
}

////////////////////////////////////////////////////////////////////////////////

/**
 * SliderMarker
 *
 * A fixed value marker. These can be used to illustrate a range of steps or
 * highlight important points along the slider track.
 *
 * @see Docs https://reacttraining.com/reach-ui/slider#slidermarker
 */
export const SliderMarker = forwardRef<HTMLDivElement, SliderMarkerProps>(
  function SliderMarker(
    { children, style = {}, value, ...props },
    forwardedRef
  ) {
    const {
      disabled,
      isVertical,
      orientation,
      sliderMin,
      sliderMax,
      value: sliderValue,
    } = useSliderContext();

    let inRange = !(value < sliderMin || value > sliderMax);
    let absoluteStartPosition = `${valueToPercent(
      value,
      sliderMin,
      sliderMax
    )}%`;

    let state =
      value < sliderValue
        ? "under-value"
        : value === sliderValue
        ? "at-value"
        : "over-value";

    return inRange ? (
      <div
        ref={forwardedRef}
        style={{
          position: "absolute",
          ...(isVertical
            ? { bottom: absoluteStartPosition }
            : { left: absoluteStartPosition }),
          ...style,
        }}
        {...props}
        data-reach-slider-marker=""
        data-disabled={disabled ? "" : undefined}
        data-orientation={orientation}
        data-state={state}
        data-value={value}
        children={children}
      />
    ) : null;
  }
);

/**
 * @see Docs https://reacttraining.com/reach-ui/slider#slidermarker-props
 */
export type SliderMarkerProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * The value to denote where the marker should appear along the track.
   *
   * @see Docs https://reacttraining.com/reach-ui/slider#slidermarker-value
   */
  value: number;
};

if (__DEV__) {
  SliderMarker.displayName = "SliderMarker";
  SliderMarker.propTypes = {
    value: PropTypes.number.isRequired,
  };
}

////////////////////////////////////////////////////////////////////////////////
function getAllowedValue(val: number, min: number, max: number) {
  return val > max ? max : val < min ? min : val;
}

function makeValuePrecise(value: number, step: number) {
  const stepDecimalPart = step.toString().split(".")[1];
  const stepPrecision = stepDecimalPart ? stepDecimalPart.length : 0;
  return Number(value.toFixed(stepPrecision));
}

function percentToValue(percent: number, min: number, max: number) {
  return (max - min) * percent + min;
}

function roundValueToStep(value: number, step: number) {
  return makeValuePrecise(Math.round(value / step) * step, step);
}

function useDimensions(ref: React.RefObject<HTMLElement | null>) {
  const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });
  // Many existing `useDimensions` type hooks will use `getBoundingClientRect`
  // getBoundingClientRect does not work here when borders are applied.
  // getComputedStyle is not as performant so we may want to create a utility to
  // check for any conflicts with box sizing first and only use
  // `getComputedStyle` if neccessary.
  /* const { width, height } = ref.current
    ? ref.current.getBoundingClientRect()
    : 0; */

  useIsomorphicLayoutEffect(() => {
    if (ref.current) {
      const { height: _newHeight, width: _newWidth } = window.getComputedStyle(
        ref.current
      );
      let newHeight = parseFloat(_newHeight);
      let newWidth = parseFloat(_newWidth);

      if (newHeight !== height || newWidth !== width) {
        setDimensions({ height: newHeight, width: newWidth });
      }
    }
  }, [ref, width, height]);
  return { ref, width, height };
}

function valueToPercent(value: number, min: number, max: number) {
  return ((value - min) * 100) / (max - min);
}

////////////////////////////////////////////////////////////////////////////////
// Types

type TrackRef = React.RefObject<HTMLDivElement | null>;
type HandleRef = React.RefObject<HTMLDivElement | null>;
type SliderRef = React.RefObject<HTMLDivElement | null>;

interface ISliderContext {
  ariaLabel: string | undefined;
  ariaLabelledBy: string | undefined;
  handleDimensions: {
    width: number;
    height: number;
  };
  handlePosition: string;
  handleRef: HandleRef;
  hasFocus: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onPointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (event: PointerEvent) => void;
  onPointerUp?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onHandleKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  setHasFocus: React.Dispatch<React.SetStateAction<boolean>>;
  sliderId: string | undefined;
  sliderMax: number;
  sliderMin: number;
  value: number;
  valueText: string | undefined;
  disabled: boolean;
  isVertical: boolean;
  orientation: SliderOrientation;
  sliderStep: number;
  trackPercent: number;
  trackRef: TrackRef;
  trackHighlightStyle: React.CSSProperties;
  updateValue: (newValue: any) => void;
}

type SliderChildrenRender = (props: {
  hasFocus?: boolean;
  id?: string | undefined;
  sliderId?: string | undefined;
  max?: number;
  min?: number;
  value?: number;
  valueText?: string | undefined;
}) => JSX.Element;
