/* eslint-disable default-case */

////////////////////////////////////////////////////////////////////////////////
// Welcome to @reach/listbox! State transitions are managed by a state chart,
// state mutations are managed by a reducer. Please enjoy the read here, I
// figured out a few new tricks with context and refs I think you might love or
// hate 😂

// ???: navigate w/ arrows, then hit backspace: should it delete the
// autocompleted text or the old value the user had typed?!

import React, {
  forwardRef,
  createContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useContext,
  useMemo,
  useReducer,
  useState
} from "react";
import PropTypes from "prop-types";
import { makeId, wrapEvent, useForkedRef } from "@reach/utils";
import { findAll } from "highlight-words-core";
import escapeRegexp from "escape-regexp";
import { useId } from "@reach/auto-id";
import Popover, { positionMatchWidth } from "@reach/popover";

////////////////////////////////////////////////////////////////////////////////
// States

// Nothing going on, waiting for the user to type or use the arrow keys
const IDLE = "IDLE";

// The user is using the keyboard to navigate the list, not typing
const NAVIGATING = "NAVIGATING";

// The user is interacting with arbitrary elements inside the popup that
// are not ListboxInputs
const INTERACTING = "INTERACTING";

////////////////////////////////////////////////////////////////////////////////
// Actions:

const CHANGE = "CHANGE";

// User is typing
const SEARCHING_WHILE_EXPANDED = "SEARCHING_WHILE_EXPANDED";
const SEARCHING_WHILE_CLOSED = "SEARCHING_WHILE_CLOSED";

// User is navigating w/ the keyboard
const NAVIGATE = "NAVIGATE";

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
        [CHANGE]: NAVIGATING,
        [SEARCHING_WHILE_EXPANDED]: NAVIGATING,
        [BLUR]: IDLE,
        [ESCAPE]: IDLE,
        [NAVIGATE]: NAVIGATING,
        [SELECT_WITH_KEYBOARD]: IDLE,
        [CLOSE_WITH_BUTTON]: IDLE,
        [INTERACT]: INTERACTING
      }
    },
    [INTERACTING]: {
      on: {
        [CHANGE]: INTERACTING,
        [SEARCHING_WHILE_EXPANDED]: NAVIGATING,
        [BLUR]: IDLE,
        [ESCAPE]: IDLE,
        [NAVIGATE]: NAVIGATING,
        [CLOSE_WITH_BUTTON]: IDLE,
        [SELECT_WITH_CLICK]: IDLE
      }
    }
  }
};

function reducer(data, action) {
  const nextState = { ...data, lastActionType: action.type };
  switch (action.type) {
    case CHANGE:
    case SEARCHING_WHILE_CLOSED:
      return {
        ...nextState,
        value: action.value
      };
    case SEARCHING_WHILE_EXPANDED:
      return {
        ...nextState,
        navigationValue: action.value
      };
    case NAVIGATE:
    case OPEN_LISTBOX:
      return {
        ...nextState,
        navigationValue: findNavigationValue(nextState, action)
      };
    case BLUR:
    case ESCAPE:
      return {
        ...nextState,
        navigationValue: null
      };
    case SELECT_WITH_CLICK:
      return {
        ...nextState,
        value: action.value,
        navigationValue: null
      };
    case SELECT_WITH_KEYBOARD:
      return {
        ...nextState,
        value: data.navigationValue,
        navigationValue: null
      };
    case CLOSE_WITH_BUTTON:
      return {
        ...nextState,
        navigationValue: null
      };
    case INTERACT:
      return nextState;

    default:
      throw new Error(`Unknown action ${action.type}`);
  }
}

const expandedStates = [NAVIGATING, INTERACTING];
const isExpanded = state => expandedStates.includes(state);
// When we open a list, set the navigation value to the value in the input, if
// it's in the list, then it'll automatically be highlighted.
const findNavigationValue = (state, action) => {
  if (action.value) {
    return action.value;
  } else if (action.persistSelection) {
    return state.value;
  } else {
    return null;
  }
};

////////////////////////////////////////////////////////////////////////////////
// ListboxInput

const ListboxContext = createContext({});

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
  // We store the values of all the ListboxOptions on this ref. This makes it
  // possible to perform the keyboard navigation from the input on the list. We
  // manipulate this array through context so that we don't have to enforce a
  // parent/child relationship between ListboxList and ListboxOption with
  // cloneElement or fall back to DOM traversal.
  const optionsRef = useRef([]);

  const defaultData = {
    // the value the user has selected. We derived this also when the developer
    // is controlling the value
    value: defaultValue,
    // the value the user has navigated to with the keyboard
    navigationValue: null
  };

  const [state, data, transition] = useReducerMachine(
    stateChart,
    reducer,
    defaultData
  );

  const isControlled = controlledValue != null;

  const value = isControlled ? controlledValue : data.value;

  const id = useId(props.id);

  const listboxId = makeId("listbox", id);

  const buttonId = makeId("button", id);

  const popoverRef = useRef(null);

  const buttonRef = useRef(null);

  const inputRef = useRef(null);

  const listRef = useRef(null);

  const ref = useForkedRef(inputRef, forwardedRef);

  // Because we close the List on blur, we need to track if the blur is
  // caused by clicking inside the list, and if so, don't close the List.
  const selectOnClickRef = useRef(false);

  const handleValueChange = value => {
    transition(CHANGE, { value });
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

  const persistSelectionRef = useRef();

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
    persistSelectionRef,
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

  // Instead of conditionally rendering the popover we use the `hidden` prop
  // because we don't want to unmount on close (from escape or onSelect).  If
  // we unmounted, then we'd lose the optionsRef and the user wouldn't be able
  // to use the arrow keys to pop the list back open. However, the developer
  // can conditionally render the ListboxPopover if they do want to cause
  // mount/unmount based on the app's own data (like results.length or
  // whatever).
  const hidden = !isExpanded;

  const Container = portal ? Popover : "div";

  const popupProps = portal
    ? {
        targetRef: buttonRef,
        position: positionMatchWidth
      }
    : null;

  return (
    isExpanded && (
      <Container
        {...props}
        data-reach-listbox-popover=""
        {...popupProps}
        ref={ref}
        onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
        onBlur={wrapEvent(onBlur, handleBlur)}
        hidden={hidden}
        // Allow the user to click empty space inside the popover without causing
        // to close from useBlur
        tabIndex={-1}
      />
    )
  );
});

////////////////////////////////////////////////////////////////////////////////
// ListboxList

export const ListboxList = forwardRef(function ListboxList(
  {
    // when true, and the list opens again, the option with a matching value will be
    // automatically highleted.
    persistSelection = false,
    as: Comp = "ul",
    ...props
  },
  forwardedRef
) {
  const { optionsRef, persistSelectionRef, listboxId, listRef } = useContext(
    ListboxContext
  );

  const ref = useForkedRef(listRef, forwardedRef);

  if (persistSelection) {
    persistSelectionRef.current = true;
  }

  const {
    data: { value }
  } = useContext(ListboxContext);

  // WEIRD? Reset the options ref every render so that they are always
  // accurate and ready for keyboard navigation handlers. Using layout
  // effect to schedule this effect before the ListboxOptions push into
  // the array
  useLayoutEffect(() => {
    optionsRef.current = [];
    return () => (optionsRef.current = []);
  });

  return (
    <Comp
      ref={ref}
      data-reach-listbox-list=""
      role="listbox"
      id={listboxId}
      tabIndex={-1}
      aria-activedescendant={value ? makeHash(value) : undefined}
      {...props}
    />
  );
});

////////////////////////////////////////////////////////////////////////////////
// ListboxOption

export const ListboxOption = forwardRef(function ListboxOption(
  {
    children,
    value: valueProp,

    // Value text should be a human readable version of the value. It does not
    // need to be provided if the option's child is a text string.
    // Alternatively, the developer can use the `getValueText` function if the
    // valuetext depends on the actual value of the input.
    // If no children are passed to ListboxOption, value text will be displayed
    // as the option, but we also want value text as a reasonable default for
    // what is displayed in the ListboxButton when the option is selected.
    valueText,
    getValueText,

    onClick,
    ...props
  },
  forwardedRef
) {
  const {
    onSelect,
    data: { value: inputValue, navigationValue },
    transition,
    optionsRef
  } = useContext(ListboxContext);

  let value = valueProp;

  // Infer value from string child if omitted, otherwise error becaure what the
  // heck … we  need a value!
  if (!valueProp) {
    if (typeof children === "string") {
      value = children;
    } else {
      throw Error(
        "A `ListboxOption` with a non-string child must have a provided value prop."
      );
    }
  }

  // If valueText is omitted, first we check for getValueText. If that isn't
  // there then we try to infer it from a string child. If we can't, then we
  // just use the value.
  if (!valueText) {
    if (getValueText) {
      valueText = getValueText(value);
    } else if (typeof children === "string") {
      valueText = children;
    } else {
      valueText = value;
    }
  }

  useEffect(() => {
    // See @reach/combobox > `ComboboxOption` for more info on this effect
    if (!inputValue && !optionsRef.current.length) {
      transition(CHANGE, { value });
    }
    optionsRef.current.push({ value, valueText });
  });

  const isHighlighted = navigationValue === value;
  const isActive = inputValue === value;

  const handleClick = wrapEvent(onClick, () => {
    onSelect && onSelect(value);
    transition(SELECT_WITH_CLICK, { value });
  });

  return (
    <li
      {...props}
      data-reach-listbox-option=""
      ref={forwardedRef}
      id={value ? makeHash(value) : undefined}
      role="option"
      aria-selected={isActive}
      data-highlighted={isHighlighted ? "" : undefined}
      // without this the menu will close from `onBlur`, but with it the
      // element can be `document.activeElement` and then our focus checks in
      // onBlur will work as intended
      tabIndex={-1}
      onClick={handleClick}
    >
      <span data-reach-listbox-option-text="">
        {typeof children === "function"
          ? children({ value, valueText })
          : valueText}
      </span>
    </li>
  );
});

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
    // onChange, >> INPUT
    onClick,
    onFocus,
    onKeyDown,
    // value: controlledValue, >> INPUT
    ...props
  },
  forwardedRef
) {
  const {
    data: { value },
    transition,
    state,
    buttonRef,
    buttonId,
    listboxId,
    optionsRef,
    isExpanded
  } = useContext(ListboxContext);
  const ref = useForkedRef(buttonRef, forwardedRef);

  const handleKeyDown = useKeyDown();

  const handleClick = () => {
    if (state === IDLE) {
      transition(OPEN_LISTBOX);
    } else {
      transition(CLOSE_WITH_BUTTON);
    }
  };

  return (
    <Comp
      data-reach-listbox-button=""
      aria-controls={listboxId} // TODO: verify that this is needed
      aria-labelledby={`${buttonId} ${listboxId}`}
      aria-haspopup="listbox"
      aria-expanded={isExpanded}
      ref={ref}
      onClick={wrapEvent(onClick, handleClick)}
      onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
      {...props}
    >
      {value}
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

if (__DEV__) {
  Listbox.propTypes = {};
  Listbox.displayName = "Listbox";
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
        buttonRef.current.focus();
        break;
      case NAVIGATE:
      case OPEN_LISTBOX:
        setTimeout(() => listRef.current.focus(), 1); // TODO: Gross...
        // listRef.current.focus();
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastActionType]);
}

// We want the same events when the input or the popup have focus (HOW COOL ARE
// HOOKS BTW?) This is probably the hairiest piece but it's not bad.
function useKeyDown() {
  const {
    data,
    onSelect,
    optionsRef,
    state,
    transition,
    persistSelectionRef
  } = useContext(ListboxContext);

  const { navigationValue } = data;

  return function handleKeyDown(event) {
    const { current: options } = optionsRef;
    const hasOptions = Array.isArray(options) && !!options.length;
    const optionValues = hasOptions ? options.map(({ value }) => value) : [];
    const index =
      hasOptions && navigationValue
        ? optionValues.indexOf(navigationValue.value)
        : -1;

    switch (event.key) {
      case "Home": {
        // Don't scroll the page
        event.preventDefault();
        transition(NAVIGATE, { value: optionValues[0] });
        break;
      }
      case "End": {
        // Don't scroll the page
        event.preventDefault();
        transition(NAVIGATE, { value: optionValues[optionValues.length - 1] });
        break;
      }
      case "ArrowDown": {
        // Don't scroll the page
        event.preventDefault();

        if (!hasOptions) {
          return;
        }

        if (state === IDLE) {
          // Opening a closed list
          transition(NAVIGATE, {
            persistSelection: persistSelectionRef.current
          });
        } else {
          const atBottom = index === optionValues.length - 1;
          if (atBottom) {
            return;
          } else {
            // Go to the next item in the list
            const nextValue = optionValues[(index + 1) % optionValues.length];
            transition(NAVIGATE, { value: nextValue });
          }
        }
        break;
      }
      // A lot of duplicate code with ArrowDown up next, I'm already over it.
      case "ArrowUp": {
        // Don't scroll the page
        event.preventDefault();

        if (!hasOptions) {
          return;
        }

        if (state === IDLE) {
          transition(NAVIGATE);
        } else {
          if (index === 0) {
            return;
          } else if (index === -1) {
            // displaying the user's value, so go select the last one
            const value = optionValues.length
              ? optionValues[optionValues.length - 1]
              : null;
            transition(NAVIGATE, { value });
          } else {
            // normal case, select previous
            const nextValue =
              optionValues[
                (index - 1 + optionValues.length) % optionValues.length
              ];
            transition(NAVIGATE, { value: nextValue });
          }
        }
        break;
      }
      case "Escape": {
        if (state !== IDLE) {
          transition(ESCAPE);
        }
        break;
      }
      case "Enter": {
        if (state === NAVIGATING && navigationValue !== null) {
          // don't want to submit forms
          event.preventDefault();
          onSelect && onSelect(navigationValue);
          transition(SELECT_WITH_KEYBOARD);
        }
        break;
      }
    }
  };
}

function useBlur() {
  const { state, transition, popoverRef, inputRef, buttonRef } = useContext(
    ListboxContext
  );

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

  const transition = (action, payload = {}) => {
    const currentState = chart.states[state];
    const nextState = currentState.on[action];
    if (!nextState) {
      throw new Error(`Unknown action "${action}" for state "${state}"`);
    }
    dispatch({ type: action, state, nextState: state, ...payload });
    setState(nextState);
  };

  return [state, data, transition];
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
// Well alright, you made it all the way here to like 700 lines of code (geez,
// what the heck?). Have a great day :D
