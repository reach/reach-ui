/* eslint-disable jsx-a11y/accessible-emoji */
import React, { Fragment, cloneElement } from "react";
import { useTooltip, TooltipPopup } from "@reach/tooltip";
import { useTransition, animated } from "react-spring/web.cjs";
import "@reach/tooltip/styles.css";

export const name = "Animated";

animated.TooltipPopup = animated(TooltipPopup);
animated.TooltipContent = animated(TooltipPopup);

export function Example() {
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
          ariaLabel="3 Notifications"
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

function ExampleAnimatedTooltip({ children, ...rest }) {
  const [trigger, tooltip, isVisible] = useTooltip();

  const transitions = useTransition(isVisible ? tooltip : false, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { mass: 1, tension: 500, friction: 40 }
  });

  return (
    <Fragment>
      {cloneElement(children, trigger)}

      {transitions.map(
        ({ item: tooltip, props: styles, key }) =>
          tooltip && (
            <animated.TooltipContent
              key={key}
              {...tooltip}
              {...rest}
              style={styles}
            />
          )
      )}
    </Fragment>
  );
}
