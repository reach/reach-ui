/**
 * Welcome to @reach/dropdown!
 */

import * as React from "react";
import PropTypes from "prop-types";
import { useId } from "@reach/auto-id";
import { Popover } from "@reach/popover";
import {
  createDescendantContext,
  DescendantProvider,
  useDescendant,
  useDescendants,
  useDescendantsInit,
  useDescendantKeyDown,
} from "@reach/descendants";
import { isRightClick } from "@reach/utils/is-right-click";
import { usePrevious } from "@reach/utils/use-previous";
import { getOwnerDocument } from "@reach/utils/owner-document";
import { createNamedContext } from "@reach/utils/context";
import { isFunction, isString } from "@reach/utils/type-check";
import { makeId } from "@reach/utils/make-id";
import { useComposedRefs } from "@reach/utils/compose-refs";
import { composeEventHandlers } from "@reach/utils/compose-event-handlers";

import type { Position } from "@reach/popover";
import type * as Polymorphic from "@reach/utils/polymorphic";
import type { Descendant } from "@reach/descendants";

////////////////////////////////////////////////////////////////////////////////
// Actions

const CLEAR_SELECTION_INDEX = "CLEAR_SELECTION_INDEX";
const CLICK_MENU_ITEM = "CLICK_MENU_ITEM";
const CLOSE_MENU = "CLOSE_MENU";
const OPEN_MENU_AT_FIRST_ITEM = "OPEN_MENU_AT_FIRST_ITEM";
const OPEN_MENU_AT_INDEX = "OPEN_MENU_AT_INDEX";
const OPEN_MENU_CLEARED = "OPEN_MENU_CLEARED";
const SEARCH_FOR_ITEM = "SEARCH_FOR_ITEM";
const SELECT_ITEM_AT_INDEX = "SELECT_ITEM_AT_INDEX";
const SET_BUTTON_ID = "SET_BUTTON_ID";
const ACTIONS = {
  CLEAR_SELECTION_INDEX,
  CLICK_MENU_ITEM,
  CLOSE_MENU,
  OPEN_MENU_AT_FIRST_ITEM,
  OPEN_MENU_AT_INDEX,
  OPEN_MENU_CLEARED,
  SEARCH_FOR_ITEM,
  SELECT_ITEM_AT_INDEX,
  SET_BUTTON_ID,
};

const DropdownDescendantContext = createDescendantContext<DropdownDescendant>(
  "DropdownDescendantContext"
);
const DropdownContext = createNamedContext<InternalDropdownContextValue>(
  "DropdownContext",
  {} as InternalDropdownContextValue
);

const initialState: DropdownState = {
  // The trigger ID is needed for aria controls and can be set directly and
  // updated for top-level use via context. Otherwise a default is set by useId.
  // TODO: Consider deprecating direct ID in 1.0 in favor of id at the top level
  //       for passing deterministic IDs to descendent components.
  triggerId: null,

  // Whether or not the dropdown is expanded
  isExpanded: false,

  // When a user begins typing a character string, the selection will change if
  // a matching item is found
  typeaheadQuery: "",

  // The index of the current selected item. When the selection is cleared a
  // value of -1 is used.
  selectionIndex: -1,
};

////////////////////////////////////////////////////////////////////////////////

/**
 * DropdownProvider
 *
 * The wrapper component for the other components. No DOM element is rendered.
 */
const DropdownProvider: React.FC<DropdownProviderProps> = ({
  id,
  children,
}) => {
  let triggerRef = React.useRef(null);
  let dropdownRef = React.useRef(null);
  let popoverRef = React.useRef(null);
  let [descendants, setDescendants] = useDescendantsInit<DropdownDescendant>();
  let [state, dispatch] = React.useReducer(reducer, initialState);
  let _id = useId(id);
  let dropdownId = id || makeId("dropdown", _id);

  // We use an event listener attached to the window to capture outside clicks
  // that close the dropdown. We don't want the initial trigger click to
  // initiate this when a dropdown is closed, so we can track this behavior in a
  // ref.
  let triggerClickedRef = React.useRef(false);

  // We will put children callbacks in a ref to avoid triggering endless render
  // loops when using render props if the app code doesn't useCallback
  // https://github.com/reach/reach-ui/issues/523
  let selectCallbacks = React.useRef([]);

  // If the popover's position overlaps with an option when the popover
  // initially opens, the mouseup event will trigger a select. To prevent that,
  // we decide the user is only ready to make a selection if the pointer moves
  // first, or if the user opens the dropdown with their keyboard. Otherwise the
  // user is just registering the initial trigger click rather than selecting an
  // item. This is similar to a native select on most platforms, and our
  // dropdown should work similarly.
  let readyToSelect = React.useRef(false);

  // Trying a new approach for splitting up contexts by stable/unstable
  // references. We'll see how it goes!
  let context: InternalDropdownContextValue = {
    triggerRef,
    dispatch,
    dropdownRef,
    popoverRef,
    triggerClickedRef,
    readyToSelect,
    selectCallbacks,
    dropdownId,
    state,
  };

  // When the dropdown is open, focus is placed on the dropdown itself so that
  // keyboard navigation is still possible.
  React.useEffect(() => {
    if (state.isExpanded) {
      // @ts-ignore
      window.__REACH_DISABLE_TOOLTIPS = true;
      window.requestAnimationFrame(() => {
        focus(dropdownRef.current);
      });
    } else {
      // We want to ignore the immediate focus of a tooltip so it doesn't pop up
      // again when the dropdown closes, only pops up when focus returns again
      // to the tooltip (like native OS tooltips).
      // @ts-ignore
      window.__REACH_DISABLE_TOOLTIPS = false;
    }
  }, [state.isExpanded]);

  return (
    <DescendantProvider
      context={DropdownDescendantContext}
      items={descendants}
      set={setDescendants}
    >
      <DropdownContext.Provider value={context}>
        {isFunction(children)
          ? children({
              isExpanded: state.isExpanded,
              // TODO: Remove in 1.0
              isOpen: state.isExpanded,
            })
          : children}
      </DropdownContext.Provider>
    </DescendantProvider>
  );
};

interface DropdownProviderProps {
  /**
   * Requires two children: a `<Dropdown>` and a `<DropdownList>`.
   */
  children:
    | React.ReactNode
    | ((
        props: DropdownContextValue & {
          // TODO: Remove in 1.0
          isOpen: boolean;
        }
      ) => React.ReactNode);
  id?: string;
}

if (__DEV__) {
  DropdownProvider.displayName = "DropdownProvider";
  DropdownProvider.propTypes = {
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  };
}

////////////////////////////////////////////////////////////////////////////////

function useDropdownTrigger({
  id,
  onKeyDown,
  onMouseDown,
  forwardedRef,
  ...rest
}: DropdownTriggerProps &
  React.ComponentPropsWithoutRef<"button"> & {
    forwardedRef: React.ForwardedRef<HTMLButtonElement>;
  }) {
  let {
    triggerRef,
    triggerClickedRef,
    dispatch,
    dropdownId,
    readyToSelect,
    state: { triggerId, isExpanded },
  } = React.useContext(DropdownContext);
  let ref = useComposedRefs(triggerRef, forwardedRef);
  let items = useDescendants(DropdownDescendantContext);
  let firstNonDisabledIndex = React.useMemo(
    () => items.findIndex((item) => !item.disabled),
    [items]
  );
  React.useEffect(() => {
    let newButtonId =
      id != null
        ? id
        : dropdownId
        ? makeId("dropdown-trigger", dropdownId)
        : "dropdown-trigger";
    if (triggerId !== newButtonId) {
      dispatch({
        type: SET_BUTTON_ID,
        payload: newButtonId,
      });
    }
  }, [triggerId, dispatch, id, dropdownId]);

  function handleKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
      case "Enter":
      case " ":
        event.preventDefault(); // prevent scroll
        readyToSelect.current = true;
        dispatch({
          type: OPEN_MENU_AT_INDEX,
          payload: { index: firstNonDisabledIndex },
        });
        break;
      default:
        break;
    }
  }

  function handleMouseDown(event: React.MouseEvent) {
    if (!isExpanded) {
      triggerClickedRef.current = true;
    }
    if (isRightClick(event.nativeEvent)) {
      return;
    } else if (isExpanded) {
      dispatch({ type: CLOSE_MENU });
    } else {
      dispatch({ type: OPEN_MENU_CLEARED });
    }
  }

  return {
    props: {
      ...rest,
      ref,
      type: "button" as const,
      "data-reach-dropdown-trigger": "",
      id: triggerId || undefined,
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
      onMouseDown: composeEventHandlers(onMouseDown, handleMouseDown),
    },
  };
}

/**
 * DropdownTrigger
 *
 * Wraps a DOM trigger that toggles the opening and closing of the dropdown.
 * Must be rendered inside of a `<DropdownProvider>`.
 */
const DropdownTrigger = React.forwardRef(
  ({ as: Comp = "button", ...props }, forwardedRef) => {
    let {
      props: { ref, ...rest },
    } = useDropdownTrigger({ forwardedRef, ...props });

    return <Comp {...rest} ref={ref} />;
  }
) as Polymorphic.ForwardRefComponent<"button", DropdownTriggerProps>;

interface DropdownTriggerProps {
  /**
   * Accepts any renderable content.
   */
  children: React.ReactNode;
}

if (__DEV__) {
  DropdownTrigger.displayName = "Dropdown";
  DropdownTrigger.propTypes = {
    children: PropTypes.node,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * DropdownItem
 */
function useDropdownItem({
  index: indexProp,
  isLink = false,
  onClick,
  onDragStart,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  onMouseUp,
  onSelect,
  disabled,
  onFocus,
  valueText: valueTextProp,
  forwardedRef,
  refObject,
  ...rest
}: DropdownItemProps &
  React.ComponentPropsWithoutRef<"div"> & {
    forwardedRef: React.ForwardedRef<HTMLDivElement>;
    refObject: React.MutableRefObject<HTMLElement | null>;
  }) {
  let {
    dropdownRef,
    triggerRef,
    dispatch,
    readyToSelect,
    selectCallbacks,
    state: { selectionIndex, isExpanded },
  } = React.useContext(DropdownContext);

  // After the ref is mounted to the DOM node, we check to see if we have an
  // explicit valueText prop before looking for the node's textContent for
  // typeahead functionality.
  let [valueText, setValueText] = React.useState(valueTextProp || "");

  let setValueTextFromDOM = React.useCallback(
    (node: HTMLElement) => {
      if (!valueTextProp && node?.textContent) {
        setValueText(node.textContent);
      }
    },
    [valueTextProp]
  );

  let ref = useComposedRefs(forwardedRef, refObject, setValueTextFromDOM);

  let mouseEventStarted = React.useRef(false);

  let index = useDropdownItemIndex({
    itemRef: refObject,
    key: valueText,
    disabled,
    isLink,
    providedIndex: indexProp,
  });

  let isSelected = index === selectionIndex && !disabled;

  // Update the callback ref array on every render
  selectCallbacks.current[index] = onSelect;

  function select() {
    focus(triggerRef.current);
    onSelect && onSelect();
    dispatch({ type: CLICK_MENU_ITEM });
  }

  function handleClick(event: React.MouseEvent) {
    if (isLink && !isRightClick(event.nativeEvent)) {
      if (disabled) {
        event.preventDefault();
      } else {
        select();
      }
    }
  }

  function handleDragStart(event: React.MouseEvent) {
    // Because we don't preventDefault on mousedown for links (we need the
    // native click event), clicking and holding on a link triggers a
    // dragstart which we don't want.
    if (isLink) {
      event.preventDefault();
    }
  }

  function handleMouseDown(event: React.MouseEvent) {
    if (isRightClick(event.nativeEvent)) {
      return;
    }

    if (isLink) {
      // Signal that the mouse is down so we can call the right function if the
      // user is clicking on a link.
      mouseEventStarted.current = true;
    } else {
      event.preventDefault();
    }
  }

  function handleMouseEnter(event: React.MouseEvent) {
    if (!isSelected && index != null && !disabled) {
      dispatch({
        type: SELECT_ITEM_AT_INDEX,
        payload: {
          index,
          dropdownRef,
        },
      });
    }
  }

  function handleMouseLeave(event: React.MouseEvent) {
    // Clear out selection when mouse over a non-item child.
    dispatch({ type: CLEAR_SELECTION_INDEX });
  }

  function handleMouseMove() {
    readyToSelect.current = true;
    if (!isSelected && index != null && !disabled) {
      dispatch({
        type: SELECT_ITEM_AT_INDEX,
        payload: {
          index,
          dropdownRef,
        },
      });
    }
  }

  function handleFocus() {
    readyToSelect.current = true;
    if (!isSelected && index != null && !disabled) {
      dispatch({
        type: SELECT_ITEM_AT_INDEX,
        payload: {
          index,
        },
      });
    }
  }

  function handleMouseUp(event: React.MouseEvent) {
    if (!readyToSelect.current) {
      readyToSelect.current = true;
      return;
    }
    if (isRightClick(event.nativeEvent)) return;

    if (isLink) {
      // If a mousedown event was initiated on an item followed by a mouseup
      // event on the same item, we do nothing; a click event will come next
      // and handle selection. Otherwise, we trigger a click event.
      if (mouseEventStarted.current) {
        mouseEventStarted.current = false;
      } else if (refObject.current) {
        refObject.current.click();
      }
    } else {
      if (!disabled) {
        select();
      }
    }
  }

  // When the dropdown closes, reset readyToSelect for the next interaction.
  React.useEffect(() => {
    if (!isExpanded) {
      readyToSelect.current = false;
    }
  }, [isExpanded, readyToSelect]);

  // Any time a mouseup event occurs anywhere in the document, we reset the
  // mouseEventStarted ref so we can check it again when needed.
  React.useEffect(() => {
    let ownerDocument = getOwnerDocument(refObject.current)!;
    ownerDocument.addEventListener("mouseup", listener);
    return () => {
      ownerDocument.removeEventListener("mouseup", listener);
    };

    function listener() {
      mouseEventStarted.current = false;
    }
  }, [refObject]);

  return {
    data: {
      disabled,
      selected: isSelected,
      valueText,
      index,
    },
    props: {
      id: useDropdownItemId(index),
      tabIndex: -1,
      ...rest,
      ref,
      "data-reach-dropdown-item": "",
      "data-selected": isSelected ? "" : undefined,
      "data-disabled": disabled ? "" : undefined,
      "data-valuetext": valueText,
      onClick: composeEventHandlers(onClick, handleClick),
      onDragStart: composeEventHandlers(onDragStart, handleDragStart),
      onMouseDown: composeEventHandlers(onMouseDown, handleMouseDown),
      onMouseEnter: composeEventHandlers(onMouseEnter, handleMouseEnter),
      onMouseLeave: composeEventHandlers(onMouseLeave, handleMouseLeave),
      onMouseMove: composeEventHandlers(onMouseMove, handleMouseMove),
      onFocus: composeEventHandlers(onFocus, handleFocus),
      onMouseUp: composeEventHandlers(onMouseUp, handleMouseUp),
    },
  };
}

const DropdownItem = React.forwardRef(
  ({ as: Comp = "div", ...rest }, forwardedRef) => {
    let ownRef = React.useRef<HTMLElement | null>(null);
    let { props } = useDropdownItem({
      refObject: ownRef,
      forwardedRef,
      ...rest,
    });
    return <Comp {...props} />;
  }
) as Polymorphic.ForwardRefComponent<"div", DropdownItemProps>;

interface DropdownItemProps {
  /**
   * You can put any type of content inside of a `<DropdownItem>`.
   */
  children: React.ReactNode;
  /**
   * Callback that fires when a `DropdownItem` is selected.
   */
  onSelect(): void;
  index?: number;
  isLink?: boolean;
  valueText?: string;
  /**
   * Whether or not the item is disabled from selection and navigation.
   */
  disabled?: boolean;
}

////////////////////////////////////////////////////////////////////////////////

function useDropdownItems({
  id,
  onKeyDown,
  forwardedRef,
  ...props
}: DropdownItemsProps &
  React.ComponentPropsWithoutRef<"div"> & {
    forwardedRef: React.ForwardedRef<HTMLDivElement>;
  }) {
  const {
    dispatch,
    triggerRef,
    dropdownRef,
    selectCallbacks,
    dropdownId,
    state: { isExpanded, triggerId, selectionIndex, typeaheadQuery },
  } = React.useContext(DropdownContext);

  const items = useDescendants(DropdownDescendantContext);
  const ref = useComposedRefs(dropdownRef, forwardedRef);

  React.useEffect(() => {
    // Respond to user char key input with typeahead
    const match = findItemFromTypeahead(items, typeaheadQuery);
    if (typeaheadQuery && match != null) {
      dispatch({
        type: SELECT_ITEM_AT_INDEX,
        payload: {
          index: match,
          dropdownRef,
        },
      });
    }
    let timeout = window.setTimeout(
      () => typeaheadQuery && dispatch({ type: SEARCH_FOR_ITEM, payload: "" }),
      1000
    );
    return () => window.clearTimeout(timeout);
  }, [dispatch, items, typeaheadQuery, dropdownRef]);

  const prevItemsLength = usePrevious(items.length);
  const prevSelected = usePrevious(items[selectionIndex]);
  const prevSelectionIndex = usePrevious(selectionIndex);

  React.useEffect(() => {
    if (selectionIndex > items.length - 1) {
      // If for some reason our selection index is larger than our possible
      // index range (let's say the last item is selected and the list
      // dynamically updates), we need to select the last item in the list.
      dispatch({
        type: SELECT_ITEM_AT_INDEX,
        payload: {
          index: items.length - 1,
          dropdownRef,
        },
      });
    } else if (
      // Checks if
      //  - list length has changed
      //  - selection index has not changed BUT selected item has changed
      //
      // This prevents any dynamic adding/removing of items from actually
      // changing a user's expected selection.
      prevItemsLength !== items.length &&
      selectionIndex > -1 &&
      prevSelected &&
      prevSelectionIndex === selectionIndex &&
      items[selectionIndex] !== prevSelected
    ) {
      dispatch({
        type: SELECT_ITEM_AT_INDEX,
        payload: {
          index: items.findIndex((i) => i.key === prevSelected.key),
        },
      });
    }
  }, [
    dispatch,
    items,
    dropdownRef,
    prevItemsLength,
    prevSelected,
    prevSelectionIndex,
    selectionIndex,
  ]);

  let handleKeyDown = composeEventHandlers(
    function handleKeyDown(event: React.KeyboardEvent) {
      let { key } = event;

      if (!isExpanded) {
        return;
      }

      switch (key) {
        case "Enter":
        case " ":
          let selected = items.find((item) => item.index === selectionIndex);
          // For links, the Enter key will trigger a click by default, but for
          // consistent behavior across dropdown items we'll trigger a click
          // when the spacebar is pressed.
          if (selected && !selected.disabled) {
            event.preventDefault();
            if (selected.isLink && selected.element) {
              selected.element.click();
            } else {
              // Focus the trigger first by default when an item is selected.
              // We fire the onSelect callback next so the app can manage
              // focus if needed.
              focus(triggerRef.current);
              selectCallbacks.current[selected.index] &&
                selectCallbacks.current[selected.index]();
              dispatch({ type: CLICK_MENU_ITEM });
            }
          }
          break;
        case "Escape":
          focus(triggerRef.current);
          dispatch({ type: CLOSE_MENU });
          break;
        case "Tab":
          // prevent leaving
          event.preventDefault();
          break;
        default:
          // Check if a user is typing some char keys and respond by setting
          // the query state.
          if (isString(key) && key.length === 1) {
            const query = typeaheadQuery + key.toLowerCase();
            dispatch({
              type: SEARCH_FOR_ITEM,
              payload: query,
            });
          }
          break;
      }
    },
    useDescendantKeyDown(DropdownDescendantContext, {
      currentIndex: selectionIndex,
      orientation: "vertical",
      rotate: false,
      filter: (item) => !item.disabled,
      callback: (index: number) => {
        dispatch({
          type: SELECT_ITEM_AT_INDEX,
          payload: {
            index,
            dropdownRef,
          },
        });
      },
      key: "index",
    })
  );

  return {
    data: {
      activeDescendant: useDropdownItemId(selectionIndex) || undefined,
      triggerId,
    },
    props: {
      tabIndex: -1,
      ...props,
      ref,
      "data-reach-dropdown-items": "",
      id: dropdownId,
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    },
  };
}

/**
 * DropdownItems
 */
const DropdownItems = React.forwardRef(
  ({ as: Comp = "div", ...props }, forwardedRef) => {
    let {
      data: { activeDescendant, triggerId },
      props: { ref, ...newProps },
    } = useDropdownItems({ forwardedRef, ...props });
    return (
      <Comp
        aria-activedescendant={activeDescendant}
        aria-labelledby={triggerId || undefined}
        role="menu"
        {...newProps}
        ref={ref}
        data-reach-dropdown-items=""
      />
    );
  }
) as Polymorphic.ForwardRefComponent<"div", DropdownItemsProps>;

interface DropdownItemsProps {
  /**
   * Can contain only `DropdownItem`
   */
  children: React.ReactNode;
}

if (__DEV__) {
  DropdownItems.displayName = "DropdownItems";
  DropdownItems.propTypes = {
    children: PropTypes.node,
  };
}

////////////////////////////////////////////////////////////////////////////////

function useDropdownPopover({
  children,
  onBlur,
  forwardedRef,
  position,
  portal: _,
  ...rest
}: DropdownPopoverProps &
  React.ComponentPropsWithoutRef<"div"> & {
    forwardedRef: React.ForwardedRef<HTMLDivElement>;
  }) {
  const {
    triggerRef,
    triggerClickedRef,
    dispatch,
    dropdownRef,
    popoverRef,
    state: { isExpanded },
  } = React.useContext(DropdownContext);

  const ref = useComposedRefs(popoverRef, forwardedRef);

  React.useEffect(() => {
    if (!isExpanded) {
      return;
    }

    let ownerDocument = getOwnerDocument(popoverRef.current)!;
    function listener(event: MouseEvent | TouchEvent) {
      if (triggerClickedRef.current) {
        triggerClickedRef.current = false;
      } else if (
        !popoverContainsEventTarget(popoverRef.current, event.target)
      ) {
        // We on want to close only if focus rests outside the dropdown
        dispatch({ type: CLOSE_MENU });
      }
    }
    ownerDocument.addEventListener("mousedown", listener);
    // see https://github.com/reach/reach-ui/pull/700#discussion_r530369265
    // ownerDocument.addEventListener("touchstart", listener);
    return () => {
      ownerDocument.removeEventListener("mousedown", listener);
      // ownerDocument.removeEventListener("touchstart", listener);
    };
  }, [
    triggerClickedRef,
    triggerRef,
    dispatch,
    dropdownRef,
    popoverRef,
    isExpanded,
  ]);

  return {
    data: {
      targetRef: triggerRef,
      position,
    },
    props: {
      ref,
      "data-reach-dropdown-popover": "",
      hidden: !isExpanded,
      children,
      onBlur: composeEventHandlers(onBlur, (event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) {
          return;
        }
        dispatch({ type: CLOSE_MENU });
      }),
      ...rest,
    },
  };
}

/**
 * DropdownPopover
 */
const DropdownPopover = React.forwardRef(
  ({ as: Comp = "div", portal = true, ...rest }, forwardedRef) => {
    const {
      data: { targetRef, position },
      props: { ref, ...props },
    } = useDropdownPopover({ forwardedRef, ...rest });
    return portal ? (
      <Popover
        {...props}
        as={Comp}
        ref={ref}
        targetRef={targetRef as any}
        position={position}
      />
    ) : (
      <Comp ref={ref} {...props} />
    );
  }
) as Polymorphic.ForwardRefComponent<"div", DropdownPopoverProps>;

interface DropdownPopoverProps {
  /**
   * Must contain a `DropdownItems`
   */
  children: React.ReactNode;
  /**
   * Whether or not the popover should be rendered inside a portal. Defaults to
   * `true`.
   */
  portal?: boolean;
  /**
   * A function used to determine the position of the popover in relation to the
   * trigger. By default, the trigger will attempt to position the popover below
   * the trigger aligned with its left edge. If this positioning results in
   * collisions with any side of the window, the popover will be anchored to a
   * different side to avoid those collisions if possible.
   */
  position?: Position;
}

if (__DEV__) {
  DropdownPopover.displayName = "DropdownPopover";
  DropdownPopover.propTypes = {
    children: PropTypes.node,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * A hook that exposes data for a given `DropdownProvider` component to its
 * descendants.
 */
function useDropdownContext() {
  return React.useContext(DropdownContext);
}

function useDropdownDescendants() {
  return useDescendants(DropdownDescendantContext);
}

function useDropdownItemIndex({
  key,
  disabled,
  isLink,
  providedIndex,
  itemRef,
}: {
  key: string;
  disabled?: boolean;
  isLink?: boolean;
  providedIndex?: number;
  itemRef: React.MutableRefObject<HTMLElement | null>;
}) {
  return useDescendant(
    {
      element: itemRef.current!,
      key,
      disabled,
      isLink: isLink ?? false,
    },
    DropdownDescendantContext,
    providedIndex
  );
}

////////////////////////////////////////////////////////////////////////////////

/**
 * When a user's typed input matches the string displayed in an item, it is
 * expected that the matching item is selected. This is our matching function.
 */
function findItemFromTypeahead(
  items: DropdownDescendant[],
  string: string = ""
) {
  if (!string) {
    return null;
  }

  const found = items.find((item) => {
    return item.disabled
      ? false
      : item.element?.dataset?.valuetext?.toLowerCase().startsWith(string);
  });
  return found ? items.indexOf(found) : null;
}

function useDropdownItemId(index: number | null) {
  let { dropdownId } = React.useContext(DropdownContext);
  return index != null && index > -1
    ? makeId(`option-${index}`, dropdownId)
    : undefined;
}

interface DropdownState {
  isExpanded: boolean;
  selectionIndex: number;
  triggerId: null | string;
  typeaheadQuery: string;
}

type DropdownAction =
  | { type: "CLICK_MENU_ITEM" }
  | { type: "CLOSE_MENU" }
  | { type: "OPEN_MENU_AT_FIRST_ITEM" }
  | { type: "OPEN_MENU_AT_INDEX"; payload: { index: number } }
  | { type: "OPEN_MENU_CLEARED" }
  | {
      type: "SELECT_ITEM_AT_INDEX";
      payload: {
        max?: number;
        min?: number;
        index: number;
        dropdownRef?: React.RefObject<HTMLElement | null>;
      };
    }
  | { type: "CLEAR_SELECTION_INDEX" }
  | { type: "SET_BUTTON_ID"; payload: string }
  | { type: "SEARCH_FOR_ITEM"; payload: string };

function focus<T extends HTMLElement = HTMLElement>(
  element: T | undefined | null
) {
  element && element.focus();
}

function popoverContainsEventTarget(
  popover: HTMLElement | null,
  target: HTMLElement | EventTarget | null
) {
  return !!(popover && popover.contains(target as HTMLElement));
}

function reducer(
  state: DropdownState,
  action: DropdownAction = {} as DropdownAction
): DropdownState {
  switch (action.type) {
    case CLICK_MENU_ITEM:
      return {
        ...state,
        isExpanded: false,
        selectionIndex: -1,
      };
    case CLOSE_MENU:
      return {
        ...state,
        isExpanded: false,
        selectionIndex: -1,
      };
    case OPEN_MENU_AT_FIRST_ITEM:
      return {
        ...state,
        isExpanded: true,
        selectionIndex: 0,
      };
    case OPEN_MENU_AT_INDEX:
      return {
        ...state,
        isExpanded: true,
        selectionIndex: action.payload.index,
      };
    case OPEN_MENU_CLEARED:
      return {
        ...state,
        isExpanded: true,
        selectionIndex: -1,
      };
    case SELECT_ITEM_AT_INDEX:
      if (
        action.payload.index >= 0 &&
        action.payload.index !== state.selectionIndex
      ) {
        if (
          action.payload.dropdownRef?.current &&
          action.payload.dropdownRef.current !== document.activeElement
        ) {
          action.payload.dropdownRef.current.focus();
        }

        return {
          ...state,
          selectionIndex:
            action.payload.max != null
              ? Math.min(Math.max(action.payload.index, 0), action.payload.max)
              : Math.max(action.payload.index, 0),
        };
      }
      return state;
    case CLEAR_SELECTION_INDEX:
      return {
        ...state,
        selectionIndex: -1,
      };
    case SET_BUTTON_ID:
      return {
        ...state,
        triggerId: action.payload,
      };
    case SEARCH_FOR_ITEM:
      if (typeof action.payload !== "undefined") {
        return {
          ...state,
          typeaheadQuery: action.payload,
        };
      }
      return state;
    default:
      return state;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Types

type DropdownDescendant = Descendant<HTMLElement> & {
  key: string;
  isLink: boolean;
  disabled?: boolean;
};

type ButtonRef = React.RefObject<null | HTMLElement>;
type DropdownRef = React.RefObject<null | HTMLElement>;
type PopoverRef = React.RefObject<null | HTMLElement>;

interface InternalDropdownContextValue {
  triggerClickedRef: React.MutableRefObject<boolean>;
  triggerRef: ButtonRef;
  dispatch: React.Dispatch<DropdownAction>;
  dropdownId: string | undefined;
  dropdownRef: DropdownRef;
  popoverRef: PopoverRef;
  readyToSelect: React.MutableRefObject<boolean>;
  selectCallbacks: React.MutableRefObject<(() => void)[]>;
  state: DropdownState;
}

interface DropdownContextValue {
  isExpanded: boolean;
  // id: string | undefined;
}

////////////////////////////////////////////////////////////////////////////////
// Exports

export type {
  DropdownTriggerProps,
  DropdownContextValue,
  DropdownItemsProps,
  DropdownItemProps,
  DropdownPopoverProps,
  DropdownProviderProps,
};
export {
  ACTIONS,
  DropdownProvider,
  DropdownTrigger,
  DropdownItem,
  DropdownItems,
  DropdownPopover,
  useDropdownDescendants,
  useDropdownContext,
  useDropdownItemIndex,
  useDropdownItem,
  useDropdownItemId,
  useDropdownItems,
  useDropdownPopover,
  findItemFromTypeahead,
};
