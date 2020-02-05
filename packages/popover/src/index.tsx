/**
 * Welcome to @reach/popover!
 */

import React, { useRef, forwardRef, useEffect } from "react";
import Portal from "@reach/portal";
import { useRect, PRect } from "@reach/rect";
import { getOwnerDocument, useForkedRef } from "@reach/utils";
import tabbable from "tabbable";

////////////////////////////////////////////////////////////////////////////////

/**
 * Popover
 */
const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  props,
  ref
) {
  return (
    <Portal>
      <PopoverImpl ref={ref} {...props} />
    </Portal>
  );
});

export type PopoverProps = {
  children: React.ReactNode;
  targetRef: React.RefObject<HTMLElement>;
  position?: Position;
} & React.HTMLAttributes<HTMLDivElement>;

if (__DEV__) {
  Popover.displayName = "Popover";
}

export default Popover;

////////////////////////////////////////////////////////////////////////////////

/**
 * PopoverImpl
 *
 * Popover is conditionally rendered so we can't start measuring until it shows
 * up, so useRect needs to live down here not up in Popover
 */
const PopoverImpl = forwardRef<HTMLDivElement, PopoverProps>(
  function PopoverImpl(
    { targetRef, position = positionDefault, style, ...rest },
    forwardedRef
  ) {
    const popoverRef = useRef<HTMLDivElement>(null);
    const popoverRect = useRect(popoverRef);
    const targetRect = useRect(targetRef);
    const ref = useForkedRef(popoverRef, forwardedRef);

    useSimulateTabNavigationForReactTree(targetRef, popoverRef);

    return (
      <div
        data-reach-popover=""
        ref={ref}
        style={{
          ...style,
          position: "absolute",
          ...getStyles(position, targetRect, popoverRect),
        }}
        {...rest}
      />
    );
  }
);

if (__DEV__) {
  PopoverImpl.displayName = "PopoverImpl";
}

////////////////////////////////////////////////////////////////////////////////

function getStyles(
  position: Position,
  targetRect: PRect | null,
  popoverRect: PRect | null
): React.CSSProperties {
  const needToMeasurePopup = !popoverRect;
  if (needToMeasurePopup) {
    return { visibility: "hidden" };
  }
  return position(targetRect, popoverRect);
}

export const positionDefault: Position = (targetRect, popoverRect) => {
  if (!targetRect || !popoverRect) {
    return {};
  }

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
      : `${targetRect.top + targetRect.height + window.pageYOffset}px`,
  };
};

export const positionMatchWidth: Position = (targetRect, popoverRect) => {
  if (!targetRect || !popoverRect) {
    return {};
  }

  const { directionUp } = getCollisions(targetRect, popoverRect);
  return {
    width: targetRect.width,
    left: targetRect.left,
    top: directionUp
      ? `${targetRect.top - popoverRect.height + window.pageYOffset}px`
      : `${targetRect.top + targetRect.height + window.pageYOffset}px`,
  };
};

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
  targetRect: PRect,
  popoverRect: PRect,
  offsetLeft: number = 0,
  offsetBottom: number = 0
) {
  const collisions = {
    top: targetRect.top - popoverRect.height < 0,
    right: window.innerWidth < targetRect.left + popoverRect.width - offsetLeft,
    bottom:
      window.innerHeight <
      targetRect.bottom + popoverRect.height - offsetBottom,
    left: targetRect.left - popoverRect.width < 0,
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
function useSimulateTabNavigationForReactTree<
  T extends HTMLElement = HTMLElement,
  P extends HTMLElement = HTMLElement
>(triggerRef: React.RefObject<T>, popoverRef: React.RefObject<P>) {
  const ownerDocument = getOwnerDocument(triggerRef.current);

  function handleKeyDown(event: KeyboardEvent) {
    if (
      event.key === "Tab" &&
      popoverRef.current &&
      tabbable(popoverRef.current).length === 0
    ) {
      return;
    }

    if (event.key === "Tab" && event.shiftKey) {
      if (shiftTabbedFromElementAfterTrigger(event)) {
        focusLastTabbableInPopover(event);
      } else if (shiftTabbedOutOfPopover(event)) {
        focusTriggerRef(event);
      } else if (shiftTabbedToBrowserChrome(event)) {
        disableTabbablesInPopover();
      }
    } else if (event.key === "Tab") {
      if (tabbedFromTriggerToPopover()) {
        focusFirstPopoverTabbable(event);
      } else if (tabbedOutOfPopover()) {
        focusTabbableAfterTrigger(event);
      } else if (tabbedToBrowserChrome(event)) {
        disableTabbablesInPopover();
      }
    }
  }

  useEffect(() => {
    if (ownerDocument) {
      ownerDocument.addEventListener("keydown", handleKeyDown);
      return () => {
        ownerDocument.removeEventListener("keydown", handleKeyDown);
      };
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getElementAfterTrigger() {
    const elements = ownerDocument && tabbable(ownerDocument);
    const targetIndex =
      elements && triggerRef.current
        ? elements.indexOf(triggerRef.current)
        : -1;
    return elements && elements[targetIndex + 1];
  }

  function tabbedFromTriggerToPopover() {
    return triggerRef.current && ownerDocument
      ? triggerRef.current === ownerDocument.activeElement
      : false;
  }

  function focusFirstPopoverTabbable(event: KeyboardEvent) {
    const elements = popoverRef.current && tabbable(popoverRef.current);
    if (elements && elements[0]) {
      event.preventDefault();
      elements[0].focus();
    }
  }

  function tabbedOutOfPopover() {
    const inPopover =
      popoverRef.current && ownerDocument
        ? popoverRef.current.contains(ownerDocument.activeElement || null)
        : false;
    if (inPopover) {
      const elements = popoverRef.current && tabbable(popoverRef.current);
      return Boolean(
        elements &&
          ownerDocument &&
          elements[elements.length - 1] === ownerDocument.activeElement
      );
    }
    return false;
  }

  function focusTabbableAfterTrigger(event: KeyboardEvent) {
    const elementAfterTrigger = getElementAfterTrigger();
    if (elementAfterTrigger) {
      event.preventDefault();
      elementAfterTrigger.focus();
    }
  }

  function shiftTabbedFromElementAfterTrigger(event: KeyboardEvent) {
    if (!event.shiftKey) return;
    const elementAfterTrigger = getElementAfterTrigger();
    return event.target === elementAfterTrigger;
  }

  function focusLastTabbableInPopover(event: KeyboardEvent) {
    const elements = popoverRef.current && tabbable(popoverRef.current);
    const last = elements && elements[elements.length - 1];
    if (last) {
      event.preventDefault();
      last.focus();
    }
  }

  function shiftTabbedOutOfPopover(event: KeyboardEvent) {
    const elements = popoverRef.current && tabbable(popoverRef.current);
    if (elements) {
      return elements.length === 0 ? false : event.target === elements[0];
    }
    return false;
  }

  function focusTriggerRef(event: KeyboardEvent) {
    event.preventDefault();
    triggerRef.current?.focus();
  }

  function tabbedToBrowserChrome(event: KeyboardEvent) {
    const elements =
      ownerDocument && popoverRef.current
        ? tabbable(ownerDocument).filter(
            element => !popoverRef.current!.contains(element)
          )
        : null;
    return elements ? event.target === elements[elements.length - 1] : false;
  }

  function shiftTabbedToBrowserChrome(event: KeyboardEvent) {
    // we're assuming the popover will never contain the first tabbable
    // element, and it better not, because the trigger needs to be tabbable!
    return ownerDocument ? event.target === tabbable(ownerDocument)[0] : false;
  }

  let restoreTabIndexTuplés: [HTMLElement, number][] = [];

  function disableTabbablesInPopover() {
    const elements = popoverRef.current && tabbable(popoverRef.current);
    if (elements) {
      elements.forEach(element => {
        restoreTabIndexTuplés.push([element, element.tabIndex]);
        element.tabIndex = -1;
      });
      ownerDocument &&
        ownerDocument.addEventListener("focusin", enableTabbablesInPopover);
    }
  }

  function enableTabbablesInPopover() {
    ownerDocument &&
      ownerDocument.removeEventListener("focusin", enableTabbablesInPopover);
    restoreTabIndexTuplés.forEach(([element, tabIndex]) => {
      element.tabIndex = tabIndex;
    });
  }
}

////////////////////////////////////////////////////////////////////////////////
// Types

export type Position = (
  targetRect?: PRect | null,
  popoverRect?: PRect | null
) => React.CSSProperties;
