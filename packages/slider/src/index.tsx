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
 * @see Docs     https://reach.tech/slider
 * @see Source   https://github.com/reach/reach-ui/tree/main/packages/slider
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#slider
 * @see Example  https://github.com/Stanko/aria-progress-range-slider
 * @see Example  http://www.oaa-accessibility.org/examplep/slider1/
 */

/* eslint-disable jsx-a11y/no-static-element-interactions */

import * as React from "react";
import PropTypes from "prop-types";
import { useId } from "@reach/auto-id";
import { useControlledState } from "@reach/utils/use-controlled-state";
import { isRightClick } from "@reach/utils/is-right-click";
import { useStableLayoutCallback } from "@reach/utils/use-stable-callback";
import { useIsomorphicLayoutEffect as useLayoutEffect } from "@reach/utils/use-isomorphic-layout-effect";
import { getOwnerDocument } from "@reach/utils/owner-document";
import { createNamedContext } from "@reach/utils/context";
import { isFunction } from "@reach/utils/type-check";
import { makeId } from "@reach/utils/make-id";
import { noop } from "@reach/utils/noop";
import {
  useCheckStyles,
  useControlledSwitchWarning,
} from "@reach/utils/dev-utils";
import { useComposedRefs } from "@reach/utils/compose-refs";
import { composeEventHandlers } from "@reach/utils/compose-event-handlers";
import warning from "tiny-warning";

import type * as Polymorphic from "@reach/utils/polymorphic";

// TODO: Remove in 1.0
type SliderAlignment = "center" | "contain";

enum SliderOrientation {
  Horizontal = "horizontal",
  Vertical = "vertical",
  // TODO: Add support for RTL slider
}

// TODO: Remove in 1.0
enum SliderHandleAlignment {
  // Handle is centered directly over the current value marker
  Center = "center",
  // Handle is contained within the bounds of the track, offset slightly from
  // the value's center mark to accommodate
  Contain = "contain",
}

// TODO: Remove in 1.0
const SLIDER_ORIENTATION_HORIZONTAL = SliderOrientation.Horizontal;
const SLIDER_ORIENTATION_VERTICAL = SliderOrientation.Vertical;
const SLIDER_HANDLE_ALIGN_CENTER = SliderHandleAlignment.Center;
const SLIDER_HANDLE_ALIGN_CONTAIN = SliderHandleAlignment.Contain;

const SliderContext = createNamedContext<ISliderContext>(
  "SliderContext",
  {} as ISliderContext
);
const useSliderContext = () => React.useContext(SliderContext);

// These proptypes are shared between the composed SliderInput component and the
// simplified Slider
const sliderPropTypes = {
  defaultValue: PropTypes.number,
  disabled: PropTypes.bool,
  getAriaLabel: PropTypes.func,
  getAriaValueText: PropTypes.func,
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
 * @see Docs https://reach.tech/slider#slider
 */
const Slider = React.forwardRef(function Slider(
  { children, ...props },
  forwardedRef
) {
  return (
    <SliderInput
      {...props}
      ref={forwardedRef}
      data-reach-slider=""
      __componentName="Slider"
    >
      <SliderTrack>
        <SliderRange />
        <SliderHandle />
        {children}
      </SliderTrack>
    </SliderInput>
  );
}) as Polymorphic.ForwardRefComponent<"div", SliderProps>;

/**
 * @see Docs https://reach.tech/slider#slider-props
 */
interface SliderProps {
  /**
   * `Slider` can accept `SliderMarker` children to enhance display of specific
   * values along the track.
   *
   * @see Docs https://reach.tech/slider#slider-children
   */
  children?: React.ReactNode;
  /**
   * The defaultValue is used to set an initial value for an uncontrolled
   * Slider.
   *
   * @see Docs https://reach.tech/slider#slider-defaultvalue
   */
  defaultValue?: number;
  /**
   * @see Docs https://reach.tech/slider#slider-disabled
   */
  disabled?: boolean;
  /**
   * Whether or not the slider should be disabled from user interaction.
   *
   * @see Docs https://reach.tech/slider#slider-value
   */
  value?: number;
  /**
   * A function used to set a human-readable name for the slider.
   *
   * @see Docs https://reach.tech/slider#slider-getarialabel
   */
  getAriaLabel?(value: number): string;
  /**
   * A function used to set a human-readable value text based on the slider's
   * current value.
   *
   * @see Docs https://reach.tech/slider#slider-getariavaluetext
   */
  getAriaValueText?(value: number): string;
  /**
   * Deprecated. Use `getAriaValueText` instead.
   *
   * @deprecated
   * @param value
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
   * @see Docs https://reach.tech/slider#slider-handlealignment
   */
  handleAlignment?: "center" | "contain" | SliderAlignment;
  /**
   * The maximum value of the slider. Defaults to `100`.
   *
   * @see Docs https://reach.tech/slider#slider-max
   */
  max?: number;
  /**
   * The minimum value of the slider. Defaults to `0`.
   *
   * @see Docs https://reach.tech/slider#slider-min
   */
  min?: number;
  /**
   * If the slider is used as a form input, it should accept a `name` prop to
   * identify its value in context of the form.
   *
   * @see Docs https://reach.tech/slider#slider-name
   */
  name?: string;
  /**
   * Callback that fires when the slider value changes. When the `value` prop is
   * set, the Slider state becomes controlled and `onChange` must be used to
   * update the value in response to user interaction.
   *
   * @see Docs https://reach.tech/slider#slider-onchange
   */
  onChange?(
    newValue: number,
    props?: {
      min?: number;
      max?: number;
      handlePosition?: string;
    }
  ): void;

  // We use native DOM events for the slider since they are global
  onMouseDown?(event: MouseEvent): void;
  onMouseMove?(event: MouseEvent): void;
  onMouseUp?(event: MouseEvent): void;
  onPointerDown?(event: PointerEvent): void;
  onPointerUp?(event: PointerEvent): void;
  onTouchEnd?(event: TouchEvent): void;
  onTouchMove?(event: TouchEvent): void;
  onTouchStart?(event: TouchEvent): void;

  /**
   * Sets the slider to horizontal or vertical mode.
   *
   * @see Docs https://reach.tech/slider#slider-orientation
   */
  orientation?: SliderOrientation;
  /**
   * The step attribute is a number that specifies the granularity that the
   * value must adhere to as it changes. Step sets minimum intervals of change,
   * creating a "snap" effect when the handle is moved along the track.
   *
   * @see Docs https://reach.tech/slider#slider-step
   */
  step?: number;
}

if (__DEV__) {
  Slider.displayName = "Slider";
  Slider.propTypes = {
    ...sliderPropTypes,
    children: PropTypes.node,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * SliderInput
 *
 * The parent component of the slider interface. This is a lower level component
 * if you need more control over styles or rendering the slider's inner
 * components.
 *
 * @see Docs https://reach.tech/slider#sliderinput
 */
const SliderInput = React.forwardRef(function SliderInput(
  {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-valuetext": ariaValueTextProp,
    as: Comp = "div",
    defaultValue,
    disabled = false,
    value: controlledValue,
    getAriaLabel,
    getAriaValueText,
    getValueText: DEPRECATED_getValueText, // TODO: Remove in 1.0
    handleAlignment = SliderHandleAlignment.Center,
    max = 100,
    min = 0,
    name,
    onChange,
    onKeyDown,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onPointerDown,
    onPointerUp,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
    orientation = SliderOrientation.Horizontal,
    step = 1,
    children,
    __componentName = "SliderInput",
    ...rest
  },
  forwardedRef
) {
  useControlledSwitchWarning(controlledValue, "value", __componentName);

  warning(
    !DEPRECATED_getValueText,
    "The `getValueText` prop in @reach/slider is deprecated. Please use `getAriaValueText` instead."
  );

  let touchId: TouchIdRef = React.useRef();

  let id = useId(rest.id);

  // Track whether or not the pointer is down without updating the component
  let pointerDownRef = React.useRef(false);

  let trackRef: TrackRef = React.useRef(null);
  let handleRef: HandleRef = React.useRef(null);
  let sliderRef: SliderRef = React.useRef(null);
  let ref = useComposedRefs(sliderRef, forwardedRef);

  let [hasFocus, setHasFocus] = React.useState(false);

  let { ref: x, ...handleDimensions } = useDimensions(handleRef);

  let [_value, setValue] = useControlledState(
    controlledValue,
    defaultValue || min
  );
  let value = clamp(_value, min, max);
  let trackPercent = valueToPercent(value, min, max);
  let isVertical = orientation === SliderOrientation.Vertical;

  let handleSize = isVertical
    ? handleDimensions.height
    : handleDimensions.width;

  // TODO: Consider removing the `handleAlignment` prop
  // We may want to use accept a `handlePosition` prop instead and let apps
  // define their own positioning logic, similar to how we do for popovers.
  let handlePosition = `calc(${trackPercent}% - ${
    handleAlignment === SliderHandleAlignment.Center
      ? `${handleSize}px / 2`
      : `${handleSize}px * ${trackPercent * 0.01}`
  })`;
  let handlePositionRef = React.useRef(handlePosition);
  useLayoutEffect(() => {
    handlePositionRef.current = handlePosition;
  }, [handlePosition]);

  let onChangeRef = React.useRef(onChange);
  useLayoutEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  let updateValue = React.useCallback(
    function updateValue(newValue) {
      setValue(newValue);
      if (onChangeRef.current) {
        // Prevent onChange from recreating the function
        // TODO: Reonsider the onChange callback API
        onChangeRef.current(newValue, {
          min,
          max,
          // Prevent handlePosition from recreating the function
          handlePosition: handlePositionRef.current,
        });
      }
    },
    [max, min, setValue]
  );

  let getNewValueFromEvent = React.useCallback(
    (event: SomePointerEvent) => {
      return getNewValue(getPointerPosition(event, touchId), trackRef.current, {
        step,
        orientation,
        min,
        max,
      });
    },
    [max, min, orientation, step]
  );

  // https://www.w3.org/TR/wai-aria-practices-1.2/#slider_kbd_interaction
  let handleKeyDown = useStableLayoutCallback((event: React.KeyboardEvent) => {
    if (disabled) {
      return;
    }

    let newValue: number;
    let tenSteps = (max - min) / 10;
    let keyStep = step || (max - min) / 100;

    switch (event.key) {
      // Decrease the value of the slider by one step.
      case "ArrowLeft":
      case "ArrowDown":
        newValue = value - keyStep;
        break;
      // Increase the value of the slider by one step
      case "ArrowRight":
      case "ArrowUp":
        newValue = value + keyStep;
        break;
      // Decrement the slider by an amount larger than the step change made by
      // `ArrowDown`.
      case "PageDown":
        newValue = value - tenSteps;
        break;
      // Increment the slider by an amount larger than the step change made by
      // `ArrowUp`.
      case "PageUp":
        newValue = value + tenSteps;
        break;
      // Set the slider to the first allowed value in its range.
      case "Home":
        newValue = min;
        break;
      // Set the slider to the last allowed value in its range.
      case "End":
        newValue = max;
        break;
      default:
        return;
    }

    event.preventDefault();
    newValue = clamp(
      step ? roundValueToStep(newValue, step, min) : newValue,
      min,
      max
    );
    updateValue(newValue);
  });

  let ariaValueText = DEPRECATED_getValueText
    ? DEPRECATED_getValueText(value)
    : getAriaValueText
    ? getAriaValueText(value)
    : ariaValueTextProp;

  let rangeStyle = { [isVertical ? "height" : "width"]: `${trackPercent}%` };

  let ctx: ISliderContext = {
    ariaLabel: getAriaLabel ? getAriaLabel(value) : ariaLabel,
    ariaLabelledBy,
    ariaValueText,
    handleDimensions,
    handleKeyDown,
    handlePosition,
    handleRef,
    hasFocus,
    onKeyDown,
    setHasFocus,
    sliderId: id,
    sliderMax: max,
    sliderMin: min,
    value,
    disabled: !!disabled,
    isVertical,
    orientation,
    trackPercent,
    trackRef,
    rangeStyle,
    updateValue,
  };

  // Slide events!
  // We will try to use pointer events if they are supported to leverage
  // setPointerCapture and releasePointerCapture. We'll fall back to separate
  // mouse and touch events.
  // TODO: This could be more concise
  let removeMoveEvents = React.useRef<() => void>(noop);
  let removeStartEvents = React.useRef<() => void>(noop);
  let removeEndEvents = React.useRef<() => void>(noop);

  // Store our event handlers in refs so we aren't attaching/detaching events
  // on every render if the user doesn't useCallback
  let appEvents = React.useRef({
    onMouseMove,
    onMouseDown,
    onMouseUp,
    onTouchStart,
    onTouchEnd,
    onTouchMove,
    onPointerDown,
    onPointerUp,
  });
  useLayoutEffect(() => {
    appEvents.current.onMouseMove = onMouseMove;
    appEvents.current.onMouseDown = onMouseDown;
    appEvents.current.onMouseUp = onMouseUp;
    appEvents.current.onTouchStart = onTouchStart;
    appEvents.current.onTouchEnd = onTouchEnd;
    appEvents.current.onTouchMove = onTouchMove;
    appEvents.current.onPointerDown = onPointerDown;
    appEvents.current.onPointerUp = onPointerUp;
  }, [onMouseMove, onMouseDown, onMouseUp, onTouchStart, onTouchEnd, onTouchMove, onPointerDown, onPointerUp]);

  let handleSlideStart = useStableLayoutCallback((event: SomePointerEvent) => {
    if (isRightClick(event)) return;

    if (disabled) {
      pointerDownRef.current = false;
      return;
    }

    let ownerDocument = getOwnerDocument(sliderRef.current)!;
    let ownerWindow = ownerDocument.defaultView || window;
    pointerDownRef.current = true;

    if ((event as TouchEvent).changedTouches) {
      // Prevent scrolling for touch events
      event.preventDefault();
      let touch = (event as TouchEvent).changedTouches?.[0];
      if (touch != null) {
        touchId.current = touch.identifier;
      }
    }

    let newValue = getNewValueFromEvent(event);
    if (newValue == null) {
      return;
    }
    ownerWindow.requestAnimationFrame(() => handleRef.current?.focus());
    updateValue(newValue);

    removeMoveEvents.current = addMoveListener();
    removeEndEvents.current = addEndListener();
  });

  let setPointerCapture = useStableLayoutCallback((event: PointerEvent) => {
    if (isRightClick(event)) return;
    if (disabled) {
      pointerDownRef.current = false;
      return;
    }
    pointerDownRef.current = true;
    sliderRef.current?.setPointerCapture(event.pointerId);
  });

  let releasePointerCapture = useStableLayoutCallback((event: PointerEvent) => {
    if (isRightClick(event)) return;
    sliderRef.current?.releasePointerCapture(event.pointerId);
    pointerDownRef.current = false;
  });

  let handlePointerMove = useStableLayoutCallback((event: SomePointerEvent) => {
    if (disabled || !pointerDownRef.current) {
      pointerDownRef.current = false;
      return;
    }

    let newValue = getNewValueFromEvent(event);
    if (newValue == null) {
      return;
    }
    updateValue(newValue);
  });

  let handleSlideStop = useStableLayoutCallback((event: SomePointerEvent) => {
    if (isRightClick(event)) return;

    pointerDownRef.current = false;

    let newValue = getNewValueFromEvent(event);
    if (newValue == null) {
      return;
    }

    touchId.current = undefined;

    removeMoveEvents.current();
    removeEndEvents.current();
  });

  let addMoveListener = React.useCallback(() => {
    let ownerDocument = getOwnerDocument(sliderRef.current)!;
    let touchListener = composeEventHandlers(
      appEvents.current.onTouchMove,
      handlePointerMove
    );
    let mouseListener = composeEventHandlers(
      appEvents.current.onMouseMove,
      handlePointerMove
    );
    ownerDocument.addEventListener("touchmove", touchListener);
    ownerDocument.addEventListener("mousemove", mouseListener);
    return () => {
      ownerDocument.removeEventListener("touchmove", touchListener);
      ownerDocument.removeEventListener("mousemove", mouseListener);
    };
  }, [handlePointerMove]);

  let addEndListener = React.useCallback(() => {
    let ownerDocument = getOwnerDocument(sliderRef.current)!;
    let ownerWindow = ownerDocument.defaultView || window;
    let pointerListener = composeEventHandlers(
      appEvents.current.onPointerUp,
      releasePointerCapture
    );
    let touchListener = composeEventHandlers(
      appEvents.current.onTouchEnd,
      handleSlideStop
    );
    let mouseListener = composeEventHandlers(
      appEvents.current.onMouseUp,
      handleSlideStop
    );
    if ("PointerEvent" in ownerWindow) {
      ownerDocument.addEventListener("pointerup", pointerListener);
    }
    ownerDocument.addEventListener("touchend", touchListener);
    ownerDocument.addEventListener("mouseup", mouseListener);
    return () => {
      if ("PointerEvent" in ownerWindow) {
        ownerDocument.removeEventListener("pointerup", pointerListener);
      }
      ownerDocument.removeEventListener("touchend", touchListener);
      ownerDocument.removeEventListener("mouseup", mouseListener);
    };
  }, [handleSlideStop, releasePointerCapture]);

  let addStartListener = React.useCallback(() => {
    // e.preventDefault is ignored by React's synthetic touchStart event, so
    // we attach the listener directly to the DOM node
    // https://github.com/facebook/react/issues/9809#issuecomment-413978405
    let sliderElement = sliderRef.current!;
    if (!sliderElement) {
      return noop;
    }

    let ownerDocument = getOwnerDocument(sliderElement)!;
    let ownerWindow = ownerDocument.defaultView || window;
    let touchListener = composeEventHandlers(
      appEvents.current.onTouchStart,
      handleSlideStart
    );
    let mouseListener = composeEventHandlers(
      appEvents.current.onMouseDown,
      handleSlideStart
    );
    let pointerListener = composeEventHandlers(
      appEvents.current.onPointerDown,
      setPointerCapture
    );
    sliderElement.addEventListener("touchstart", touchListener);
    sliderElement.addEventListener("mousedown", mouseListener);
    if ("PointerEvent" in ownerWindow) {
      sliderElement.addEventListener("pointerdown", pointerListener);
    }
    return () => {
      sliderElement.removeEventListener("touchstart", touchListener);
      sliderElement.removeEventListener("mousedown", mouseListener);
      if ("PointerEvent" in ownerWindow) {
        sliderElement.removeEventListener("pointerdown", pointerListener);
      }
    };
  }, [setPointerCapture, handleSlideStart]);

  React.useEffect(() => {
    removeStartEvents.current = addStartListener();

    return () => {
      removeStartEvents.current();
      removeEndEvents.current();
      removeMoveEvents.current();
    };
  }, [addStartListener]);

  useCheckStyles("slider");

  return (
    <SliderContext.Provider value={ctx}>
      <Comp
        {...rest}
        ref={ref}
        data-reach-slider-input=""
        data-disabled={disabled ? "" : undefined}
        data-orientation={orientation}
        tabIndex={-1}
      >
        {isFunction(children)
          ? children({
              hasFocus,
              id,
              max,
              min,
              value,
              ariaValueText,
              valueText: ariaValueText, // TODO: Remove in 1.0
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
      </Comp>
    </SliderContext.Provider>
  );
}) as Polymorphic.ForwardRefComponent<
  "div",
  SliderInputProps & { __componentName?: string }
>;

/**
 * @see Docs https://reach.tech/slider#sliderinput-props
 */
type SliderInputProps = Omit<SliderProps, "children"> & {
  /**
   * Slider expects `<SliderTrack>` as its child; The track will accept all
   * additional slider sub-components as children. It can also accept a
   * function/render prop as its child to expose some of its internal state
   * variables.
   *
   * @see Docs https://reach.tech/slider#sliderinput-children
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
 * @see Docs https://reach.tech/slider#slidertrack
 */
const SliderTrackImpl = React.forwardRef(function SliderTrack(
  { as: Comp = "div", children, style = {}, ...props },
  forwardedRef
) {
  const { disabled, orientation, trackRef } = useSliderContext();
  const ref = useComposedRefs(trackRef, forwardedRef);

  return (
    <Comp
      ref={ref}
      style={{ ...style, position: "relative" }}
      {...props}
      data-reach-slider-track=""
      data-disabled={disabled ? "" : undefined}
      data-orientation={orientation}
    >
      {children}
    </Comp>
  );
}) as Polymorphic.ForwardRefComponent<"div", SliderTrackProps>;

if (__DEV__) {
  SliderTrackImpl.displayName = "SliderTrack";
  SliderTrackImpl.propTypes = {
    children: PropTypes.node.isRequired,
  };
}

const SliderTrack = React.memo(SliderTrackImpl) as Polymorphic.MemoComponent<
  "div",
  SliderTrackProps
>;

/**
 * @see Docs https://reach.tech/slider#slidertrack-props
 */
interface SliderTrackProps {
  /**
   * `SliderTrack` expects `<SliderHandle>`, at minimum, for the Slider to
   * function. All other Slider subcomponents should be passed as children
   * inside the `SliderTrack`.
   *
   * @see Docs https://reach.tech/slider#slidertrack-children
   */
  children: React.ReactNode;
}

if (__DEV__) {
  SliderTrack.displayName = "SliderTrack";
}

////////////////////////////////////////////////////////////////////////////////

/**
 * SliderRange
 *
 * The (typically) highlighted portion of the track that represents the space
 * between the slider's `min` value and its current value.
 *
 * @see Docs https://reach.tech/slider#sliderrange
 */
const SliderRangeImpl = React.forwardRef(function SliderRange(
  { as: Comp = "div", children, style = {}, ...props },
  forwardedRef
) {
  let { disabled, orientation, rangeStyle } = useSliderContext();
  return (
    <Comp
      ref={forwardedRef}
      style={{ position: "absolute", ...rangeStyle, ...style }}
      {...props}
      data-reach-slider-range=""
      data-disabled={disabled ? "" : undefined}
      data-orientation={orientation}
    />
  );
}) as Polymorphic.ForwardRefComponent<"div", SliderRangeProps>;

if (__DEV__) {
  SliderRangeImpl.displayName = "SliderRange";
  SliderRangeImpl.propTypes = {};
}

const SliderRange = React.memo(SliderRangeImpl) as Polymorphic.MemoComponent<
  "div",
  SliderRangeProps
>;

// TODO: Remove in 1.0
const SliderTrackHighlightImpl = React.forwardRef(
  function SliderTrackHighlightImpl(props, ref) {
    if (__DEV__) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      React.useEffect(() => {
        warning(
          false,
          "`SliderTrackHighlight` has been deprecated in favor of `SliderRange` and will be dropped from a future version of Reach UI."
        );
      }, []);
    }
    return (
      <SliderRangeImpl
        data-reach-slider-track-highlight=""
        {...props}
        ref={ref}
      />
    );
  }
) as Polymorphic.ForwardRefComponent<"div", SliderRangeProps>;

if (__DEV__) {
  SliderTrackHighlightImpl.displayName = "SliderTrackHighlight";
  SliderTrackHighlightImpl.propTypes = SliderRangeImpl.propTypes;
}

export interface SliderTrackHighlightProps extends SliderRangeProps {}

/**
 * This component was renamed to `SliderRange` in a previous version of Reach
 * UI. `SliderTrackHighlight` will be dropped in a future version. We recommend
 * updating your projects to replace `SliderTrackHighlight` with `SliderRange`.
 *
 * @alias SliderRange
 */
export const SliderTrackHighlight = React.memo(
  SliderTrackHighlightImpl
) as Polymorphic.MemoComponent<"div", SliderRangeProps>;

/**
 * `SliderRange` accepts any props that a HTML div component accepts.
 * `SliderRange` will not accept or render any children.
 *
 * @see Docs https://reach.tech/slider#sliderrange-props
 */
interface SliderRangeProps {}

if (__DEV__) {
  SliderRange.displayName = "SliderRange";
}

////////////////////////////////////////////////////////////////////////////////

/**
 * SliderHandle
 *
 * The handle that the user drags along the track to set the slider value.
 *
 * @see Docs https://reach.tech/slider#sliderhandle
 */
const SliderHandleImpl = React.forwardRef(function SliderHandle(
  {
    // min,
    // max,
    as: Comp = "div",
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
    ariaValueText,
    disabled,
    handlePosition,
    handleRef,
    isVertical,
    handleKeyDown,
    orientation,
    setHasFocus,
    sliderMin,
    sliderMax,
    value,
  } = useSliderContext();

  const ref = useComposedRefs(handleRef, forwardedRef);

  return (
    <Comp
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
      aria-valuetext={ariaValueText}
      // The element serving as the focusable slider control has role
      // `slider`.
      // https://www.w3.org/TR/wai-aria-practices-1.2/#slider_roles_states_props
      role="slider"
      tabIndex={disabled ? -1 : 0}
      {...props}
      data-reach-slider-handle=""
      ref={ref}
      onBlur={composeEventHandlers(onBlur, () => {
        setHasFocus(false);
      })}
      onFocus={composeEventHandlers(onFocus, () => {
        setHasFocus(true);
      })}
      onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
      style={{
        position: "absolute",
        ...(isVertical ? { bottom: handlePosition } : { left: handlePosition }),
        ...style,
      }}
    />
  );
}) as Polymorphic.ForwardRefComponent<"div", SliderHandleProps>;

if (__DEV__) {
  SliderHandleImpl.displayName = "SliderHandle";
  SliderHandleImpl.propTypes = {};
}

const SliderHandle = React.memo(SliderHandleImpl) as Polymorphic.MemoComponent<
  "div",
  SliderHandleProps
>;

/**
 * `SliderRange` accepts any props that a HTML div component accepts.
 *
 * @see Docs https://reach.tech/slider#sliderhandle-props
 */
interface SliderHandleProps {}

if (__DEV__) {
  SliderHandle.displayName = "SliderHandle";
}

////////////////////////////////////////////////////////////////////////////////

/**
 * SliderMarker
 *
 * A fixed value marker. These can be used to illustrate a range of steps or
 * highlight important points along the slider track.
 *
 * @see Docs https://reach.tech/slider#slidermarker
 */
const SliderMarkerImpl = React.forwardRef(function SliderMarker(
  { as: Comp = "div", children, style = {}, value, ...props },
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
  let absoluteStartPosition = `${valueToPercent(value, sliderMin, sliderMax)}%`;

  let state =
    value < sliderValue
      ? "under-value"
      : value === sliderValue
      ? "at-value"
      : "over-value";

  return inRange ? (
    <Comp
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
}) as Polymorphic.ForwardRefComponent<"div", SliderMarkerProps>;

if (__DEV__) {
  SliderMarkerImpl.displayName = "SliderMarker";
  SliderMarkerImpl.propTypes = {
    value: PropTypes.number.isRequired,
  };
}

const SliderMarker = React.memo(SliderMarkerImpl) as Polymorphic.MemoComponent<
  "div",
  SliderMarkerProps
>;

/**
 * @see Docs https://reach.tech/slider#slidermarker-props
 */
interface SliderMarkerProps {
  /**
   * The value to denote where the marker should appear along the track.
   *
   * @see Docs https://reach.tech/slider#slidermarker-value
   */
  value: number;
}

if (__DEV__) {
  SliderMarker.displayName = "SliderMarker";
}

////////////////////////////////////////////////////////////////////////////////

function clamp(val: number, min: number, max: number) {
  return val > max ? max : val < min ? min : val;
}

/**
 * This handles the case when num is very small (0.00000001), js will turn
 * this into 1e-8. When num is bigger than 1 or less than -1 it won't get
 * converted to this notation so it's fine.
 *
 * @param num
 * @see https://github.com/mui-org/material-ui/blob/master/packages/material-ui/src/Slider/Slider.js#L69
 */
function getDecimalPrecision(num: number) {
  if (Math.abs(num) < 1) {
    const parts = num.toExponential().split("e-");
    const matissaDecimalPart = parts[0].split(".")[1];
    return (
      (matissaDecimalPart ? matissaDecimalPart.length : 0) +
      parseInt(parts[1], 10)
    );
  }

  const decimalPart = num.toString().split(".")[1];
  return decimalPart ? decimalPart.length : 0;
}

function percentToValue(percent: number, min: number, max: number) {
  return (max - min) * percent + min;
}

function roundValueToStep(value: number, step: number, min: number) {
  let nearest = Math.round((value - min) / step) * step + min;
  return Number(nearest.toFixed(getDecimalPrecision(step)));
}

function getPointerPosition(event: SomePointerEvent, touchId: TouchIdRef) {
  if (touchId.current !== undefined && (event as TouchEvent).changedTouches) {
    for (let i = 0; i < (event as TouchEvent).changedTouches.length; i += 1) {
      const touch = (event as TouchEvent).changedTouches[i];
      if (touch.identifier === touchId.current) {
        return {
          x: touch.clientX,
          y: touch.clientY,
        };
      }
    }

    return false;
  }

  return {
    x: (event as PointerEvent | MouseEvent).clientX,
    y: (event as PointerEvent | MouseEvent).clientY,
  };
}

function getNewValue(
  handlePosition:
    | {
        x: number;
        y: number;
      }
    | false,
  track: HTMLElement | null,
  props: {
    orientation: SliderOrientation;
    min: number;
    max: number;
    step?: number;
  }
) {
  let { orientation, min, max, step } = props;

  if (!track || !handlePosition) {
    return null;
  }

  let { left, width, bottom, height } = track.getBoundingClientRect();
  let isVertical = orientation === SliderOrientation.Vertical;
  let diff = isVertical ? bottom - handlePosition.y : handlePosition.x - left;
  let percent = diff / (isVertical ? height : width);
  let newValue = percentToValue(percent, min, max);

  return clamp(
    step ? roundValueToStep(newValue, step, min) : newValue,
    min,
    max
  );
}

function useDimensions(ref: React.RefObject<HTMLElement | null>) {
  const [{ width, height }, setDimensions] = React.useState({
    width: 0,
    height: 0,
  });
  // Many existing `useDimensions` type hooks will use `getBoundingClientRect`
  // getBoundingClientRect does not work here when borders are applied.
  // getComputedStyle is not as performant so we may want to create a utility to
  // check for any conflicts with box sizing first and only use
  // `getComputedStyle` if neccessary.
  /* const { width, height } = ref.current
    ? ref.current.getBoundingClientRect()
    : 0; */

  useLayoutEffect(() => {
    let ownerDocument = getOwnerDocument(ref.current)!;
    let ownerWindow = ownerDocument.defaultView || window;
    if (ref.current) {
      const {
        height: _newHeight,
        width: _newWidth,
      } = ownerWindow.getComputedStyle(ref.current);
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
type TouchIdRef = React.MutableRefObject<number | undefined>;

type SomePointerEvent = TouchEvent | MouseEvent;

interface ISliderContext {
  ariaLabel: string | undefined;
  ariaLabelledBy: string | undefined;
  ariaValueText: string | undefined;
  handleDimensions: {
    width: number;
    height: number;
  };
  handlePosition: string;
  handleRef: HandleRef;
  hasFocus: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  setHasFocus: React.Dispatch<React.SetStateAction<boolean>>;
  sliderId: string | undefined;
  sliderMax: number;
  sliderMin: number;
  value: number;
  disabled: boolean;
  isVertical: boolean;
  orientation: SliderOrientation;
  trackPercent: number;
  trackRef: TrackRef;
  rangeStyle: React.CSSProperties;
  updateValue: (newValue: any) => void;
}

type SliderChildrenRender = (props: {
  ariaValueText?: string | undefined;
  hasFocus?: boolean;
  id?: string | undefined;
  sliderId?: string | undefined;
  max?: number;
  min?: number;
  value?: number;
  valueText?: string | undefined; // TODO: Remove in 1.0
}) => JSX.Element;

////////////////////////////////////////////////////////////////////////////////
// Exports

export default Slider;
export type {
  SliderAlignment,
  SliderHandleProps,
  SliderInputProps,
  SliderMarkerProps,
  SliderProps,
  SliderRangeProps,
  SliderTrackProps,
};
export {
  Slider,
  SliderHandle,
  SliderHandleAlignment,
  SliderInput,
  SliderMarker,
  SliderOrientation,
  SliderTrack,
  SliderRange,
  SLIDER_HANDLE_ALIGN_CENTER,
  SLIDER_HANDLE_ALIGN_CONTAIN,
  SLIDER_ORIENTATION_HORIZONTAL,
  SLIDER_ORIENTATION_VERTICAL,
};
