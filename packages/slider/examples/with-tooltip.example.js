import React from "react";
import { useRect } from "../../rect/src";
import { useTooltip, TooltipPopup } from "../../tooltip/src";
import { wrapEvent } from "../../utils/src";
import "../styles.css";
import {
  Slider,
  SliderHandle,
  SliderTrack,
  SliderTrackHighlight
} from "../src";

export const name = "With Tooltip";

export const Example = () => {
  const handleRef = React.useRef();
  const [trigger, tooltip] = useTooltip();
  const centered = (triggerRect, tooltipRect) => {
    const triggerCenter = triggerRect.left + triggerRect.width / 2;
    const left = triggerCenter - tooltipRect.width / 2;
    const maxLeft = window.innerWidth - tooltipRect.width - 2;
    return {
      left: Math.min(Math.max(2, left), maxLeft) + window.pageXOffset,
      top: triggerRect.bottom + 8 + window.pageYOffset
    };
  };

  // We want to show the tooltip whenever the handle is focused, regardless
  // of what happens with mouse events.
  const preventDefaultWhenFocused = React.useCallback(event => {
    if (document.activeElement === event.currentTarget) {
      event.preventDefault();
    }
  }, []);

  const getEventHandler = handler =>
    wrapEvent(preventDefaultWhenFocused, handler);

  return (
    <Slider>
      {({ value, hasFocus }) => (
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
    </Slider>
  );
};
