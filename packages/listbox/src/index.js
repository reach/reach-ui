////////////////////////////////////////////////////////////////////////////////
// Welcome to @reach/listbox!
// TODO:
//  - test controlled components
//  - navigate by searching with char keys
//  - navigate on button mouse down instead of click
//  - `confirming` state
//  - figure out touch events
//  - make sure arbitrary elements in popover work
//  - SR tests
//  - Deal with overlapping popver/button issues

import React, {
  forwardRef,
  Children,
  cloneElement,
  createContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useContext,
  useReducer,
  useState
} from "react";
import PropTypes from "prop-types";
import { makeId, wrapEvent, useForkedRef } from "@reach/utils";
// import { findAll } from "highlight-words-core";
// import escapeRegexp from "escape-regexp";
import { useId } from "@reach/auto-id";
import Popover, { positionMatchWidth } from "@reach/popover";

////////////////////////////////////////////////////////////////////////////////
// States

// Nothing going on, waiting for the user to type or use the arrow keys
const IDLE = "IDLE";

// The user is navigate the list with a pointer
const NAVIGATING = "NAVIGATING";

// The user is navigate the list with a keyboard
const NAVIGATING_WITH_KEYS = "NAVIGATING_WITH_KEYS";

// The user is interacting with arbitrary elements inside the popup that
// are not ListboxInputs
const INTERACTING = "INTERACTING";

////////////////////////////////////////////////////////////////////////////////
// Actions:

const CHANGE = "CHANGE";

// User is typing
const SEARCHING_WHILE_EXPANDED = "SEARCHING_WHILE_EXPANDED";
const SEARCHING_WHILE_CLOSED = "SEARCHING_WHILE_CLOSED";

const NAVIGATE = "NAVIGATE";
const NAVIGATE_WITH_KEYS = "NAVIGATE_WITH_KEYS";

// User can be navigating with keyboard and then click instead, we want the
// value from the click, not the current nav item
const SELECT_WITH_KEYBOARD = "SELECT_WITH_KEYBOARD";
const SELECT_WITH_CLICK = "SELECT_WITH_CLICK";

// Pretty self-explanatory, user can hit escape or blur to close the popover
const ESCAPE = "ESCAPE";
const BLUR = "BLUR";

// The user left the input to interact with arbitrary elements inside the popup
const INTERACT = "INTERACT";

const OPEN_LISTBOX = "OPEN_LISTBOX";

const CLOSE_WITH_BUTTON = "CLOSE_WITH_BUTTON";

const openEvents = {
  [BLUR]: IDLE,
  [ESCAPE]: IDLE,
  [NAVIGATE]: NAVIGATING,
  [SELECT_WITH_KEYBOARD]: IDLE,
  [CLOSE_WITH_BUTTON]: IDLE,
  [SELECT_WITH_CLICK]: IDLE,
  [INTERACT]: INTERACTING
};

////////////////////////////////////////////////////////////////////////////////
const stateChart = {
  initial: IDLE,
  states: {
    [IDLE]: {
      on: {
        [CHANGE]: IDLE,
        [BLUR]: IDLE,
        [SEARCHING_WHILE_CLOSED]: IDLE,
        [OPEN_LISTBOX]: NAVIGATING
      }
    },
    [NAVIGATING]: {
      on: {
        ...openEvents,
        [CHANGE]: NAVIGATING,
        [NAVIGATE_WITH_KEYS]: NAVIGATING_WITH_KEYS,
        [SEARCHING_WHILE_EXPANDED]: NAVIGATING_WITH_KEYS
      }
    },
    [NAVIGATING_WITH_KEYS]: {
      on: {
        ...openEvents,
        [CHANGE]: NAVIGATING_WITH_KEYS,
        [NAVIGATE_WITH_KEYS]: NAVIGATING_WITH_KEYS,
        [SEARCHING_WHILE_EXPANDED]: NAVIGATING_WITH_KEYS
      }
    },
    [INTERACTING]: {
      on: {
        ...openEvents,
        [CHANGE]: INTERACTING
      }
    }
  }
};

function reducer(data, action) {
  const {
    refs: { optionsRef }
  } = action;
  const nextState = { ...data, lastActionType: action.type };
  const searchValue = findOptionValueFromSearch(
    optionsRef.current,
    action.query
  );

  switch (action.type) {
    case CHANGE:
      return {
        ...nextState,
        ...action
      };
    case SEARCHING_WHILE_CLOSED:
      return searchValue
        ? {
            ...nextState,
            selection: searchValue
          }
        : nextState;
    case SEARCHING_WHILE_EXPANDED:
      return searchValue
        ? {
            ...nextState,
            navigationSelection: searchValue
          }
        : nextState;
    case NAVIGATE:
      return {
        ...nextState,
        navigationSelection: action.navigationSelection
      };
    case NAVIGATE_WITH_KEYS:
      return {
        ...nextState,
        navigationSelection: action.navigationSelection
      };
    case OPEN_LISTBOX:
      return {
        ...nextState,
        navigationSelection: nextState.selection
      };
    case BLUR:
    case ESCAPE:
      return {
        ...nextState,
        navigationSelection: null
      };
    case SELECT_WITH_CLICK:
      return {
        ...nextState,
        selection: action.selection,
        navigationSelection: null
      };
    case SELECT_WITH_KEYBOARD:
      return {
        ...nextState,
        selection: data.navigationSelection,
        navigationSelection: null
      };
    case CLOSE_WITH_BUTTON:
      return {
        ...nextState,
        navigationSelection: null
      };
    case INTERACT:
      return nextState;

    default:
      throw new Error(`Unknown action ${action.type}`);
  }
}

const expandedStates = [NAVIGATING, NAVIGATING_WITH_KEYS, INTERACTING];
const isExpanded = state => expandedStates.includes(state);

const ListboxContext = createContext({});

////////////////////////////////////////////////////////////////////////////////
// ListboxInput

export const ListboxInput = forwardRef(function ListboxInput(
  {
    as: Comp = "div",
    children,
    defaultValue,
    name,
    onBlur,
    onChange,
    onClick,
    onKeyDown,
    onSelect,
    value: controlledValue,
    ...props
  },
  forwardedRef
) {
  const initialData = {
    // the value the user has selected. We derived this also when the developer
    // is controlling the value
    selection: defaultValue,
    // the value the user has navigated to with the keyboard
    navigationSelection: null
  };

  const [
    state,
    data,
    transition,
    { popoverRef, buttonRef, inputRef, listRef, selectOnClickRef, optionsRef }
  ] = useReducerMachine(stateChart, reducer, initialData);

  const isControlled = controlledValue != null;

  const value = isControlled ? controlledValue : data.value;

  const id = useId(props.id);

  const listboxId = makeId("listbox", id);

  const buttonId = makeId("button", id);

  const ref = useForkedRef(inputRef, forwardedRef);

  const handleValueChange = selection => {
    transition(CHANGE, { selection });
  };

  // If they are controlling the value we still need to do our transitions, so
  // we have this derived state to emulate onChange of the input as we receive
  // new `value`s ...[*]
  if (isControlled && controlledValue !== data.value) {
    handleValueChange(controlledValue);
  }

  // [*]... and when controlled, we don't trigger handleValueChange as the user
  // types, instead the developer controls it with the normal input onChange
  // prop
  const handleChange = wrapEvent(onChange, event => {
    if (!isControlled) {
      handleValueChange(event.target.value);
    }
  }); // ???

  const handleClick = wrapEvent(onClick, () => {
    if (selectOnClickRef.current) {
      selectOnClickRef.current = false;
      // ...
    }
  }); // ???

  useFocusManagement(data.lastActionType, buttonRef, listRef);

  const context = {
    buttonId,
    data,
    inputRef,
    popoverRef,
    buttonRef,
    onSelect,
    optionsRef,
    state,
    transition,
    listRef,
    listboxId,
    isExpanded: isExpanded(state)
  };

  return (
    <ListboxContext.Provider value={context}>
      <Comp
        ref={ref}
        data-reach-listbox=""
        data-expanded={context.isExpanded}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Comp>
      {name && <input type="hidden" name={name} value={value} />}
    </ListboxContext.Provider>
  );
});

ListboxInput.displayName = "ListboxInput";
if (__DEV__) {
  ListboxInput.propTypes = {
    onSelect: PropTypes.func
  };
}

////////////////////////////////////////////////////////////////////////////////
// ListboxPopover

export const ListboxPopover = forwardRef(function ListboxPopover(
  {
    // if true, will render in a portal, otherwise inline
    portal = true,

    // wrapped events
    onKeyDown,
    onBlur,

    ...props
  },
  forwardedRef
) {
  const { popoverRef, buttonRef, isExpanded } = useContext(ListboxContext);
  const ref = useForkedRef(popoverRef, forwardedRef);
  const handleKeyDown = useKeyDown();
  const handleBlur = useBlur();
  const hidden = !isExpanded;

  const Container = portal ? Popover : "div";

  const popupProps = portal
    ? {
        targetRef: buttonRef,
        position: positionMatchWidth
      }
    : null;

  return (
    <Container
      {...props}
      hidden={hidden}
      data-reach-listbox-popover=""
      {...popupProps}
      ref={ref}
      onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
      onBlur={wrapEvent(onBlur, handleBlur)}
      // Allow the user to click empty space inside the popover without causing
      // to close from useBlur
      tabIndex={-1}
    />
  );
});

////////////////////////////////////////////////////////////////////////////////
// ListboxList

export const ListboxList = forwardRef(function ListboxList(
  { as: Comp = "ul", children, ...props },
  forwardedRef
) {
  const { listboxId, listRef, optionsRef } = useContext(ListboxContext);

  const ref = useForkedRef(listRef, forwardedRef);

  const childCount = Children.count(children);
  const focusCount = useRef(-1);

  const {
    data: { value }
  } = useContext(ListboxContext);

  let clones = useChildrenWithFocusIndicies(
    children,
    isFocusableChildType,
    getChildValueAndValueText,
    optionsRef
  );

  return (
    <Comp
      ref={ref}
      data-reach-listbox-list=""
      role="listbox"
      id={listboxId}
      tabIndex={-1}
      aria-activedescendant={makeId(
        "option",
        value ? makeHash(value) : undefined
      )}
      onClick={event => {
        listRef.current.focus();
      }}
      {...props}
    >
      {clones}
    </Comp>
  );
});

////////////////////////////////////////////////////////////////////////////////
// ListboxOption

export const ListboxOption = forwardRef(function ListboxOption(
  {
    children,
    onClick,
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
    onMouseUp,
    // TODO: Touch events

    _index: index,
    _value: value,
    _valueText: valueText,

    // These props are intercepted in ListboxList and used to determine the real
    // value and valuetext in case they are to be inferred from somewhere other
    // than direct prop passing
    value: interceptedValue,
    valueText: interceptedValueText,
    getValueText,

    ...props
  },
  forwardedRef
) {
  const {
    onSelect,
    data: { selection: inputValue, navigationSelection },
    state,
    transition
  } = useContext(ListboxContext);

  const ownRef = useRef(null);
  const ref = useForkedRef(ownRef, forwardedRef);

  const isHighlighted = navigationSelection
    ? navigationSelection === value
    : false;
  const isActive = inputValue === value;

  function handleMouseEnter() {
    transition(NAVIGATE, { navigationSelection: value });
  }

  function handleMouseLeave() {
    transition(NAVIGATE, { navigationSelection: null });
  }

  function handleMouseDown(event) {
    // TODO: Ignore right clicks
    if (event.nativeEvent.which === 3) {
      // return;
    }

    // Prevent the item from stealing focus from the list
    event.preventDefault();
  }

  function handleMouseMove() {
    if (state === NAVIGATING_WITH_KEYS) {
      transition(NAVIGATE, { navigationSelection: value });
    }
  }

  function handleMouseUp(event) {
    // Ignore right clicks
    if (event.nativeEvent.which === 3) {
      // return;
    }

    onSelect && onSelect(value);
    transition(SELECT_WITH_CLICK, { selection: value });
  }

  // We use layout effect here to avoid a flash
  useLayoutEffect(() => {
    // If no value is set and we're looking at the first option, set the value
    if (!inputValue && index === 0) {
      transition(CHANGE, { selection: value });
    }
    // eslint is telling us to include transition, but it *should* be stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, inputValue, value]);

  return (
    <li
      {...props}
      data-reach-listbox-option=""
      ref={ref}
      id={makeId("option", value ? makeHash(value) : undefined)}
      role="option"
      aria-selected={isActive}
      data-value={value}
      data-valuetext={valueText}
      data-highlighted={isHighlighted ? "" : undefined}
      // without this the menu will close from `onBlur`, but with it the
      // element can be `document.activeElement` and then our focus checks in
      // onBlur will work as intended
      tabIndex={-1}
      onMouseDown={wrapEvent(onMouseDown, handleMouseDown)}
      onMouseUp={wrapEvent(onMouseUp, handleMouseUp)}
      onMouseEnter={wrapEvent(onMouseEnter, handleMouseEnter)}
      onMouseLeave={wrapEvent(onMouseLeave, handleMouseLeave)}
      onMouseMove={wrapEvent(onMouseMove, handleMouseMove)}
    >
      <span data-reach-listbox-option-text="">
        {typeof children === "function"
          ? children({ value, valueText })
          : valueText}
      </span>
    </li>
  );
});

ListboxOption.isReachType = "ListboxOption";
ListboxOption.displayName = "ListboxOption";
if (__DEV__) {
  ListboxOption.propTypes = {
    valueText: PropTypes.string,
    getValueText: PropTypes.func
  };
}

////////////////////////////////////////////////////////////////////////////////
// ListboxButton
export const ListboxButton = forwardRef(function ListboxButton(
  {
    as: Comp = "button",
    children,
    onBlur,
    onMouseDown,
    onTouchStart,
    onFocus,
    onKeyDown,
    ...props
  },
  forwardedRef
) {
  const {
    data,
    transition,
    state,
    buttonRef,
    buttonId,
    listboxId,
    optionsRef,
    isExpanded
  } = useContext(ListboxContext);

  const ref = useForkedRef(buttonRef, forwardedRef);

  const selection =
    data.selection && optionsRef.current.length
      ? optionsRef.current.find(({ props }) => props._value === data.selection)
      : null;

  const valueText = selection ? selection.props._valueText : null;
  const value = selection ? selection.props._value : null;

  const handleKeyDown = useKeyDown();

  function handleMouseDown(event) {
    // Ignore right clicks
    if (event.nativeEvent.which === 3) {
      return;
    }

    if (state === IDLE) {
      transition(OPEN_LISTBOX);
    } else {
      transition(CLOSE_WITH_BUTTON);
    }
  }

  return (
    <Comp
      data-reach-listbox-button=""
      aria-controls={listboxId} // TODO: verify that this is needed
      aria-labelledby={`${buttonId} ${listboxId}`}
      aria-haspopup="listbox"
      aria-expanded={isExpanded}
      ref={ref}
      onMouseDown={wrapEvent(onMouseDown, handleMouseDown)}
      onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
      style={{ border: "2px solid black" }}
      {...props}
    >
      {valueText}
    </Comp>
  );
});

////////////////////////////////////////////////////////////////////////////////
// Listbox
export const Listbox = forwardRef(function Listbox(
  { children, ...props },
  forwardedRef
) {
  return (
    <ListboxInput ref={forwardedRef} data-listbox="" {...props}>
      <ListboxButton />
      <ListboxPopover>
        <ListboxList>{children}</ListboxList>
      </ListboxPopover>
    </ListboxInput>
  );
});

Listbox.displayName = "Listbox";
if (__DEV__) {
  Listbox.propTypes = {};
}

////////////////////////////////////////////////////////////////////////////////
// The rest is all implementation details

// Move focus back to the input if we start navigating w/ the
// keyboard after focus has moved to any focusable content in
// the popup.
function useFocusManagement(lastActionType, buttonRef, listRef) {
  // useLayoutEffect so that the cursor goes to the end of the input instead
  // of awkwardly at the beginning, unclear to my why ...
  useLayoutEffect(() => {
    switch (lastActionType) {
      case ESCAPE:
      case SELECT_WITH_CLICK:
      case SELECT_WITH_KEYBOARD:
        requestAnimationFrame(() => {
          buttonRef.current.focus();
        });
        break;
      // case NAVIGATE:
      // case NAVIGATE_WITH_KEYS:
      case OPEN_LISTBOX:
        requestAnimationFrame(() => {
          listRef.current.focus();
        });
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastActionType]);
}

// We want the same events when the input or the popup have focus, so … hooks!
function useKeyDown() {
  const {
    data,
    onSelect,
    state,
    optionsRef: { current: options },
    transition
  } = useContext(ListboxContext);

  const { navigationSelection } = data;
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    if (searchString) {
      if (state === IDLE) {
        transition(SEARCHING_WHILE_CLOSED, { query: searchString });
      } else {
        transition(SEARCHING_WHILE_EXPANDED, { query: searchString });
      }
    }
    let timeout = window.setTimeout(() => {
      searchString && setSearchString("");
    }, 1000);
    return () => {
      window.clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchString]);

  return function handleKeyDown(event) {
    const hasOptions = Array.isArray(options) && !!options.length;
    const optionValues = hasOptions
      ? options.map(({ props }) => props._value)
      : [];
    const index =
      hasOptions && navigationSelection
        ? optionValues.indexOf(navigationSelection)
        : -1;

    // We need do a few things before each navigation event, sooooo
    function onReadyToNavigate(nav) {
      if (!hasOptions) {
        return false;
      }

      // Don't scroll the page
      event.preventDefault();
      if (state === IDLE) {
        transition(OPEN_LISTBOX);
      } else {
        nav();
      }
    }

    switch (event.key) {
      case "Home":
        onReadyToNavigate(() => {
          transition(NAVIGATE_WITH_KEYS, {
            navigationSelection: optionValues[0]
          });
        });
        break;

      case "End":
        onReadyToNavigate(() => {
          transition(NAVIGATE_WITH_KEYS, {
            navigationSelection: optionValues[optionValues.length - 1]
          });
        });
        break;

      case "ArrowDown":
        onReadyToNavigate(() => {
          const atBottom = index === optionValues.length - 1;
          if (atBottom) {
            return;
          } else {
            // Go to the next item in the list
            const navigationSelection =
              optionValues[(index + 1) % optionValues.length];
            transition(NAVIGATE_WITH_KEYS, { navigationSelection });
          }
        });
        break;

      // A lot of duplicate code with ArrowDown up next, I'm already over it.
      case "ArrowUp":
        onReadyToNavigate(() => {
          if (index === 0) {
            return;
          }
          // normal case, select previous
          const navigationSelection =
            optionValues[
              (index - 1 + optionValues.length) % optionValues.length
            ];
          transition(NAVIGATE_WITH_KEYS, { navigationSelection });
        });
        break;

      case "Escape":
        if (state !== IDLE) {
          transition(ESCAPE);
        }
        break;

      // TODO: Verify enter key, behaves differently with native select
      case " ":
      case "Enter":
        if (state === IDLE) {
          transition(OPEN_LISTBOX);
        } else if (
          (state === NAVIGATING || state === NAVIGATING_WITH_KEYS) &&
          navigationSelection !== null
        ) {
          // don't want to submit forms
          event.preventDefault();
          onSelect && onSelect(navigationSelection);
          transition(SELECT_WITH_KEYBOARD);
        }
        break;

      default:
        break;
    }

    if (typeof event.key === "string" && event.key.length === 1) {
      setSearchString(searchString + event.key.toLowerCase());
    }
  };
}

function useBlur() {
  const { state, transition, popoverRef, inputRef, buttonRef } = useContext(
    ListboxContext
  );

  const contextMenu = useRef(false);

  /* useEffect(() => {
    let listener = () => {
      contextMenu.current = true;
    };
    window.addEventListener("oncontextmenu", listener);
    return () => {
      window.removeEventListener("oncontextmenu", listener);
      contextMenu.current = false;
    };
  }, []); */

  return function handleBlur(event) {
    requestAnimationFrame(() => {
      // we on want to close only if focus rests outside the listbox
      if (
        document.activeElement !== inputRef.current &&
        document.activeElement !== buttonRef.current &&
        popoverRef.current
      ) {
        if (popoverRef.current.contains(document.activeElement)) {
          // focus landed inside the listbox, keep it open
          if (state !== INTERACTING) {
            transition(INTERACT);
          }
        } else {
          // focus landed outside the listbox, close it.
          transition(BLUR);
        }
      }
    });
  };
}

// This manages transitions between states with a built in reducer to manage
// the data that goes with those transitions.
function useReducerMachine(chart, reducer, initialData) {
  const [state, setState] = useState(chart.initial);
  const [data, dispatch] = useReducer(reducer, initialData);

  const popoverRef = useRef(null);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Because we close the List on blur, we need to track if the blur is
  // caused by clicking inside the list, and if so, don't close the List.
  const selectOnClickRef = useRef(false); // ???

  // Options ref will be used to store all of the listbox's options as they are
  // rendered. We initialize options as an empty array to avoid type errors.
  const optionsRef = useRef([]);

  const refs = {
    popoverRef,
    buttonRef,
    inputRef,
    listRef,
    selectOnClickRef,
    optionsRef
  };

  const transition = (action, payload = {}) => {
    const currentState = chart.states[state];
    const nextState = currentState.on[action];
    if (!nextState) {
      return;
    }
    dispatch({ type: action, state, nextState: state, refs, ...payload });
    setState(nextState);
  };

  return [state, data, transition, refs];
}

// We don't want to track the active descendant with indexes because nothing is
// more annoying in a listbox than having it change values RIGHT AS YOU HIT
// ENTER. That only happens if you use the index as your data, rather than
// *your data as your data*. We use this to generate a unique ID based on the
// value of each item.  This function is short, sweet, and good enough™ (I also
// don't know how it works, tbqh)
// https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
const makeHash = str => {
  let hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for (let i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
};

////////////////////////////////////////////////////////////////////////////////
function isFocusableChildType(child) {
  return child.isReach === ListboxOption || child.type === ListboxOption;
}

function findOptionValueFromSearch(opts, string = "") {
  if (!string) return;
  const found = opts.find(
    ({ props }) =>
      props._valueText && props._valueText.toLowerCase().startsWith(string)
  );
  return found ? found.props._value : null;
}

// <Option><span>My thing</span></Option>
//
// NOT
//
// <span><Option>My thing</Option></span>
//
// const StyledListbox = styled(ListboxList)``
//
// StyledListbox.isReach = ListboxList;
//
// export default StyledListbox;

function getChildValueAndValueText(child) {
  // We will figure out the relevant value and valueText so we can store
  // both in our optionsRef, so we can callback to them anywhere.
  // Value text should be a human readable version of the value. It does
  // not need to be provided if the option's child is a text string.
  // Alternatively, the developer can use the `getValueText` function if
  // the valuetext depends on the actual value of the input.
  // If no children are passed to ListboxOption, value text will be
  // displayed as the option, but we also want value text as a
  // reasonable default for what is displayed in the ListboxButton when
  // the option is selected.
  let { value, valueText, getValueText, children } = child.props;

  // Infer value from string child if omitted, otherwise error becaure
  // what the heck … we need a value!
  if (!value) {
    if (typeof children === "string") {
      value = children;
    } else {
      throw Error(
        `A ListboxOption with a non-string child must have a provided value prop.`
      );
    }
  }

  // If valueText is omitted, first we check for getValueText. If that
  // isn't there then we try to infer it from a string child. If we
  // can't, then we just use the value.
  if (!valueText) {
    if (getValueText) {
      valueText = getValueText(value);
    } else if (typeof children === "string") {
      valueText = children;
    } else {
      valueText = value;
    }
  }

  return { _value: value, _valueText: valueText };
}

// TODO: Need a strategy for recurive cloning, TBD
function useChildrenWithFocusIndicies(
  children,
  condition,
  getAdditionalProps,
  storageRef
) {
  const [newChildren, setNewChildren] = useState(children);
  const childCount = Children.count(children);
  let focusCount = useRef(-1);

  useEffect(() => {
    setNewChildren(
      Children.map(children, (child, index) => {
        let clone;
        if (condition(child)) {
          focusCount.current++;
          const focusIndex = focusCount.current;
          const newProps = getAdditionalProps ? getAdditionalProps(child) : {};

          clone = cloneElement(child, {
            _index: focusIndex,
            ...newProps
          });
          storageRef.current[focusIndex] = clone;
        } else {
          clone = child;
        }

        // On the last child, reset our focusIndex counter for the next render
        if (index === childCount - 1) {
          focusCount.current = -1;
        }

        return clone;
      })
    );
  }, [children, childCount]);

  return newChildren;
}
