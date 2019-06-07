import React, { useRef, forwardRef, useEffect } from "react";
import Portal from "@reach/portal";
import { useRect } from "@reach/rect";
import { assignRef } from "@reach/utils";
import tabbable from "tabbable";

export default forwardRef(function Popover(props, ref) {
  return (
    <Portal>
      <PopoverImpl ref={ref} {...props} />
    </Portal>
  );
});

// Popover is conditionally rendered so we can't start measuring until it shows
// up, so useRect needs to live down here not up in Popover
const PopoverImpl = forwardRef(function PopoverImpl(
  { targetRef, position = positionDefault, style, ...rest },
  forwardedRef
) {
  const popoverRef = useRef();
  const popoverRect = useRect(popoverRef);
  const targetRect = useRect(targetRef);

  useSimulateTabNavigationForReactTree(targetRef, popoverRef);

  return (
    <div
      data-reach-popover=""
      ref={node => {
        assignRef(popoverRef, node);
        assignRef(forwardedRef, node);
      }}
      style={{
        ...style,
        position: "absolute",
        ...getStyles(position, targetRect, popoverRect)
      }}
      {...rest}
    />
  );
});

const getStyles = (position, targetRect, popoverRect) => {
  const needToMeasurePopup = !popoverRect;
  if (needToMeasurePopup) {
    return { visibility: "hidden" };
  }
  return position(targetRect, popoverRect);
};

export function positionDefault(targetRect, popoverRect) {
  const { directionUp, directionRight } = getCollisions(
    targetRect,
    popoverRect
  );
  return {
    left: directionRight
      ? `${targetRect.right - popoverRect.width + window.pageXOffset}px`
      : `${targetRect.left + window.pageXOffset}px`,
    top: directionUp
      ? `${targetRect.top - popoverRect.height + window.pageYOffset}px`
      : `${targetRect.top + targetRect.height + window.pageYOffset}px`
  };
}

export function positionMatchWidth(targetRect, popoverRect) {
  const { directionUp } = getCollisions(targetRect, popoverRect);
  return {
    width: targetRect.width,
    left: targetRect.left,
    top: directionUp
      ? `${targetRect.top - popoverRect.height + window.pageYOffset}px`
      : `${targetRect.top + targetRect.height + window.pageYOffset}px`
  };
}

// Finish this another time
// export function positionHorizontalCenter(targetRect, popoverRect) {
//   const targetCenter = targetRect.width / 2 + targetRect.left;
//   const popoverHalf = popoverRect.width / 2;

//   const collisions = {
//     right: window.innerWidth < targetCenter - popoverHalf,
//     left: targetCenter - popoverHalf < 0
//     // top:
//     // bottom:
//   };

//   return {
//     left: collisions.right
//       ? `${targetRect.right - popoverRect.width + window.pageXOffset}px`
//       : collisions.left ? `` : ``
//   };
// }

function getCollisions(
  targetRect,
  popoverRect,
  offsetLeft = 0,
  offsetBottom = 0
) {
  const collisions = {
    top: targetRect.top - popoverRect.height < 0,
    right: window.innerWidth < targetRect.left + popoverRect.width - offsetLeft,
    bottom:
      window.innerHeight <
      targetRect.bottom + popoverRect.height - offsetBottom,
    left: targetRect.left - popoverRect.width < 0
  };

  const directionRight = collisions.right && !collisions.left;
  const directionUp = collisions.bottom && !collisions.top;

  return { directionRight, directionUp };
}

// Heads up, my jQuery past haunts this function. This hook scopes the tab
// order to the React element tree, instead of the DOM tree. This way, when the
// user navigates with tab from the targetRef, the tab order moves into the
// popup, and then out of the popup back to the rest of the document.
// (We call targetRef, triggerRef inside this function to avoid confusion with
// event.target)
function useSimulateTabNavigationForReactTree(triggerRef, popoverRef) {
  const doc = triggerRef.current.ownerDocument; // maybe in devtools

  function handleKeyDown(event) {
    if (event.key === "Tab" && tabbable(popoverRef.current).length === 0) {
      return;
    }

    if (event.key === "Tab" && event.shiftKey) {
      if (shiftTabbedFromElementAfterTrigger(event)) {
        focusLastTabbableInPopover(event);
      } else if (shiftTabbedOutOfPopover(event)) {
        focusTriggerRef(event);
      } else if (shiftTabbedToBrowserChrome(event)) {
        disableTabbablesInPopover(event);
      }
    } else if (event.key === "Tab") {
      if (tabbedFromTriggerToPopover(event)) {
        focusFirstPopoverTabbable(event);
      } else if (tabbedOutOfPopover(event)) {
        focusTabbableAfterTrigger(event);
      } else if (tabbedToBrowserChrome(event)) {
        disableTabbablesInPopover(event);
      }
    }
  }

  useEffect(() => {
    doc.addEventListener("keydown", handleKeyDown);
    return () => doc.removeEventListener("keydown", handleKeyDown);
  }, []);

  function getElementAfterTrigger() {
    const elements = tabbable(doc);
    const targetIndex = elements.indexOf(triggerRef.current);
    return elements[targetIndex + 1];
  }

  function tabbedFromTriggerToPopover() {
    return triggerRef.current === document.activeElement;
  }
  function focusFirstPopoverTabbable(event) {
    const elements = tabbable(popoverRef.current);
    if (elements[0]) {
      event.preventDefault();
      elements[0].focus();
    }
  }

  function tabbedOutOfPopover(event) {
    const inPopover = popoverRef.current.contains(document.activeElement);
    if (inPopover) {
      const elements = tabbable(popoverRef.current);
      return elements[elements.length - 1] === document.activeElement;
    }
  }
  function focusTabbableAfterTrigger(event) {
    const elementAfterTrigger = getElementAfterTrigger();
    if (elementAfterTrigger) {
      event.preventDefault();
      elementAfterTrigger.focus();
    }
  }

  function shiftTabbedFromElementAfterTrigger(event) {
    if (!event.shiftKey) return;
    const elementAfterTrigger = getElementAfterTrigger();
    return event.target === elementAfterTrigger;
  }
  function focusLastTabbableInPopover(event) {
    const elements = tabbable(popoverRef.current);
    const last = elements[elements.length - 1];
    if (last) {
      event.preventDefault();
      last.focus();
    }
  }

  function shiftTabbedOutOfPopover(event) {
    const elements = tabbable(popoverRef.current);
    return elements.length === 0 ? false : event.target === elements[0];
  }
  function focusTriggerRef(event) {
    event.preventDefault();
    triggerRef.current.focus();
  }

  function tabbedToBrowserChrome(event) {
    const elements = tabbable(doc).filter(
      element => !popoverRef.current.contains(element)
    );
    return event.target === elements[elements.length - 1];
  }

  function shiftTabbedToBrowserChrome(event) {
    // we're assuming the popover will never contain the first tabbable
    // element, and it better not, because the trigger needs to be tabbable!
    return event.target === tabbable(doc)[0];
  }

  let restoreTabIndexTuplés = [];
  function disableTabbablesInPopover() {
    const elements = tabbable(popoverRef.current);
    elements.forEach(element => {
      restoreTabIndexTuplés.push([element, element.tabIndex]);
      element.tabIndex = -1;
    });
    doc.addEventListener("focusin", enableTabbablesInPopover);
  }
  function enableTabbablesInPopover(event) {
    doc.removeEventListener("focusin", enableTabbablesInPopover);
    restoreTabIndexTuplés.forEach(([element, tabIndex]) => {
      element.tabIndex = tabIndex;
    });
  }
}
