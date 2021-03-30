/**
 * Welcome to @reach/tooltip!
 *
 * When the user's mouse or focus rests on an element, a non-interactive popup
 * is displayed near it.
 *
 * Quick definitions:
 *
 * - "on rest" or "rested on": describes when the element receives mouse hover
 *   after a short delay (and hopefully soon, touch longpress).
 *
 * - "activation": describes a mouse click, keyboard enter, or keyboard space.
 *
 * Only one tooltip can be visible at a time, so we use a global state chart to
 * describe the various states and transitions between states that are possible.
 * With all the timeouts involved with tooltips it's important to "make
 * impossible states impossible" with a state machine.
 *
 * It's also okay to use these module globals because you don't server render
 * tooltips. None of the state is changed outside of user events.
 *
 * There are a few features that are important to understand.
 *
 * 1. Tooltips don't show up until the user has rested on one, we don't want
 *    tooltips popping up as you move your mouse around the page.
 *
 * 2. Once any tooltip becomes visible, other tooltips nearby should skip
 *    resting and display immediately.
 *
 * 3. Tooltips stick around for a little bit after blur/mouseleave.
 *
 * TODO: Research longpress tooltips on Android, iOS - Probably want to position
 *       it by default above, since your thumb is below and would cover it - I'm
 *       thinking after longpress, display the tooltip and cancel any click
 *       events. Then on touchend, so they can read it display the tooltip for a
 *       little while longer in case their hand was obstructing the tooltip.
 *
 * @see Docs     https://reach.tech/tooltip
 * @see Source   https://github.com/reach/reach-ui/tree/main/packages/tooltip
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#tooltip
 */

import * as React from "react";
import { useId } from "@reach/auto-id";
import { getDocumentDimensions } from "@reach/utils/get-document-dimensions";
import { getOwnerDocument } from "@reach/utils/owner-document";
import { makeId } from "@reach/utils/make-id";
import { useCheckStyles } from "@reach/utils/dev-utils";
import { useComposedRefs } from "@reach/utils/compose-refs";
import { composeEventHandlers } from "@reach/utils/compose-event-handlers";
import { Portal } from "@reach/portal";
import { VisuallyHidden } from "@reach/visually-hidden";
import { useRect } from "@reach/rect";
import warning from "tiny-warning";
import PropTypes from "prop-types";

import type * as Polymorphic from "@reach/utils/polymorphic";

const MOUSE_REST_TIMEOUT = 100;
const LEAVE_TIMEOUT = 500;

////////////////////////////////////////////////////////////////////////////////
// States

enum TooltipStates {
  // Nothing goin' on
  Idle = "IDLE",

  // We're considering showing the tooltip, but we're gonna wait a sec
  Focused = "FOCUSED",

  // It's on!
  Visible = "VISIBLE",

  // Focus has left, but we want to keep it visible for a sec
  LeavingVisible = "LEAVING_VISIBLE",

  // The user clicked the tool, so we want to hide the thing, we can't just use
  // IDLE because we need to ignore mousemove, etc.
  Dismissed = "DISMISSED",
}

////////////////////////////////////////////////////////////////////////////////
// Events

enum TooltipEvents {
  Blur = "BLUR",
  Focus = "FOCUS",
  GlobalMouseMove = "GLOBAL_MOUSE_MOVE",
  MouseDown = "MOUSE_DOWN",
  MouseEnter = "MOUSE_ENTER",
  MouseLeave = "MOUSE_LEAVE",
  MouseMove = "MOUSE_MOVE",
  Rest = "REST",
  SelectWithKeyboard = "SELECT_WITH_KEYBOARD",
  TimeComplete = "TIME_COMPLETE",
}

const chart: StateChart = {
  initial: TooltipStates.Idle,
  states: {
    [TooltipStates.Idle]: {
      enter: clearContextId,
      on: {
        [TooltipEvents.MouseEnter]: TooltipStates.Focused,
        [TooltipEvents.Focus]: TooltipStates.Visible,
      },
    },
    [TooltipStates.Focused]: {
      enter: startRestTimer,
      leave: clearRestTimer,
      on: {
        [TooltipEvents.MouseMove]: TooltipStates.Focused,
        [TooltipEvents.MouseLeave]: TooltipStates.Idle,
        [TooltipEvents.MouseDown]: TooltipStates.Dismissed,
        [TooltipEvents.Blur]: TooltipStates.Idle,
        [TooltipEvents.Rest]: TooltipStates.Visible,
      },
    },
    [TooltipStates.Visible]: {
      on: {
        [TooltipEvents.Focus]: TooltipStates.Focused,
        [TooltipEvents.MouseEnter]: TooltipStates.Focused,
        [TooltipEvents.MouseLeave]: TooltipStates.LeavingVisible,
        [TooltipEvents.Blur]: TooltipStates.LeavingVisible,
        [TooltipEvents.MouseDown]: TooltipStates.Dismissed,
        [TooltipEvents.SelectWithKeyboard]: TooltipStates.Dismissed,
        [TooltipEvents.GlobalMouseMove]: TooltipStates.LeavingVisible,
      },
    },
    [TooltipStates.LeavingVisible]: {
      enter: startLeavingVisibleTimer,
      leave: () => {
        clearLeavingVisibleTimer();
        clearContextId();
      },
      on: {
        [TooltipEvents.MouseEnter]: TooltipStates.Visible,
        [TooltipEvents.Focus]: TooltipStates.Visible,
        [TooltipEvents.TimeComplete]: TooltipStates.Idle,
      },
    },
    [TooltipStates.Dismissed]: {
      leave: () => {
        clearContextId();
      },
      on: {
        [TooltipEvents.MouseLeave]: TooltipStates.Idle,
        [TooltipEvents.Blur]: TooltipStates.Idle,
      },
    },
  },
};

/*
 * Chart context allows us to persist some data around, in Tooltip all we use
 * is the id of the current tooltip being interacted with.
 */
let state: StateObject = {
  value: chart.initial,
  context: { id: null },
};

////////////////////////////////////////////////////////////////////////////////
// Subscriptions:
//
// We could require apps to render a <TooltipProvider> around the app and use
// React context to notify Tooltips of changes to our state machine, instead
// we manage subscriptions ourselves and simplify the Tooltip API.
//
// Maybe if default context could take a hook (instead of just a static value)
// that was rendered at the root for us, that'd be cool! But it doesn't.
let subscriptions: Function[] = [];

function subscribe(fn: Function) {
  subscriptions.push(fn);
  return () => {
    subscriptions.splice(subscriptions.indexOf(fn), 1);
  };
}

function notify() {
  subscriptions.forEach((fn) => fn(state));
}

////////////////////////////////////////////////////////////////////////////////
// Timeouts:

// Manages when the user "rests" on an element. Keeps the interface from being
// flashing tooltips all the time as the user moves the mouse around the screen.
let restTimeout: number;

function startRestTimer() {
  window.clearTimeout(restTimeout);
  restTimeout = window.setTimeout(() => {
    send({ type: TooltipEvents.Rest });
  }, MOUSE_REST_TIMEOUT);
}

function clearRestTimer() {
  window.clearTimeout(restTimeout);
}

// Manages the delay to hide the tooltip after rest leaves.
let leavingVisibleTimer: number;

function startLeavingVisibleTimer() {
  window.clearTimeout(leavingVisibleTimer);
  leavingVisibleTimer = window.setTimeout(
    () => send({ type: TooltipEvents.TimeComplete }),
    LEAVE_TIMEOUT
  );
}

function clearLeavingVisibleTimer() {
  window.clearTimeout(leavingVisibleTimer);
}

// allows us to come on back later w/o entering something else first after the
// user leaves or dismisses
function clearContextId() {
  state.context.id = null;
}

////////////////////////////////////////////////////////////////////////////////

/**
 * useTooltip
 *
 * @param params
 */
function useTooltip<ElementType extends HTMLElement>({
  id: idProp,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  onMouseDown,
  onFocus,
  onBlur,
  onKeyDown,
  disabled,
  ref: forwardedRef,
  DEBUG_STYLE,
}: {
  ref?: React.Ref<ElementType>;
  disabled?: boolean;
  DEBUG_STYLE?: boolean;
} & React.HTMLAttributes<ElementType> = {}): [
  TriggerParams<ElementType>,
  TooltipParams,
  boolean
] {
  let id = String(useId(idProp));

  let [isVisible, setIsVisible] = React.useState(
    DEBUG_STYLE ? true : isTooltipVisible(id, true)
  );

  // hopefully they always pass a ref if they ever pass one
  let ownRef = React.useRef<ElementType | null>(null);

  let ref = useComposedRefs(forwardedRef, ownRef);
  let triggerRect = useRect(ownRef, { observe: isVisible });

  React.useEffect(() => {
    return subscribe(() => {
      setIsVisible(isTooltipVisible(id));
    });
  }, [id]);

  useCheckStyles("tooltip");

  React.useEffect(() => {
    let ownerDocument = getOwnerDocument(ownRef.current)!;
    function listener(event: KeyboardEvent) {
      if (
        (event.key === "Escape" || event.key === "Esc") &&
        state.value === TooltipStates.Visible
      ) {
        send({ type: TooltipEvents.SelectWithKeyboard });
      }
    }
    ownerDocument.addEventListener("keydown", listener);
    return () => ownerDocument.removeEventListener("keydown", listener);
  }, []);

  useDisabledTriggerOnSafari({ disabled, isVisible, ref: ownRef });

  function wrapMouseEvent<EventType extends React.SyntheticEvent | Event>(
    theirHandler: ((event: EventType) => any) | undefined,
    ourHandler: (event: EventType) => any
  ) {
    // Use internal MouseEvent handler only if PointerEvent is not supported
    if (typeof window !== "undefined" && "PointerEvent" in window) {
      return theirHandler;
    }

    return composeEventHandlers(theirHandler, ourHandler);
  }

  function wrapPointerEventHandler(
    handler: (event: React.PointerEvent) => any
  ) {
    return function onPointerEvent(event: React.PointerEvent) {
      // Handle pointer events only from mouse device
      if (event.pointerType !== "mouse") {
        return;
      }
      handler(event);
    };
  }

  function handleMouseEnter() {
    send({ type: TooltipEvents.MouseEnter, id });
  }

  function handleMouseMove() {
    send({ type: TooltipEvents.MouseMove, id });
  }

  function handleMouseLeave() {
    send({ type: TooltipEvents.MouseLeave });
  }

  function handleMouseDown() {
    // Allow quick click from one tool to another
    if (state.context.id === id) {
      send({ type: TooltipEvents.MouseDown });
    }
  }

  function handleFocus() {
    // @ts-ignore
    if (window.__REACH_DISABLE_TOOLTIPS) {
      return;
    }
    send({ type: TooltipEvents.Focus, id });
  }

  function handleBlur() {
    // Allow quick click from one tool to another
    if (state.context.id === id) {
      send({ type: TooltipEvents.Blur });
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<ElementType>) {
    if (event.key === "Enter" || event.key === " ") {
      send({ type: TooltipEvents.SelectWithKeyboard });
    }
  }

  let trigger: TriggerParams<ElementType> = {
    // The element that triggers the tooltip references the tooltip element with
    // `aria-describedby`.
    // https://www.w3.org/TR/wai-aria-practices-1.2/#tooltip
    "aria-describedby": isVisible ? makeId("tooltip", id) : undefined,
    "data-state": isVisible ? "tooltip-visible" : "tooltip-hidden",
    "data-reach-tooltip-trigger": "",
    ref,
    onPointerEnter: composeEventHandlers(
      onPointerEnter,
      wrapPointerEventHandler(handleMouseEnter)
    ),
    onPointerMove: composeEventHandlers(
      onPointerMove,
      wrapPointerEventHandler(handleMouseMove)
    ),
    onPointerLeave: composeEventHandlers(
      onPointerLeave,
      wrapPointerEventHandler(handleMouseLeave)
    ),
    onPointerDown: composeEventHandlers(
      onPointerDown,
      wrapPointerEventHandler(handleMouseDown)
    ),
    onMouseEnter: wrapMouseEvent(onMouseEnter, handleMouseEnter),
    onMouseMove: wrapMouseEvent(onMouseMove, handleMouseMove),
    onMouseLeave: wrapMouseEvent(onMouseLeave, handleMouseLeave),
    onMouseDown: wrapMouseEvent(onMouseDown, handleMouseDown),
    onFocus: composeEventHandlers(onFocus, handleFocus),
    onBlur: composeEventHandlers(onBlur, handleBlur),
    onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
  };

  let tooltip: TooltipParams = {
    id,
    triggerRect,
    isVisible,
  };

  return [trigger, tooltip, isVisible];
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Tooltip
 *
 * @see Docs https://reach.tech/tooltip#tooltip
 */
const Tooltip = React.forwardRef(function (
  {
    children,
    label,
    // TODO: Remove `ariaLabel` prop in 1.0 and just use `aria-label`
    ariaLabel: DEPRECATED_ariaLabel,
    id,
    DEBUG_STYLE,
    ...props
  },
  forwardedRef
) {
  let child = React.Children.only(children) as any;

  warning(
    !DEPRECATED_ariaLabel,
    "The `ariaLabel prop is deprecated and will be removed from @reach/tooltip in a future version of Reach UI. Please use `aria-label` instead."
  );

  // We need to pass some properties from the child into useTooltip
  // to make sure users can maintain control over the trigger's ref and events
  let [trigger, tooltip] = useTooltip({
    id,
    onPointerEnter: child.props.onPointerEnter,
    onPointerMove: child.props.onPointerMove,
    onPointerLeave: child.props.onPointerLeave,
    onPointerDown: child.props.onPointerDown,
    onMouseEnter: child.props.onMouseEnter,
    onMouseMove: child.props.onMouseMove,
    onMouseLeave: child.props.onMouseLeave,
    onMouseDown: child.props.onMouseDown,
    onFocus: child.props.onFocus,
    onBlur: child.props.onBlur,
    onKeyDown: child.props.onKeyDown,
    disabled: child.props.disabled,
    ref: child.ref,
    DEBUG_STYLE,
  });
  return (
    <React.Fragment>
      {React.cloneElement(child, trigger as any)}
      <TooltipPopup
        ref={forwardedRef}
        label={label}
        aria-label={DEPRECATED_ariaLabel}
        {...tooltip}
        {...props}
      />
    </React.Fragment>
  );
}) as Polymorphic.ForwardRefComponent<"div", TooltipProps>;

interface TooltipProps
  extends Omit<TooltipContentProps, "triggerRect" | "isVisible"> {
  children: React.ReactNode;
  DEBUG_STYLE?: boolean;
}

if (__DEV__) {
  Tooltip.displayName = "Tooltip";
  Tooltip.propTypes = {
    children: PropTypes.node.isRequired,
    label: PropTypes.node.isRequired,
    ariaLabel: PropTypes.string,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * TooltipPopup
 *
 * @see Docs https://reach.tech/tooltip#tooltippopup
 */
const TooltipPopup = React.forwardRef(function TooltipPopup(
  {
    // could use children but we want to encourage simple strings
    label,
    // TODO: Remove `ariaLabel` prop in 1.0 and just use `aria-label`
    ariaLabel: DEPRECATED_ariaLabel,
    isVisible,
    id,
    ...props
  },
  forwardRef
) {
  return isVisible ? (
    <Portal>
      <TooltipContent
        ref={forwardRef}
        label={label}
        aria-label={DEPRECATED_ariaLabel}
        isVisible={isVisible}
        {...props}
        id={makeId("tooltip", String(id))}
      />
    </Portal>
  ) : null;
}) as Polymorphic.ForwardRefComponent<"div", TooltipPopupProps>;

interface TooltipPopupProps extends TooltipContentProps {
  children?: React.ReactNode;
}

if (__DEV__) {
  TooltipPopup.displayName = "TooltipPopup";
  TooltipPopup.propTypes = {
    label: PropTypes.node.isRequired,
    ariaLabel: PropTypes.string,
    position: PropTypes.func,
  };
}

/**
 * TooltipContent
 *
 * We need a separate component so that useRect works inside the portal.
 *
 * @see Docs https://reach.tech/tooltip#tooltipcontent
 */
const TooltipContent = React.forwardRef(function TooltipContent(
  {
    // TODO: Remove `ariaLabel` prop in 1.0 and just use `aria-label`
    ariaLabel,
    "aria-label": realAriaLabel,
    as: Comp = "div",
    id,
    isVisible,
    label,
    position = positionTooltip,
    style,
    triggerRect,
    ...props
  },
  forwardedRef
) {
  // The element that serves as the tooltip container has role tooltip.
  // https://www.w3.org/TR/wai-aria-practices-1.2/#tooltip When an app passes
  // an `aria-label`, we actually want to implement `role="tooltip"` on a
  // visually hidden element inside of the trigger. In these cases we want the
  // screen reader user to know both the content in the tooltip, but also the
  // content in the badge. For screen reader users, the only content announced
  // to them is whatever is in the tooltip.
  let hasAriaLabel = (realAriaLabel || ariaLabel) != null;

  let ownRef = React.useRef(null);
  let ref = useComposedRefs(forwardedRef, ownRef);
  let tooltipRect = useRect(ownRef, { observe: isVisible });
  return (
    <React.Fragment>
      <Comp
        role={hasAriaLabel ? undefined : "tooltip"}
        {...props}
        ref={ref}
        data-reach-tooltip=""
        id={hasAriaLabel ? undefined : id}
        style={{
          ...style,
          ...getStyles(position, triggerRect as PRect, tooltipRect as PRect),
        }}
      >
        {label}
      </Comp>
      {hasAriaLabel && (
        <VisuallyHidden role="tooltip" id={id}>
          {realAriaLabel || ariaLabel}
        </VisuallyHidden>
      )}
    </React.Fragment>
  );
}) as Polymorphic.ForwardRefComponent<"div", TooltipContentProps>;

interface TooltipContentProps {
  ariaLabel?: string;
  position?: Position;
  label: React.ReactNode;
  isVisible?: boolean;
  triggerRect: DOMRect | null;
}

if (__DEV__) {
  TooltipContent.displayName = "TooltipContent";
  TooltipContent.propTypes = {};
}

////////////////////////////////////////////////////////////////////////////////

function getStyles(
  position: Position,
  triggerRect: PRect,
  tooltipRect: PRect
): React.CSSProperties {
  let haventMeasuredTooltipYet = !tooltipRect;
  if (haventMeasuredTooltipYet) {
    return { visibility: "hidden" };
  }
  return position(triggerRect, tooltipRect);
}

// Default offset from the trigger (e.g., if the tooltip is positioned above,
// there will be 8px between the bottom of the tooltip and the top of the trigger).
// It feels awkward when it's perfectly aligned w/ the trigger
const OFFSET_DEFAULT = 8;

export const positionTooltip: Position = (
  triggerRect,
  tooltipRect,
  offset = OFFSET_DEFAULT
) => {
  let { width: windowWidth, height: windowHeight } = getDocumentDimensions();
  if (!triggerRect || !tooltipRect) {
    return {};
  }

  let collisions = {
    top: triggerRect.top - tooltipRect.height < 0,
    right: windowWidth < triggerRect.left + tooltipRect.width,
    bottom: windowHeight < triggerRect.bottom + tooltipRect.height + offset,
    left: triggerRect.left - tooltipRect.width < 0,
  };

  let directionRight = collisions.right && !collisions.left;
  let directionUp = collisions.bottom && !collisions.top;

  return {
    left: directionRight
      ? `${triggerRect.right - tooltipRect.width + window.pageXOffset}px`
      : `${triggerRect.left + window.pageXOffset}px`,
    top: directionUp
      ? `${
          triggerRect.top - offset - tooltipRect.height + window.pageYOffset
        }px`
      : `${
          triggerRect.top + offset + triggerRect.height + window.pageYOffset
        }px`,
  };
};

/**
 * This is a workaround for using tooltips with disabled controls in Safari.
 * Safari fires `pointerenter` but does not fire `pointerleave`, and
 * `onPointerEventLeave` added to the trigger element will not work.
 *
 * TODO: We may remove or modiify this behavior in a future version. Direction
 * from WAI-ARIA needed for guidance on handling disabled triggers. Tooltips
 * must be accessible by keyboard, and disabled form controls are generally
 * excluded from the tab sequence.
 *
 * @see https://github.com/reach/reach-ui/issues/564
 * @see https://github.com/w3c/aria-practices/issues/128#issuecomment-588625727
 */
function useDisabledTriggerOnSafari({
  disabled,
  isVisible,
  ref,
}: {
  disabled: boolean | undefined;
  isVisible: boolean;
  ref: React.RefObject<HTMLElement>;
}) {
  React.useEffect(() => {
    if (
      !(typeof window !== "undefined" && "PointerEvent" in window) ||
      !disabled ||
      !isVisible
    ) {
      return;
    }

    let ownerDocument = getOwnerDocument(ref.current)!;

    function handleMouseMove(event: MouseEvent) {
      if (!isVisible) {
        return;
      }

      if (
        event.target instanceof Element &&
        event.target.closest(
          "[data-reach-tooltip-trigger][data-state='tooltip-visible']"
        )
      ) {
        return;
      }

      send({ type: TooltipEvents.GlobalMouseMove });
    }

    ownerDocument.addEventListener("mousemove", handleMouseMove);
    return () => {
      ownerDocument.removeEventListener("mousemove", handleMouseMove);
    };
  }, [disabled, isVisible, ref]);
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Send an event to our state machine to find the next state from the current
 * state + action.
 *
 * It also manages lifecycles of the machine, (enter/leave hooks on the state
 * chart)
 *
 * @param event
 * @param payload
 */
function send(event: MachineEvent): void {
  let { value, context, changed } = transition(state, event);
  if (changed) {
    state = { value, context };
    notify();
  }
}

function transition(
  currentState: StateObject,
  event: MachineEvent
): StateObject & { changed: boolean } {
  let stateDef = chart.states[currentState.value];
  let nextState = stateDef && stateDef.on && stateDef.on[event.type];

  // Really useful for debugging
  // console.log({ event, state, nextState, contextId: context.id });
  // !nextState && console.log("no transition taken");

  if (!nextState) {
    return { ...currentState, changed: false };
  }

  if (stateDef && stateDef.leave) {
    stateDef.leave(currentState.context, event);
  }

  const { type: _, ...payload } = event;
  // TODO: Use actions instead of directly setting context
  let context = { ...state.context, ...payload };

  let nextStateValue =
    typeof nextState === "string" ? nextState : nextState.target;
  let nextDef = chart.states[nextStateValue];
  if (nextDef && nextDef.enter) {
    nextDef.enter(currentState.context, event);
  }

  return {
    value: nextStateValue,
    context,
    changed: true,
  };
}

function isTooltipVisible(id: string, initial?: boolean) {
  return (
    state.context.id === id &&
    (initial
      ? state.value === TooltipStates.Visible
      : state.value === TooltipStates.Visible ||
        state.value === TooltipStates.LeavingVisible)
  );
}

////////////////////////////////////////////////////////////////////////////////
// TYPES

interface TriggerParams<ElementType extends HTMLElement> {
  "aria-describedby"?: string | undefined;
  "data-state": string;
  "data-reach-tooltip-trigger": string;
  ref: React.Ref<ElementType>;
  onPointerEnter: React.ReactEventHandler;
  onPointerDown: React.ReactEventHandler;
  onPointerMove: React.ReactEventHandler;
  onPointerLeave: React.ReactEventHandler;
  onMouseEnter?: React.ReactEventHandler;
  onMouseDown?: React.ReactEventHandler;
  onMouseMove?: React.ReactEventHandler;
  onMouseLeave?: React.ReactEventHandler;
  onFocus: React.ReactEventHandler;
  onBlur: React.ReactEventHandler;
  onKeyDown: React.ReactEventHandler;
}

interface TooltipParams {
  id: string;
  triggerRect: DOMRect | null;
  isVisible: boolean;
}

type StateObject = { value: TooltipStates; context: StateContext };

type MachineEvent =
  | { type: TooltipEvents.Blur }
  | { type: TooltipEvents.Focus; id: string | null }
  | { type: TooltipEvents.GlobalMouseMove }
  | { type: TooltipEvents.MouseDown }
  | { type: TooltipEvents.MouseEnter; id: string | null }
  | { type: TooltipEvents.MouseLeave }
  | { type: TooltipEvents.MouseMove; id: string | null }
  | { type: TooltipEvents.Rest }
  | { type: TooltipEvents.SelectWithKeyboard }
  | { type: TooltipEvents.TimeComplete };

interface StateChart {
  initial: TooltipStates;
  states: {
    [key in TooltipStates]: {
      enter?: ActionFunction;
      leave?: ActionFunction;
      on: {
        [key in TooltipEvents]?:
          | TooltipStates
          | {
              target: TooltipStates;
              cond?: (context: StateContext, event: MachineEvent) => boolean;
              actions?: ActionFunction[];
            };
      };
    };
  };
}

type ActionFunction = (context: StateContext, event: MachineEvent) => void;

type StateContext = {
  id?: string | null;
};

type Position = (
  targetRect?: PRect | null,
  popoverRect?: PRect | null
) => React.CSSProperties;

type PRect = Partial<DOMRect> & {
  readonly bottom: number;
  readonly height: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly width: number;
};

////////////////////////////////////////////////////////////////////////////////
// Exports

export default Tooltip;
export type {
  Position,
  TooltipContentProps,
  TooltipParams,
  TooltipPopupProps,
  TooltipProps,
  TriggerParams,
};
export { MOUSE_REST_TIMEOUT, LEAVE_TIMEOUT, Tooltip, TooltipPopup, useTooltip };
