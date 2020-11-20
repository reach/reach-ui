import * as React from "react";
import { wrapEvent } from "@reach/utils";
import { useTooltip, TooltipPopup } from "@reach/tooltip";
import {
  SliderInput,
  SliderHandle,
  SliderTrack,
  SliderTrackHighlight,
} from "@reach/slider";
import "@reach/tooltip/styles.css";
import "@reach/slider/styles.css";

let name = "With Tooltip";

function Example() {
  const handleRef = React.useRef();
  const [trigger, tooltip] = useTooltip();
  const centered = (triggerRect, tooltipRect) => {
    const triggerCenter = triggerRect.left + triggerRect.width / 2;
    const left = triggerCenter - tooltipRect.width / 2;
    const maxLeft = window.innerWidth - tooltipRect.width - 2;
    return {
      left: Math.min(Math.max(2, left), maxLeft) + window.pageXOffset,
      top: triggerRect.bottom + 8 + window.pageYOffset,
    };
  };

  // We want to show the tooltip whenever the handle is focused, regardless
  // of what happens with mouse events.
  const preventDefaultWhenFocused = React.useCallback((event) => {
    if (document.activeElement === event.currentTarget) {
      event.preventDefault();
    }
  }, []);

  const getEventHandler = (handler) =>
    wrapEvent(preventDefaultWhenFocused, handler);

  return (
    <SliderInput>
      {({ value }) => (
        <SliderTrack>
          <SliderTrackHighlight />
          <SliderHandle
            ref={handleRef}
            {...trigger}
            onMouseLeave={getEventHandler(trigger.onMouseLeave)}
            onMouseMove={getEventHandler(trigger.onMouseMove)}
            onMouseEnter={getEventHandler(trigger.onMouseEnter)}
            onMouseDown={getEventHandler(trigger.onMouseDown)}
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

Example.story = { name };
export const Comp = Example;
export default { title: "Slider" };
