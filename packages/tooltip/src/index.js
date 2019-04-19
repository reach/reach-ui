import React, {
  Fragment,
  cloneElement,
  Children,
  useState,
  useRef,
  forwardRef
} from "react";
import { useId } from "@reach/auto-id";
import { wrapEvent } from "@reach/utils";
import Portal from "@reach/portal";
import VisuallyHidden from "@reach/visually-hidden";
import { useRect } from "@reach/rect";
import { node, string, func } from "prop-types";

////////////////////////////////////////////////////////////////////////////////
export default function Tooltip({ children, label, ariaLabel, ...rest }) {
  const [trigger, tooltip] = useTooltip();
  return (
    <Fragment>
      {cloneElement(Children.only(children), trigger)}
      <TooltipPopup
        label={label}
        ariaLabel={ariaLabel}
        {...tooltip}
        {...rest}
      />
    </Fragment>
  );
}

Tooltip.propTypes = {
  children: node.isRequired,
  label: node.isRequired,
  ariaLabel: string
};

////////////////////////////////////////////////////////////////////////////////
export const TooltipPopup = forwardRef(function TooltipPopup(
  {
    // own props
    label, // could use children but want to encourage simple strings
    ariaLabel,
    position,

    // hook spread props
    isVisible,
    id,
    triggerRect,
    ...rest
  },
  forwardRef
) {
  return isVisible ? (
    <Portal>
      <TooltipContent
        label={label}
        ariaLabel={ariaLabel}
        position={position}
        isVisible={isVisible}
        id={id}
        triggerRect={triggerRect}
        ref={forwardRef}
        {...rest}
      />
    </Portal>
  ) : null;
});

TooltipPopup.propTypes = {
  label: node.isRequired,
  ariaLabel: string,
  position: func
};

// Need a separate component so that useRect works inside the portal
const TooltipContent = forwardRef(function TooltipContent(
  {
    label,
    ariaLabel,
    position = positionDefault,
    isVisible,
    id,
    triggerRect,
    style,
    ...rest
  },
  forwardRef
) {
  const useAriaLabel = ariaLabel != null;
  const tooltipRef = useRef();
  const tooltipRect = useRect(tooltipRef, isVisible);
  return (
    <Fragment>
      <div
        data-reach-tooltip
        role={useAriaLabel ? undefined : "tooltip"}
        id={useAriaLabel ? undefined : id}
        children={label}
        style={{
          ...style,
          ...getStyles(position, triggerRect, tooltipRect)
        }}
        ref={node => {
          tooltipRef.current = node;
          if (forwardRef) forwardRef(node);
        }}
        {...rest}
      />
      {ariaLabel && (
        <VisuallyHidden role="tooltip" id={id}>
          {ariaLabel}
        </VisuallyHidden>
      )}
    </Fragment>
  );
});

////////////////////////////////////////////////////////////////////////////////
export function useTooltip({
  onMouseMove,
  onMouseLeave,
  onFocus,
  onBlur,
  ref
} = {}) {
  const [isVisible, setIsShowing] = useState(false);

  // hopefully they always pass a ref if they ever pass one
  const triggerRef = ref || useRef();
  const triggerRect = useRect(triggerRef, isVisible);

  const id = `tooltip:${useId()}`;
  const onMouseRest = useMouseRest();

  const show = () => setIsShowing(true);
  const hide = () => setIsShowing(false);

  const trigger = {
    "aria-labelledby": id,
    "data-reach-tooltip-trigger": "",
    ref: triggerRef,
    onFocus: wrapEvent(onFocus, show),
    onBlur: wrapEvent(onBlur, hide),
    ...onMouseRest(show, {
      onMouseMove,
      onMouseLeave: wrapEvent(onMouseLeave, hide)
    })
  };

  const tooltip = {
    id,
    triggerRect,
    isVisible
  };

  return [trigger, tooltip, isVisible];
}

////////////////////////////////////////////////////////////////////////////////
let showingGlobally = false;
let sharedTimer;

// TODO: research longpress tooltips on Android, iOS, implement here.
// - Probably want to position it by default above, since your thumb
//   is below and would cover it
// - I'm thinking after longpress, display the tooltip and cancel any
//   click events. Then on touchend, hide the tooltip after a timer
//   in case their hand is obstructing it, then can remove and read
//   the tooltip
function useMouseRest(delay = 100) {
  return (handler, props) => {
    let timer;
    let called = false;
    let touching = false;

    const onMouseMove = wrapEvent(props.onMouseMove, event => {
      if (called || touching) return;

      const call = () => {
        called = true;
        showingGlobally = true;
        handler(event);
      };

      if (showingGlobally) {
        clearTimeout(sharedTimer);
        call();
      } else {
        clearTimeout(timer);
        timer = setTimeout(call, delay);
      }
    });

    const onMouseLeave = wrapEvent(props.onMouseLeave, event => {
      clearTimeout(timer);
      called = false;
      sharedTimer = setTimeout(() => {
        showingGlobally = false;
      }, delay);
    });

    return { onMouseLeave, onMouseMove };
  };
}

// TODO: Mostly copy/pasted from menu-button, maybe should make into a util,
// but this is fine for now.

// feels awkward when it's perfectly aligned w/ the trigger
const OFFSET = 8;

let getStyles = (position, triggerRect, tooltipRect) => {
  let haventMeasuredTooltipYet = !tooltipRect;
  if (haventMeasuredTooltipYet) {
    return { visibility: "hidden" };
  }
  return position(triggerRect, tooltipRect);
};

let positionDefault = (triggerRect, tooltipRect) => {
  let styles = {
    left: `${triggerRect.left + window.scrollX}px`,
    top: `${triggerRect.top + triggerRect.height + window.scrollY}px`
  };

  let collisions = {
    top: triggerRect.top - tooltipRect.height < 0,
    right: window.innerWidth < triggerRect.left + tooltipRect.width,
    bottom:
      window.innerHeight < triggerRect.bottom + tooltipRect.height + OFFSET,
    left: triggerRect.left - tooltipRect.width < 0
  };

  const directionRight = collisions.right && !collisions.left;
  const directionUp = collisions.bottom && !collisions.top;

  return {
    ...styles,
    left: directionRight
      ? `${triggerRect.right +
          OFFSET / 2 -
          tooltipRect.width +
          window.scrollX}px`
      : `${triggerRect.left - OFFSET / 2 + window.scrollX}px`,
    top: directionUp
      ? `${triggerRect.top - OFFSET - tooltipRect.height + window.scrollY}px`
      : `${triggerRect.top + OFFSET + triggerRect.height + window.scrollY}px`
  };
};
