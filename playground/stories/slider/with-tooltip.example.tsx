import * as React from "react";
import { useTooltip, TooltipPopup } from "@reach/tooltip";
import type { Position } from "@reach/tooltip";
import {
  SliderInput,
  SliderHandle,
  SliderTrack,
  SliderRange,
} from "@reach/slider";
import "@reach/tooltip/styles.css";
import "@reach/slider/styles.css";
import "./examples.css";

let name = "With Tooltip";

function Example() {
  let handleRef = React.useRef<HTMLDivElement | null>(null);
  let [trigger, tooltip] = useTooltip();
  let centered: Position = (triggerRect, tooltipRect) => {
    if (!triggerRect || !tooltipRect) {
      return {};
    }
    let triggerCenter = triggerRect.left + triggerRect.width / 2;
    let left = triggerCenter - tooltipRect.width / 2;
    let maxLeft = window.innerWidth - tooltipRect.width - 2;
    return {
      left: Math.min(Math.max(2, left), maxLeft) + window.pageXOffset,
      top: triggerRect.bottom + 8 + window.pageYOffset,
    };
  };

  // We want to show the tooltip whenever the handle is focused, regardless
  // of what happens with mouse events.
  let preventDefaultWhenFocused = React.useCallback(
    <EventType extends React.SyntheticEvent | Event>(event: EventType) => {
      if (document.activeElement === event.currentTarget) {
        event.preventDefault();
      }
    },
    []
  );

  return (
    <SliderInput>
      {({ value }) => (
        <SliderTrack>
          <SliderRange />
          <SliderHandle
            {...trigger}
            ref={handleRef}
            onMouseLeave={composeEventHandlers(
              preventDefaultWhenFocused,
              trigger.onMouseLeave
            )}
            onMouseMove={composeEventHandlers(
              preventDefaultWhenFocused,
              trigger.onMouseMove
            )}
            onMouseEnter={composeEventHandlers(
              preventDefaultWhenFocused,
              trigger.onMouseEnter
            )}
            onMouseDown={composeEventHandlers(
              preventDefaultWhenFocused,
              trigger.onMouseDown
            )}
          />
          <TooltipPopup
            {...tooltip}
            position={centered}
            label={`Value: ${value}`}
          />
        </SliderTrack>
      )}
    </SliderInput>
  );
}

Example.storyName = name;
export { Example };

export function composeEventHandlers<
  EventType extends React.SyntheticEvent | Event
>(
  theirHandler: ((event: EventType) => any) | undefined,
  ourHandler: ((event: EventType) => any) | undefined
): (event: EventType) => any {
  return (event) => {
    theirHandler?.(event);
    if (!event.defaultPrevented) {
      return ourHandler?.(event);
    }
  };
}
