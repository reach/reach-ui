/**
 * Welcome to @reach/popover!
 */

import * as React from "react";
import Portal from "@reach/portal";
import { useRect, PRect } from "@reach/rect";
import { forwardRefWithAs, getOwnerDocument, useForkedRef } from "@reach/utils";
import tabbable from "tabbable";

////////////////////////////////////////////////////////////////////////////////

/**
 * Popover
 */
const Popover = forwardRefWithAs<PopoverProps, "div">(function Popover(
  props,
  ref
) {
  return (
    <Portal>
      <PopoverImpl ref={ref} {...props} />
    </Portal>
  );
});

type PopoverDOMProps = Omit<React.ComponentProps<"div">, keyof PopoverOwnProps>;
export type PopoverOwnProps = {
  children: React.ReactNode;
  targetRef: React.RefObject<HTMLElement>;
  position?: Position;
  /**
   * Render the popover markup, but hide it – used by MenuButton so that it
   * can have an `aria-controls` attribute even when its menu isn't open, and
   * used inside `Popover` as a hint that we can tell `useRect` to stop
   * observing for better performance.
   */
  hidden?: boolean;
  /**
   * Testing this API so we might accept additional nodes that apps can use to
   * determine the position of the popover. One example where it may be useful
   * is for positioning the popover of a listbox where the cursor rests on top
   * of the selected option. Pretty sure this will change so don't use it
   * anywhere in public yet!
   */
  unstable_observableRefs?: React.RefObject<PossibleNode>[];
};
export type PopoverProps = PopoverDOMProps & PopoverOwnProps;

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
const PopoverImpl = forwardRefWithAs<PopoverProps, "div">(function PopoverImpl(
  {
    as: Comp = "div",
    targetRef,
    position = positionDefault,
    unstable_observableRefs = [],
    ...props
  },
  forwardedRef
) {
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const popoverRect = useRect(popoverRef, !props.hidden);
  const targetRect = useRect(targetRef, !props.hidden);
  const ref = useForkedRef(popoverRef, forwardedRef);

  useSimulateTabNavigationForReactTree(targetRef, popoverRef);

  return (
    <Comp
      data-reach-popover=""
      ref={ref}
      {...props}
      style={{
        position: "absolute",
        ...getStyles(
          position,
          targetRect,
          popoverRect,
          ...unstable_observableRefs
        ),
        ...props.style,
      }}
    />
  );
});

if (__DEV__) {
  PopoverImpl.displayName = "PopoverImpl";
}

////////////////////////////////////////////////////////////////////////////////

function getStyles(
  position: Position,
  targetRect: PRect | null,
  popoverRect: PRect | null,
  ...unstable_observableRefs: React.RefObject<PossibleNode>[]
): React.CSSProperties {
  return popoverRect
    ? position(
        targetRect,
        popoverRect,
        ...unstable_observableRefs.map((ref) => ref.current)
      )
    : { visibility: "hidden" };
}

function getTopPosition(targetRect: PRect, popoverRect: PRect) {
  const { directionUp } = getCollisions(targetRect, popoverRect);
  return {
    top: directionUp
      ? `${targetRect.top - popoverRect.height + window.pageYOffset}px`
      : `${targetRect.top + targetRect.height + window.pageYOffset}px`,
  };
}

export const positionDefault: Position = (targetRect, popoverRect) => {
  if (!targetRect || !popoverRect) {
    return {};
  }

  const { directionRight } = getCollisions(targetRect, popoverRect);
  return {
    left: directionRight
      ? `${targetRect.right - popoverRect.width + window.pageXOffset}px`
      : `${targetRect.left + window.pageXOffset}px`,
    ...getTopPosition(targetRect, popoverRect),
  };
};

export const positionRight: Position = (targetRect, popoverRect) => {
  if (!targetRect || !popoverRect) {
    return {};
  }

  const { directionLeft } = getCollisions(targetRect, popoverRect);
  return {
    left: directionLeft
      ? `${targetRect.left + window.pageXOffset}px`
      : `${targetRect.right - popoverRect.width + window.pageXOffset}px`,
    ...getTopPosition(targetRect, popoverRect),
  };
};

export const positionMatchWidth: Position = (targetRect, popoverRect) => {
  if (!targetRect || !popoverRect) {
    return {};
  }

  return {
    width: targetRect.width,
    left: targetRect.left,
    ...getTopPosition(targetRect, popoverRect),
  };
};

export function getCollisions(
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
    left: targetRect.left + targetRect.width - popoverRect.width < 0,
  };

  const directionRight = collisions.right && !collisions.left;
  const directionLeft = collisions.left && !collisions.right;
  const directionUp = collisions.bottom && !collisions.top;
  const directionDown = collisions.top && !collisions.bottom;

  return { directionRight, directionLeft, directionUp, directionDown };
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

  React.useEffect(() => {
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
    const elementAfterTrigger = elements && elements[targetIndex + 1];
    return popoverRef.current &&
      popoverRef.current.contains(elementAfterTrigger || null)
      ? false
      : elementAfterTrigger;
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
            (element) => !popoverRef.current!.contains(element)
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
      elements.forEach((element) => {
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
  popoverRect?: PRect | null,
  ...unstable_observableNodes: PossibleNode[]
) => React.CSSProperties;

type PossibleNode = null | undefined | HTMLElement | SVGElement;
