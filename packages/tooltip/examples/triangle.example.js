/* eslint-disable jsx-a11y/accessible-emoji */
import React, { Fragment, cloneElement } from "react";
import { useTooltip, TooltipPopup } from "@reach/tooltip";
import { getScrollbarOffset } from "@reach/utils";
import "@reach/tooltip/styles.css";

let name = "Triangle";

function Example() {
  return (
    <div>
      <ExampleTriangle label="Notifications">
        <button style={{ fontSize: 25 }}>
          <span aria-hidden>🔔</span>
        </button>
      </ExampleTriangle>
      <ExampleTriangle label="Settings">
        <button style={{ fontSize: 25 }}>
          <span aria-hidden>⚙️</span>
        </button>
      </ExampleTriangle>

      <div style={{ float: "right" }}>
        <ExampleTriangle label="Notifications" aria-label="3 Notifications">
          <button style={{ fontSize: 25 }}>
            <span>🔔</span>
            <span>3</span>
          </button>
        </ExampleTriangle>
      </div>
      <div style={{ marginTop: 600 }}>Hi</div>
    </div>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Tooltip" };

// Center the tooltip, but collisions will win
const centered = (triggerRect, tooltipRect) => {
  const triggerCenter = triggerRect.left + triggerRect.width / 2;
  const left = triggerCenter - tooltipRect.width / 2;
  const maxLeft = window.innerWidth - tooltipRect.width - getScrollbarOffset();
  return {
    left: Math.min(Math.max(2, left), maxLeft) + window.scrollX,
    top: triggerRect.bottom + 8 + window.scrollY,
  };
};

function ExampleTriangle({ children, ...rest }) {
  // get the props from useTooltip
  const [trigger, tooltip] = useTooltip();

  // destructure off what we need to position the triangle
  const { isVisible, triggerRect } = tooltip;

  return (
    <Fragment>
      {cloneElement(children, trigger)}

      {isVisible && (
        // the Triangle, we position it relative to the trigger, not the popup
        // so that collisions don't have a triangle pointing off to nowhere
        <div
          style={{
            position: "absolute",
            left: triggerRect && triggerRect.left - 10 + triggerRect.width / 2,
            top: triggerRect && triggerRect.bottom,
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderBottom: "10px solid black",
          }}
        />
      )}
      <TooltipPopup
        {...tooltip}
        {...rest}
        style={{
          background: "black",
          color: "white",
          border: "none",
          borderRadius: "3px",
          padding: "0.5em 1em",
        }}
        position={centered}
      />
    </Fragment>
  );
}
