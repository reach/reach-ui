/**
 * A UI input component where the user selects a value from within a given
 * range. A Slider has a handle that can be moved along a track to change its
 * value. When the user's mouse or focus is on the Slider's handle, the value
 * can be incremented with keyboard controls.
 *
 * @see Docs     https://reacttraining.com/reach-ui/slider
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/slider
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.1/#slider
 */

import * as React from "react";

export enum SliderAlignment {
  center = "center",
  contain = "contain"
}

export enum SliderOrientation {
  horizontal = "horizontal",
  vertical = "vertical"
}

export const SLIDER_ORIENTATION_HORIZONTAL: SliderOrientation.horizontal;

export const SLIDER_ORIENTATION_VERTICAL: SliderOrientation.vertical;

export const SLIDER_HANDLE_ALIGN_CENTER: SliderAlignment.center;

export const SLIDER_HANDLE_ALIGN_CONTAIN: SliderAlignment.contain;

type SliderChildrenRender = (props: {
  hasFocus?: boolean;
  id?: string;
  sliderId?: string;
  max?: number;
  min?: number;
  value?: number;
  valueText?: string;
}) => void;

/**
 * @see Docs https://reacttraining.com/reach-ui/slider#slider-props
 */
export type SliderProps = React.HTMLProps<HTMLDivElement> & {
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
  /**
   * Sets the slider to horizontal or vertical mode.
   *
   * @see Docs https://reacttraining.com/reach-ui/slider#slider-orientation
   */
  orientation?: "horizontal" | "vertical" | SliderOrientation;
  /**
   * The step attribute is a number that specifies the granularity that the
   * value must adhere to as it changes. Step sets minimum intervals of change,
   * creating a "snap" effect when the handle is moved along the track.
   *
   * @see Docs https://reacttraining.com/reach-ui/slider#slider-step
   */
  step?: number;
};

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

/**
 * @see Docs https://reacttraining.com/reach-ui/slider#slidertrack-props
 */
export type SliderTrackProps = React.HTMLProps<HTMLDivElement> & {
  /**
   * `SliderTrack` expects `<SliderHandle>`, at minimum, for the Slider to
   * function. All other Slider subcomponents should be passed as children
   * inside the `SliderTrack`.
   *
   * @see Docs https://reacttraining.com/reach-ui/slider#slidertrack-children
   */
  children: React.ReactNode;
};

/**
 * `SliderTrackHighlight` accepts any props that a HTML div component accepts.
 * `SliderTrackHighlight` will not accept or render any children.
 *
 * @see Docs https://reacttraining.com/reach-ui/slider#slidertrackhighlight-props
 */
export type SliderTrackHighlightProps = React.HTMLProps<HTMLDivElement>;

/**
 * `SliderTrackHighlight` accepts any props that a HTML div component accepts.
 *
 * @see Docs https://reacttraining.com/reach-ui/slider#sliderhandle-props
 */
export type SliderHandleProps = React.HTMLProps<HTMLDivElement>;

/**
 * @see Docs https://reacttraining.com/reach-ui/slider#slidermarker-props
 */
export type SliderMarkerProps = React.HTMLProps<HTMLDivElement> & {
  /**
   * The value to denote where the marker should appear along the track.
   *
   * @see Docs https://reacttraining.com/reach-ui/slider#slidermarker-value
   */
  value: number;
};

/**
 * @see Docs https://reacttraining.com/reach-ui/slider#slider
 */
export const Slider: React.FunctionComponent<SliderProps>;

/**
 * @see Docs https://reacttraining.com/reach-ui/slider#slidertrack
 */
export const SliderTrack: React.FunctionComponent<SliderTrackProps>;

/**
 * The (typically) highlighted portion of the track that represents the space
 * between the slider's `min` value and its current value.
 *
 * @see Docs https://reacttraining.com/reach-ui/slider#slidertrackhighlight
 */
export const SliderTrackHighlight: React.FunctionComponent<
  SliderTrackHighlightProps
>;

/**
 * The handle that the user drags along the track to set the slider value.
 *
 * @see Docs https://reacttraining.com/reach-ui/slider#sliderhandle
 */
export const SliderHandle: React.FunctionComponent<SliderHandleProps>;

/**
 * The parent component of the slider interface. This is a lower level component
 * if you need more control over styles or rendering the slider's inner
 * components.
 *
 * @see Docs https://reacttraining.com/reach-ui/slider#sliderinput
 */
export const SliderInput: React.FunctionComponent<SliderInputProps>;

/**
 * A fixed value marker. These can be used to illustrate a range of steps or
 * highlight important points along the slider track.
 *
 * @see Docs https://reacttraining.com/reach-ui/slider#slidermarker
 */
export const SliderMarker: React.FunctionComponent<SliderMarkerProps>;

export default Slider;
