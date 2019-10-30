declare module "@reach/tooltip" {
  import * as React from "react";

  export interface TriggerParams {
    "aria-describedby": string;
    "data-reach-tooltip-trigger": string;
    ref: React.Ref<any>;
    onMouseEnter: React.ReactEventHandler;
    onMouseMove: React.ReactEventHandler;
    onFocus: React.ReactEventHandler;
    onBlur: React.ReactEventHandler;
    onMouseLeave: React.ReactEventHandler;
    onKeyDown: React.ReactEventHandler;
    onMouseDown: React.ReactEventHandler;
  }

  export interface TooltipParams {
    id: string;
    triggerRect: DOMRect;
    isVisible: boolean;
  }

  export function useTooltip(
    attrs?: React.HTMLProps<any>
  ): [TriggerParams, TooltipParams, boolean];

  export type BaseTooltipProps = {
    ariaLabel?: string;
    position?: (position1: DOMRect, position2: DOMRect) => DOMRect;
    label: React.ReactNode;
  } & Omit<React.HTMLProps<HTMLDivElement>, "label">;

  export type TooltipProps = {
    children: React.ReactNode;
  } & BaseTooltipProps;

  export type TooltipPopupProps = {
    children?: React.ReactNode;
  } & BaseTooltipProps;

  const Tooltip: React.FunctionComponent<TooltipProps>;
  export const TooltipPopup: React.FunctionComponent<TooltipPopupProps>;
  export const TooltipContent: React.FunctionComponent<BaseTooltipProps>;
  export default Tooltip;
}
