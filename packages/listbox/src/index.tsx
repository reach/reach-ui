/**
 * Welcome to @reach/listbox!
 *
 * TODO: confirming` state
 * TODO: figure out touch events
 * TODO: SR tests
 * TODO: Deal with overlapping popver/button issues
 *
 * @see Docs     https://reacttraining.com/reach-ui/listbox
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/listbox
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.1/#Listbox
 */
import React, {
  forwardRef,
  Children,
  useEffect,
  useLayoutEffect,
  useRef,
  useContext,
  useReducer,
  useState
} from "react";
import PropTypes from "prop-types";
import {
  makeId,
  wrapEvent,
  useForkedRef,
  createNamedContext,
  cloneValidElement
} from "@reach/utils";
import { useId } from "@reach/auto-id";
import Popover, { positionMatchWidth } from "@reach/popover";
import warning from "warning";
import { forwardRefWithAs } from "../../utils/src/index";

////////////////////////////////////////////////////////////////////////////////
// States

// Resting/closed state.
const IDLE = "IDLE";

// The user is navigate the list with a pointer
const NAVIGATING = "NAVIGATING";

// The user is navigate the list with a keyboard
const NAVIGATING_WITH_KEYS = "NAVIGATING_WITH_KEYS";

// The user is interacting with arbitrary elements inside the popover
const INTERACTING = "INTERACTING";

////////////////////////////////////////////////////////////////////////////////
// Actions

// Change selection values, not necessarily a user-event
const CHANGE = "CHANGE";

// Type a search query
const SEARCHING = "SEARCHING";

// Navigate with a pointer of some kind
const NAVIGATE = "NAVIGATE";

// Click the ListboxButton
const BUTTON_CLICK = "BUTTON_CLICK";

// Interacts with elements in the popover but not in our list
const INTERACT = "INTERACT";

const MOUSE_ENTER = "MOUSE_ENTER";

const KEY_DOWN_ARROW_DOWN = "KEY_DOWN_ARROW_DOWN";

const KEY_DOWN_ARROW_UP = "KEY_DOWN_ARROW_UP";

const KEY_DOWN_HOME = "KEY_DOWN_HOME";

const KEY_DOWN_END = "KEY_DOWN_HOME";

const KEY_DOWN_TAB = "KEY_DOWN_TAB";

const KEY_DOWN_ENTER = "KEY_DOWN_ENTER";

const KEY_DOWN_SPACE = "KEY_DOWN_SPACE";

const MOUSE_DOWN = "MOUSE_DOWN";

const MOUSE_LEAVE = "MOUSE_LEAVE";

const MOUSE_SELECT = "MOUSE_SELECT";

const ESCAPE = "ESCAPE";

const BLUR = "BLUR";

////////////////////////////////////////////////////////////////////////////////
// State chart

const openEvents: { [key in MachineEventType]?: State } = {
  [BLUR]: IDLE,
  [ESCAPE]: IDLE,
  [NAVIGATE]: NAVIGATING,
  [MOUSE_ENTER]: NAVIGATING,
  [MOUSE_LEAVE]: NAVIGATING,
  [MOUSE_SELECT]: IDLE,
  [BUTTON_CLICK]: IDLE,
  [INTERACT]: INTERACTING
};

const navigatingEvents: { [key in MachineEventType]?: State } = {
  [SEARCHING]: NAVIGATING_WITH_KEYS,
  [KEY_DOWN_SPACE]: IDLE,
  [KEY_DOWN_ENTER]: IDLE,
  [KEY_DOWN_ARROW_DOWN]: NAVIGATING_WITH_KEYS,
  [KEY_DOWN_ARROW_UP]: NAVIGATING_WITH_KEYS,
  [KEY_DOWN_HOME]: NAVIGATING_WITH_KEYS,
  [KEY_DOWN_END]: NAVIGATING_WITH_KEYS,
  [KEY_DOWN_TAB]: NAVIGATING_WITH_KEYS,
  [MOUSE_DOWN]: NAVIGATING,
  [MOUSE_LEAVE]: NAVIGATING
};

const stateChart: StateChart = {
  initial: IDLE,
  states: {
    [IDLE]: {
      on: {
        [CHANGE]: IDLE,
        [BLUR]: IDLE,
        [SEARCHING]: IDLE,
        [BUTTON_CLICK]: NAVIGATING,
        [KEY_DOWN_SPACE]: NAVIGATING,
        [KEY_DOWN_ARROW_DOWN]: NAVIGATING,
        [KEY_DOWN_ARROW_UP]: NAVIGATING,
        [KEY_DOWN_HOME]: NAVIGATING,
        [KEY_DOWN_END]: NAVIGATING
      }
    },
    [NAVIGATING]: {
      on: {
        ...openEvents,
        ...navigatingEvents,
        [CHANGE]: NAVIGATING
      }
    },
    [NAVIGATING_WITH_KEYS]: {
      on: {
        ...openEvents,
        ...navigatingEvents,
        [CHANGE]: NAVIGATING_WITH_KEYS
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

const expandedStates = [NAVIGATING, NAVIGATING_WITH_KEYS, INTERACTING];
const isExpanded = (state: State) => expandedStates.includes(state);

////////////////////////////////////////////////////////////////////////////////
// ListboxContext

const ListboxContext = createNamedContext(
  "ListboxContext",
  {} as IListboxContext
);
const ListboxGroupContext = createNamedContext(
  "ListboxGroupContext",
  {} as IListboxGroupContext
);
const useListboxContext = () => useContext(ListboxContext);
const useListboxGroupContext = () => useContext(ListboxGroupContext);

////////////////////////////////////////////////////////////////////////////////
// ListboxGroup

type ListboxGroupProps = { label: string | React.ReactNode };

export const ListboxGroup = forwardRef<HTMLDivElement, ListboxGroupProps>(
  function ListboxGroup({ children, label, ...props }, forwardedRef) {
    const { listboxId } = useListboxContext();
    const labelId = makeId(
      "label",
      useId(typeof label === "string" ? kebabCase(label) : null),
      listboxId
    );

    return (
      <ListboxGroupContext.Provider value={{ label, labelId }}>
        <div
          {...props}
          ref={forwardedRef}
          data-reach-listbox-group=""
          aria-labelledby={labelId}
          role="group"
        >
          {typeof label === "string" ? (
            <span
              id={labelId}
              role="presentation"
              data-reach-listbox-group-label=""
            >
              {label}
            </span>
          ) : label ? (
            cloneValidElement(label, {
              id: labelId,
              "data-reach-listbox-group-label": "",
              role: "presentation"
            })
          ) : null}
          {children}
        </div>
      </ListboxGroupContext.Provider>
    );
  }
);

ListboxGroup.displayName = "ListboxGroup";
if (__DEV__) {
  ListboxGroup.propTypes = {
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
  };
}

////////////////////////////////////////////////////////////////////////////////
// ListboxGroupLabel

export const ListboxGroupLabel = forwardRef<HTMLSpanElement, {}>(
  function ListboxGroupLabel({ children, ...props }, forwardedRef) {
    const { label, labelId } = useListboxGroupContext();

    if (__DEV__) {
      warning(
        !label,
        "A ListboxGroup can only have one label. A label prop in `ListboxGroup` was detected along with a `ListboxGroupLabel` component. Remove the label prop or the `ListboxGroupLabel` component to avoid accessibility problems."
      );
    }

    return (
      <span
        {...props}
        ref={forwardedRef}
        data-reach-listbox-group-label=""
        id={labelId}
        role="presentation"
      >
        {children}
      </span>
    );
  }
);

ListboxGroupLabel.displayName = "ListboxGroupLabel";
if (__DEV__) {
  ListboxGroupLabel.propTypes = {};
}

////////////////////////////////////////////////////////////////////////////////
// ListboxInput

type ListboxInputProps = {
  name?: string;
  value: ListboxValue;
  onChange(newValue: ListboxValue): void;
};

export const ListboxInput = forwardRefWithAs<"div", ListboxInputProps>(
  function ListboxInput(
    { as: Comp = "div", children, name, onChange, value, ...props },
    forwardedRef
  ) {
    const initialData: Partial<StateData> = {
      onChange,
      /*
       * The value the user has selected.
       */
      selection: value,
      /*
       * The value the user has navigated to when the list is expanded.
       */
      navigationSelection: null
    };

    const [
      state,
      data,
      transition,
      { buttonRef, inputRef, listRef, mouseMovedRef, optionsRef, popoverRef }
    ] = useReducerMachine(stateChart, reducer, initialData);

    const _id = useId(props.id);
    const id = props.id || makeId("listbox-input", _id);

    const listboxId = makeId("listbox", id);

    const buttonId = makeId("button", id);

    const ref = useForkedRef(inputRef, forwardedRef);

    // Parses our children to find the selected option.
    // See docblock on the function for more deets.
    const selectedNode = recursivelyFindChildByValue(children, value);

    const context: IListboxContext = {
      buttonId,
      buttonRef,
      data,
      inputRef,
      instanceId: id,
      isExpanded: isExpanded(state),
      listboxId,
      listRef,
      mouseMovedRef,
      optionsRef,
      popoverRef,
      selectedNode,
      state,
      transition
    };

    return (
      <ListboxContext.Provider value={context}>
        <Comp
          ref={ref}
          {...props}
          data-reach-listbox=""
          data-expanded={context.isExpanded}
          data-value={value}
        >
          {children}
        </Comp>
        {name && <input type="hidden" name={name} value={value} />}
      </ListboxContext.Provider>
    );
  }
);

ListboxInput.displayName = "ListboxInput";
if (__DEV__) {
  ListboxInput.propTypes = {};
}

////////////////////////////////////////////////////////////////////////////////
// ListboxPopover

type ListboxPopoverProps = {
  portal?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const ListboxPopover = forwardRef<any, ListboxPopoverProps>(
  function ListboxPopover(
    { portal = true, onKeyDown, onBlur, ...props },
    forwardedRef
  ) {
    const { popoverRef, buttonRef, isExpanded } = useListboxContext();
    const ref = useForkedRef(popoverRef, forwardedRef);
    const handleKeyDown = useKeyDown();
    const handleBlur = useBlur();
    const hidden = !isExpanded;

    const commonProps = {
      ...props,
      ref,
      "data-reach-listbox-popover": "",
      hidden,
      onBlur: wrapEvent(onBlur, handleBlur),
      onKeyDown: wrapEvent(onKeyDown, handleKeyDown),
      tabIndex: -1
    };

    return portal ? (
      <Popover
        {...commonProps}
        targetRef={buttonRef as any}
        position={positionMatchWidth}
      />
    ) : (
      <div {...commonProps} />
    );
  }
);

ListboxPopover.displayName = "ListboxPopover";
if (__DEV__) {
  ListboxPopover.propTypes = {};
}

////////////////////////////////////////////////////////////////////////////////
// ListboxList

type ListboxListProps = {};

export const ListboxList = forwardRefWithAs<"div", ListboxListProps>(
  function ListboxList({ as: Comp = "div", children, ...props }, forwardedRef) {
    const {
      data: { selection: value },
      listboxId,
      listRef,
      optionsRef
    } = useListboxContext();

    const ref = useForkedRef(listRef, forwardedRef);

    useLayoutEffect(() => {
      optionsRef.current = [];
      return () => {
        optionsRef.current = [];
      };
    });

    return (
      <Comp
        {...props}
        ref={ref}
        data-reach-listbox-list=""
        aria-activedescendant={useOptionId(value)}
        id={listboxId}
        role="listbox"
        tabIndex={-1}
      >
        {children}
      </Comp>
    );
  }
);

ListboxList.displayName = "ListboxList";
if (__DEV__) {
  ListboxList.propTypes = {};
}

////////////////////////////////////////////////////////////////////////////////
// ListboxOption

type ListboxOptionProps = {
  value: ListboxValue;
  valueText?: string;
};

export const ListboxOption = forwardRefWithAs<"div", ListboxOptionProps>(
  function ListboxOption(
    {
      as: Comp = "div",
      children,
      onClick,
      onMouseDown,
      onMouseEnter,
      onMouseLeave,
      onMouseMove,
      onMouseUp,
      value,
      valueText: valueTextProp,
      ...props
    },
    forwardedRef
  ) {
    if (!value) {
      throw Error(`A ListboxOption must have a value prop.`);
    }

    const {
      data: { selection: inputValue, navigationSelection },
      mouseMovedRef,
      optionsRef,
      state,
      transition
    } = useListboxContext();

    const ownRef = useRef<HTMLElement | null>(null);
    const ref = useForkedRef(ownRef, forwardedRef);

    let valueText = value;
    if (valueTextProp) {
      valueText = valueTextProp;
    } else if (typeof children === "string") {
      valueText = children;
    } else if (ownRef.current && ownRef.current.innerText) {
      valueText = ownRef.current.innerText;
    }

    const isHighlighted = navigationSelection
      ? navigationSelection === value
      : false;
    const isActive = inputValue === value;

    function handleMouseEnter() {
      transition(MOUSE_ENTER, { navigationSelection: value });
    }

    function handleMouseLeave() {
      transition(MOUSE_LEAVE);
    }

    function handleMouseDown(event: React.MouseEvent) {
      event.persist();
      transition(MOUSE_DOWN, { reactEvent: event });
    }

    function handleMouseMove() {
      mouseMovedRef.current = true;

      /*
       * We don't really *need* this guard if we put this in the state machine,
       * but in this case it seems wise not to needlessly run our transitions
       * every time the user's mouse moves. Seems like a lot.
       */
      if (state === NAVIGATING_WITH_KEYS) {
        transition(NAVIGATE, { navigationSelection: value });
      }
    }

    function handleMouseUp(event: React.MouseEvent) {
      event.persist();
      transition(MOUSE_SELECT, {
        selection: value,
        reactEvent: event
      });
    }

    useEffect(() => {
      optionsRef.current.push({ value, valueText });
    });

    return (
      <Comp
        {...props}
        data-reach-listbox-option=""
        ref={ref}
        id={useOptionId(value)}
        role="option"
        aria-selected={isActive}
        data-value={value}
        data-valuetext={valueText}
        data-highlighted={isHighlighted ? "" : undefined}
        onMouseDown={wrapEvent(onMouseDown, handleMouseDown)}
        onMouseUp={wrapEvent(onMouseUp, handleMouseUp)}
        onMouseEnter={wrapEvent(onMouseEnter, handleMouseEnter)}
        onMouseLeave={wrapEvent(onMouseLeave, handleMouseLeave)}
        onMouseMove={wrapEvent(onMouseMove, handleMouseMove)}
        tabIndex={-1}
      >
        <span data-reach-listbox-option-text="">
          {typeof children === "function"
            ? children({ value, valueText })
            : children || valueText}
        </span>
      </Comp>
    );
  }
);

ListboxOption.displayName = "ListboxOption";
if (__DEV__) {
  ListboxOption.propTypes = {
    valueText: PropTypes.string
  };
}

////////////////////////////////////////////////////////////////////////////////
// ListboxButton

type ListboxButtonProps = {
  arrow?: string | React.ReactNode;
};

export const ListboxButton = forwardRefWithAs<"button", ListboxButtonProps>(
  function ListboxButton(
    {
      as: Comp = "button",
      children,
      onMouseDown,
      // onTouchStart,
      onKeyDown,
      arrow,
      ...props
    },
    forwardedRef
  ) {
    const {
      transition,
      buttonRef,
      buttonId,
      listboxId,
      selectedNode,
      isExpanded
    } = useListboxContext();

    const ref = useForkedRef(buttonRef, forwardedRef);

    const handleKeyDown = useKeyDown();

    function handleMouseDown(event: React.MouseEvent) {
      event.persist();
      transition(BUTTON_CLICK, { reactEvent: event });
    }

    let inner = null;
    if (children) {
      inner = children;
    } else if (selectedNode) {
      if (selectedNode.props && selectedNode.props.children) {
        inner = selectedNode.props.children;
      } else if (selectedNode.props && selectedNode.props.valueText) {
        inner = selectedNode.props.valueText;
      } else if (selectedNode.props && selectedNode.props.value) {
        inner = selectedNode.props.value;
      }
    }

    return (
      <Comp
        {...props}
        ref={ref}
        data-reach-listbox-button=""
        aria-controls={listboxId} // TODO: verify that this is needed
        aria-expanded={isExpanded}
        aria-haspopup="listbox"
        aria-labelledby={`${buttonId} ${listboxId}`}
        onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
        onMouseDown={wrapEvent(onMouseDown, handleMouseDown)}
      >
        <span data-reach-listbox-button-inner="">{inner}</span>
        {arrow && (
          <span data-reach-listbox-button-arrow="" aria-hidden>
            {arrow}
          </span>
        )}
      </Comp>
    );
  }
);

ListboxButton.displayName = "ListboxButton";
if (__DEV__) {
  ListboxButton.propTypes = {
    arrow: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////
// Listbox

type ListboxProps = ListboxInputProps & {
  arrow?: string | React.ReactNode;
};

export const Listbox = forwardRefWithAs<"div", ListboxProps>(function Listbox(
  { arrow = "▼", children, ...props },
  forwardedRef
) {
  return (
    <ListboxInput ref={forwardedRef} data-listbox="" {...props}>
      <ListboxButton arrow={arrow} />
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
function findOptionValueFromSearch(opts: any[], string = "") {
  if (!string) return;
  const found = opts.find(
    ({ valueText }) => valueText && valueText.toLowerCase().startsWith(string)
  );
  return found ? found.value : null;
}

/**
 * Parses through all children at the top level to find our active child node
 * based on the given value. We can then stick this node in context without
 * needing to re-render anything. This needs to be recursive because
 * ListboxOption is always nested inside a ListboxList, which is nested inside
 * a ListboxPopover.
 *
 * This works ONLY if no children other than ListboxOption elements have a
 * `value` prop that happens to equal the value of the Listbox (that seems super
 * unlikely and confusing TBH). It will also break if they wrap the option's
 * child node in an abstracted component. If a developer needs either they will
 * need to use the lower level API and explicitly render the ListboxButton.
 *
 * This limits composition, but the tradeoff
 *
 * TODO: Getting rid of this ... hang tight...
 */
function recursivelyFindChildByValue(children: any, value: any) {
  const childrenArray = Children.toArray(children);
  for (let i = 0; i <= childrenArray.length; i++) {
    let child = childrenArray[i];

    // Optional chaining lol
    if (child && child.props) {
      if (child.props.value && child.props.value === value) {
        return child;
      }
      if (child.props.children) {
        let grandChild: any = recursivelyFindChildByValue(
          child.props.children,
          value
        );
        if (grandChild) {
          return grandChild;
        }
      }
    }
  }
  return false;
}

const reducer: Reducer = (data, event) => {
  const { state } = data;
  const {
    buttonRef,
    listRef,
    optionsRef: { current: options },
    mouseMovedRef,
    userInteractedRef
  } = event.refs;

  const { onChange } = data;
  const nextStateData: StateData = { ...data, lastEventType: event.type };
  const hasOptions = Array.isArray(options) && !!options.length;
  const optionValues = options.map(({ value }) => value);

  const index =
    hasOptions && data.navigationSelection
      ? optionValues.indexOf(data.navigationSelection)
      : -1;
  const atBottom = index === optionValues.length - 1;
  const atTop = index === 0;
  const isNavigating =
    (state === NAVIGATING || state === NAVIGATING_WITH_KEYS) &&
    data.navigationSelection !== null;

  function select(selection: ListboxValue) {
    requestAnimationFrame(() => {
      if (buttonRef.current && userInteractedRef.current) {
        userInteractedRef.current = false;
        buttonRef.current.focus();
      }
    });
    onChange && onChange(selection);
    mouseMovedRef.current = false;
  }

  function open() {
    requestAnimationFrame(() => {
      if (listRef.current && userInteractedRef.current) {
        userInteractedRef.current = false;
        listRef.current.focus();
      }
    });
  }

  switch (event.type) {
    case CHANGE:
      select(event.selection);
      return {
        ...nextStateData,
        selection: event.selection
      };
    case SEARCHING:
      const searchValue = event.query
        ? findOptionValueFromSearch(options, event.query)
        : null;
      if (searchValue) {
        /*
         * When navigating with a keyboard, if the listbox is expanded the
         * navigationSelection changes. If the listbox is idle, we change the
         * actual selection value.
         */
        if (state === IDLE) {
          select(searchValue);
          return {
            ...nextStateData,
            selection: searchValue
          };
        }
        return {
          ...nextStateData,
          navigationSelection: searchValue
        };
      }
      return nextStateData;
    case MOUSE_ENTER:
      /*
       * If the user hasn't moved their mouse but mouse enter event still fires
       * (this happens if the popup opens due to a keyboard event), we don't
       * want to change the navigationSelect value
       */
      return mouseMovedRef.current
        ? {
            ...nextStateData,
            navigationSelection: event.navigationSelection
          }
        : nextStateData;
    case NAVIGATE:
      return {
        ...nextStateData,
        navigationSelection: event.navigationSelection
      };
    case KEY_DOWN_ARROW_DOWN:
      userInteractedRef.current = true;
      if (state === IDLE) {
        open();
      }

      return {
        ...nextStateData,
        navigationSelection:
          state === IDLE
            ? nextStateData.selection
            : atBottom
            ? nextStateData.navigationSelection
            : optionValues[(index + 1) % optionValues.length]
      };
    case KEY_DOWN_ARROW_UP:
      userInteractedRef.current = true;
      if (state === IDLE) {
        open();
      }

      return {
        ...nextStateData,
        navigationSelection:
          state === IDLE
            ? nextStateData.selection
            : atTop
            ? nextStateData.navigationSelection
            : optionValues[
                (index - 1 + optionValues.length) % optionValues.length
              ]
      };
    case KEY_DOWN_HOME:
      userInteractedRef.current = true;
      if (state === IDLE) {
        open();
      }

      return {
        ...nextStateData,
        navigationSelection:
          state === IDLE ? nextStateData.selection : optionValues[0]
      };
    case KEY_DOWN_END:
      userInteractedRef.current = true;
      if (state === IDLE) {
        open();
      }

      return {
        ...nextStateData,
        navigationSelection:
          state === IDLE
            ? nextStateData.selection
            : optionValues[optionValues.length - 1]
      };
    case KEY_DOWN_ENTER:
      userInteractedRef.current = true;
      if (state === IDLE) {
        return nextStateData;
      } else if (isNavigating) {
        event.reactEvent.preventDefault();
        data.navigationSelection && select(data.navigationSelection);
        return {
          ...nextStateData,
          selection: data.navigationSelection,
          navigationSelection: null
        };
      }
      return nextStateData;
    case KEY_DOWN_SPACE:
      userInteractedRef.current = true;
      if (state === IDLE) {
        open();
        return {
          ...nextStateData,
          navigationSelection: nextStateData.selection
        };
      } else if (isNavigating) {
        data.navigationSelection && select(data.navigationSelection);
        return {
          ...nextStateData,
          selection: data.navigationSelection,
          navigationSelection: null
        };
      }
      return nextStateData;
    case MOUSE_DOWN:
      userInteractedRef.current = true;
      if (event.reactEvent) {
        // TODO: Prevent right click, maybe?
        if (event.reactEvent.nativeEvent.which === 3) {
          // return;
        }

        // Prevent item from stealing focus
        event.reactEvent.preventDefault();
      }

      // We don't change state until MOUSE_UP
      return nextStateData;

    case MOUSE_LEAVE:
      return {
        ...nextStateData,
        navigationSelection: null
      };
    case BUTTON_CLICK:
      userInteractedRef.current = true;
      // Ignore right clicks
      if (
        event.reactEvent &&
        event.reactEvent.nativeEvent &&
        event.reactEvent.nativeEvent.which === 3
      ) {
        return nextStateData;
      }

      if (state === IDLE) {
        open();
      }

      return {
        ...nextStateData,
        navigationSelection: state === IDLE ? nextStateData.selection : null
      };
    case BLUR:
    case ESCAPE:
      userInteractedRef.current = true;
      return {
        ...nextStateData,
        navigationSelection: null
      };
    case MOUSE_SELECT:
      userInteractedRef.current = true;
      mouseMovedRef.current = false;

      // TODO: Ignore right clicks maybe?
      if (
        event.reactEvent &&
        event.reactEvent.nativeEvent &&
        event.reactEvent.nativeEvent.which === 3
      ) {
        // return;
      }

      select(event.selection);
      return {
        ...nextStateData,
        selection: event.selection,
        navigationSelection: null
      };
    case INTERACT:
      return nextStateData;

    default:
      if (__DEV__) {
        console.warn(
          `An invalid event of type ${event.type} was sent to the transition function in Listbox.`
        );
      }
      return nextStateData;
  }
};

function useBlur() {
  const { state, transition, popoverRef, inputRef, buttonRef } = useContext(
    ListboxContext
  );

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

  return function handleBlur(event: React.FocusEvent) {
    requestAnimationFrame(() => {
      // We on want to close only if focus rests outside the listbox
      if (
        document.activeElement !== inputRef.current &&
        document.activeElement !== buttonRef.current &&
        popoverRef.current
      ) {
        if (popoverRef.current.contains(document.activeElement)) {
          // focus landed inside the listbox; keep it open
          if (state !== INTERACTING) {
            transition(INTERACT);
          }
        } else {
          // focus landed outside the listbox; close it
          transition(BLUR);
        }
      }
    });
  };
}

function useKeyDown() {
  const { transition } = useListboxContext();

  const [query, setQuery] = useState("");

  useEffect(() => {
    transition(SEARCHING, { query });
    let timeout = window.setTimeout(() => query && setQuery(""), 1000);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return function handleKeyDown(event: React.KeyboardEvent) {
    event.persist();

    switch (event.key) {
      case "Home":
        event.preventDefault();
        transition(KEY_DOWN_HOME);
        break;

      case "End":
        event.preventDefault();
        transition(KEY_DOWN_END);
        break;

      case "ArrowDown":
        event.preventDefault();
        transition(KEY_DOWN_ARROW_DOWN);
        break;

      case "ArrowUp":
        event.preventDefault();
        transition(KEY_DOWN_ARROW_UP);
        break;

      case "Escape":
        transition(ESCAPE);
        break;

      case " ":
        transition(KEY_DOWN_SPACE);
        break;
      case "Enter":
        transition(KEY_DOWN_ENTER, { reactEvent: event });
        break;

      default:
        /*
         * Check if a user is typing some char keys and respond by setting the
         * query state.
         */
        if (typeof event.key === "string" && event.key.length === 1) {
          /*
           * Instead of firing a transition here, we'll do it in an effect so we
           * can set/clear a timeout that resets the user query after some time
           * has passed.
           */
          setQuery(query + event.key.toLowerCase());
        }
        break;
    }
  };
}

function useOptionId(value: ListboxValue) {
  const { instanceId } = useListboxContext();
  return makeId(`option-${value}`, instanceId);
}

/**
 * This manages transitions between states with a built in reducer to manage the
 * data that goes with those transitions.
 */
function useReducerMachine(
  chart: StateChart,
  reducer: Reducer,
  initialData: Partial<StateData>
): [State, StateData, Transition, MachineRefs] {
  const [state, setState] = useState(chart.initial);
  const [data, dispatch] = useReducer(reducer, {
    ...initialData,
    state: chart.initial
  } as StateData);

  /*
   * We will track when a mouse has moved in a ref, then reset it to false each
   * time a menu closes. This is useful because we want the selected value of
   * the listbox to be highlighted when the user opens it, but if the pointer
   * is resting above an option it will steal the highlight.
   * This will be a lot cleaner when we get the state machine cleaned up and
   * replaced with xstate!
   */
  const mouseMovedRef = useRef(false);

  const popoverRef: PopoverRef = useRef(null);

  const buttonRef: ButtonRef = useRef(null);

  const inputRef: InputRef = useRef(null);

  const listRef: ListRef = useRef(null);

  const userInteractedRef = useRef(false);

  /*
   * Options ref will be used to store all of the listbox's options as they are
   * rendered. We initialize options as an empty array to avoid type errors.
   */
  const optionsRef = useRef<any[]>([]);

  const refs: MachineRefs = {
    buttonRef,
    inputRef,
    listRef,
    mouseMovedRef,
    optionsRef,
    popoverRef,
    userInteractedRef
  };

  const transition: Transition = (event, payload = {}) => {
    const currentState = chart.states[state];
    const nextState = currentState && currentState.on[event];
    if (!nextState) {
      return;
    }
    dispatch({ type: event, state, nextState: state, refs, ...payload });
    setState(nextState);
  };

  return [state, data, transition, refs];
}

function kebabCase(str: string) {
  let match = str.match(
    /[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g
  );
  if (match) {
    return match
      .filter(Boolean)
      .join("-")
      .toLowerCase();
  }
  return str;
}

////////////////////////////////////////////////////////////////////////////////
// Types

interface IListboxGroupContext {
  label: string | React.ReactNode;
  labelId: string;
}

interface IListboxContext {
  buttonId: string;
  buttonRef: ButtonRef;
  data: StateData;
  inputRef: InputRef;
  instanceId: string;
  isExpanded: boolean;
  listboxId: string;
  listRef: ListRef;
  mouseMovedRef: React.MutableRefObject<boolean>;
  optionsRef: React.MutableRefObject<any[]>;
  popoverRef: PopoverRef;
  selectedNode: any; // TODO:
  state: State;
  transition: Transition;
}

type Transition = (event: MachineEventType, payload?: any) => void;

type ListboxValue = string | number;

type State = "IDLE" | "NAVIGATING" | "NAVIGATING_WITH_KEYS" | "INTERACTING";

type MachineEventType =
  | "CHANGE"
  | "SEARCHING"
  | "NAVIGATE"
  | "BUTTON_CLICK"
  | "INTERACT"
  | "MOUSE_ENTER"
  | "KEY_DOWN_ARROW_DOWN"
  | "KEY_DOWN_ARROW_UP"
  | "KEY_DOWN_HOME"
  | "KEY_DOWN_END"
  | "KEY_DOWN_TAB"
  | "KEY_DOWN_ENTER"
  | "KEY_DOWN_SPACE"
  | "MOUSE_DOWN"
  | "MOUSE_LEAVE"
  | "MOUSE_SELECT"
  | "ESCAPE"
  | "BLUR";

interface StateChart {
  initial: State;
  states: {
    [key in State]?: {
      on: {
        [key in MachineEventType]?: State;
      };
    };
  };
}

type StateData = {
  onChange(newValue: ListboxValue): void;
  selection: ListboxValue;
  navigationSelection: ListboxValue | null;
  state: State;
  refs?: MachineRefs;
  lastEventType?: MachineEventType;
};

type MachineEvent =
  | { type: "CHANGE"; selection: ListboxValue }
  | { type: "SEARCHING"; query: string | null }
  | { type: "NAVIGATE"; navigationSelection: ListboxValue | null }
  | { type: "BUTTON_CLICK"; reactEvent: React.MouseEvent }
  | { type: "INTERACT" }
  | { type: "MOUSE_ENTER"; navigationSelection: ListboxValue | null }
  | { type: "KEY_DOWN_ARROW_DOWN" }
  | { type: "KEY_DOWN_ARROW_UP" }
  | { type: "KEY_DOWN_HOME" }
  | { type: "KEY_DOWN_END" }
  | { type: "KEY_DOWN_TAB" }
  | { type: "KEY_DOWN_ENTER"; reactEvent: React.KeyboardEvent }
  | { type: "KEY_DOWN_SPACE" }
  | { type: "MOUSE_DOWN"; reactEvent: React.MouseEvent }
  | { type: "MOUSE_LEAVE" }
  | {
      type: "MOUSE_SELECT";
      reactEvent: React.MouseEvent;
      selection: ListboxValue;
    }
  | { type: "ESCAPE" }
  | { type: "BLUR" };

interface MachineRefs {
  buttonRef: ButtonRef;
  listRef: ListRef;
  inputRef: InputRef;
  optionsRef: React.MutableRefObject<any[]>;
  popoverRef: PopoverRef;
  mouseMovedRef: React.MutableRefObject<boolean>;
  userInteractedRef: React.MutableRefObject<boolean>;
}

type Reducer = (
  data: StateData,
  event: MachineEvent & { refs: MachineRefs; nextState: State }
) => StateData;

type ButtonRef = React.RefObject<HTMLElement | null>;
type InputRef = React.RefObject<HTMLElement | null>;
type PopoverRef = React.RefObject<HTMLElement | null>;
type ListRef = React.RefObject<HTMLElement | null>;
