/* eslint-disable jsx-a11y/accessible-emoji */
import * as React from "react";
import { useTooltip, TooltipPopup } from "@reach/tooltip";
import { useTransition, animated } from "@react-spring/web";
import "@reach/tooltip/styles.css";

let name = "Animated";

animated.TooltipPopup = animated(TooltipPopup);
animated.TooltipContent = animated(TooltipPopup);

function Example() {
  return (
    <div>
      <ExampleAnimatedTooltip label="Notifications">
        <button style={{ fontSize: 25 }}>
          <span aria-hidden>🔔</span>
        </button>
      </ExampleAnimatedTooltip>
      <ExampleAnimatedTooltip label="Settings">
        <button style={{ fontSize: 25 }}>
          <span aria-hidden>⚙️</span>
        </button>
      </ExampleAnimatedTooltip>

      <div style={{ float: "right" }}>
        <ExampleAnimatedTooltip
          label="Notifications"
          aria-label="3 Notifications"
        >
          <button style={{ fontSize: 25 }}>
            <span>🔔</span>
            <span>3</span>
          </button>
        </ExampleAnimatedTooltip>
      </div>
    </div>
  );
}

Example.storyName = name;
export { Example };

function ExampleAnimatedTooltip({ children, ...rest }) {
  const [trigger, tooltip, isVisible] = useTooltip();

  const transitions = useTransition(isVisible, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { mass: 1, tension: 500, friction: 40 },
  });

  return (
    <React.Fragment>
      {React.cloneElement(children, trigger)}
      {transitions(
        (styles, item) =>
          item && (
            <animated.TooltipContent {...tooltip} {...rest} style={styles} />
          )
      )}
    </React.Fragment>
  );
}
