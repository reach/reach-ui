import * as React from "react";

export type SliderProps = React.HTMLProps<HTMLDivElement> & {
  children: React.ReactNode;
  defaultValue?: number;
  disabled?: boolean;
  value?: number;
  getValueText?(value: number): string;
  handleAlignment: "center" | "contain";
  max?: number;
  min?: number;
  name?: string;
  onChange?(
    newValue: number,
    props?: {
      min?: number;
      max?: number;
      handlePosition?: string;
    }
  ): void;
  orientation?: "horizontal" | "vertical";
  step?: number;
};

export type SliderTrackProps = React.HTMLProps<HTMLDivElement> & {
  children: React.ReactNode;
};

export type SliderTrackHighlightProps = React.HTMLProps<HTMLDivElement>;

export type SliderHandleProps = React.HTMLProps<HTMLDivElement>;

export type SliderMarkerProps = React.HTMLProps<HTMLDivElement>;

declare const Slider: React.FunctionComponent<SliderProps>;

declare const SliderTrack: React.FunctionComponent<SliderTrackProps>;

declare const SliderTrackHighlight: React.FunctionComponent<
  SliderTrackHighlightProps
>;

declare const SliderHandle: React.FunctionComponent<SliderHandleProps>;

declare const SliderMarker: React.FunctionComponent<SliderMarkerProps>;
