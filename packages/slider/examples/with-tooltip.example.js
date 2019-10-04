import React from "react";
import "../styles.css";
import Tooltip, { useTooltip, TooltipPopup } from "../../tooltip/src";
import Portal from "../../portal/src";
import { wrapEvent } from "../../utils/src";
import {
  Slider,
  SliderHandle,
  SliderTrack,
  SliderTrackHighlight
} from "../src";

export const name = "With Tooltip";

// Currently breaks keyboard events. :(

export const Example = () => {
  const [trigger, tooltip] = useTooltip();
  const { isVisible, triggerRect } = tooltip;
  const preventDefaultWhenFocused = React.useCallback(event => {
    if (document.activeElement === event.currentTarget) {
      event.preventDefault();
    }
  }, []);
  return (
    <Slider>
      <SliderTrack>
        <SliderTrackHighlight />
        <>
          <SliderHandle
            {...trigger}
            onMouseLeave={wrapEvent(
              preventDefaultWhenFocused,
              trigger.onMouseLeave
            )}
            onMouseMove={wrapEvent(
              preventDefaultWhenFocused,
              trigger.onMouseMove
            )}
            onMouseEnter={wrapEvent(
              preventDefaultWhenFocused,
              trigger.onMouseEnter
            )}
            onMouseDown={wrapEvent(
              preventDefaultWhenFocused,
              trigger.onMouseDown
            )}
          />
          <TooltipPopup {...tooltip} label="Whoa" />
        </>
      </SliderTrack>
    </Slider>
  );
};
