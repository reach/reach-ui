/**
 * Welcome to @reach/listbox!
 *
 * A few notes:
 *
 * Listbox has turned out to be a real test for us in many ways. Primarily, it
 * challenges our desire for maximum composability, a key goal for all of the
 * Reach UI components. A listbox select component essentially consists of:
 *
 *  - A button the user clicks when a listbox is closed
 *  - A list of options in a popover that is displayed after a user clicks
 *
 * This sounds a lot like MenuButton from a UI perspective, but two key
 * differences:
 *
 *  - ListboxOption holds a value, whereas a MenuItem does not
 *  - The ListboxButton rendered result depends on the currently selected
 *    ListboxOption
 *
 * This last point is the kicker! In order for the ListboxButton to know what's
 * going on the the ListboxList, we need to update state in context and store it
 * at the top of the tree. This means we can't show the ListboxButton's inner
 * content on the first render, which means we can't render ListboxButton on
 * the server ... UNLESS the component state is controlled in the app.
 *
 * So in most Reach components, we offer the user the ability to choose between
 * uncontrolled or controlled state. For an uncontrolled component, all you'd
 * have to do is compose the parts and everything just works. AWESOME.
 *
 * We still offer that choice for Listbox, but the concession here is that if
 * you are server rendering your component you may get a server/client mismatch.
 * For this reason, if you are server rendering we always recommend using
 * controlled state for your listbox and explicitly tell the button what to
 * render at the top of the tree.
 *
 * @see Docs     https://reacttraining.com/reach-ui/listbox
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/listbox
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.1/#Listbox
 */

import React, {
  forwardRef,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { useId } from "@reach/auto-id";
import Popover, { positionMatchWidth } from "@reach/popover";
import {
  createDescendantContext,
  Descendant,
  DescendantProvider,
  useDescendant,
  useDescendants,
} from "@reach/descendants";
import {
  AssignableRef,
  checkStyles,
  cloneValidElement,
  createNamedContext,
  DistributiveOmit,
  forwardRefWithAs,
  makeId,
  useConstant,
  useForkedRef,
  useIsomorphicLayoutEffect as useLayoutEffect,
  wrapEvent,
} from "@reach/utils";
import {
  assign,
  createMachine,
  EventObject as MachineEvent,
  interpret,
  StateMachine,
} from "@xstate/fsm";
import warning from "warning";

////////////////////////////////////////////////////////////////////////////////
// States

enum ListboxStates {
  // Resting/closed state.
  Idle = "IDLE",

  // The user is navigate the list with a pointer
  Navigating = "NAVIGATING",

  // The user is navigate the list with a keyboard
  NavigatingWithKeys = "NAVIGATING_WITH_KEYS",

  // The user is searching for an option with the keyboard
  Searching = "SEARCHING",

  // The user is interacting with arbitrary elements inside the popover
  Interacting = "INTERACTING",
}

////////////////////////////////////////////////////////////////////////////////
// Events

enum ListboxEvents {
  ClearSelectionIndex = "CLEAR_SELECTION_INDEX",
  ClosePopover = "CLOSE_POPOVER",
  Navigate = "NAVIGATE",
  OpenPopover = "OPEN_POPOVER",
  SearchForOption = "SEARCH_FOR_OPTION",
  SelectOption = "SELECT_OPTION",
}

/**
 * DOM nodes for all of the refs used in the listbox state machine.
 */
export type ListboxNodeRefs = {
  button: HTMLButtonElement | null;
  input: HTMLDivElement | null;
  list: HTMLUListElement | null;
  popover: HTMLDivElement | null;
};

/**
 * Shared partial interface for all of our event objects.
 */
interface ListboxEventBase extends MachineEventWithRefs {
  refs: ListboxNodeRefs;
}

/**
 * Event object for the checkbox state machine.
 */
export type ListboxEvent = ListboxEventBase &
  (
    | {
        type: ListboxEvents.ClearSelectionIndex;
      }
    | {
        type: ListboxEvents.Navigate;
        value: ListboxValue;
      }
    | {
        type: ListboxEvents.SelectOption;
        value: ListboxValue;
      }
    | {
        type: ListboxEvents.ClosePopover;
      }
    | {
        type: ListboxEvents.OpenPopover;
      }
    | {
        type: ListboxEvents.SearchForOption;
        query: string;
      }
  );

/**
 * State object for the checkbox state machine.
 */
export type ListboxState = {
  value: ListboxStates;
  context: ListboxStateData;
};

////////////////////////////////////////////////////////////////////////////////

/**
 * Initializer for our state machine.
 *
 * @param initial
 * @param props
 */
export const createListboxMachine = (props: { value: ListboxValue }) =>
  createMachine<ListboxStateData, ListboxEvent, ListboxState>({
    id: "mixed-checkbox",
    initial: ListboxStates.Idle,
    context: {
      navigationValue: null,
      value: props.value,
      refs: {
        input: null,
        list: null,
        button: null,
        popover: null,
      },
    },
    states: {},
  });

////////////////////////////////////////////////////////////////////////////////
// ListboxContext

const ListboxDescendantContext = createDescendantContext<
  HTMLElement,
  DescendantProps
>("ListboxDescendantContext");
const ListboxContext = createNamedContext(
  "ListboxContext",
  {} as IListboxContext
);
const ListboxGroupContext = createNamedContext(
  "ListboxGroupContext",
  {} as IListboxGroupContext
);
const useDescendantContext = () => useContext(ListboxDescendantContext);
const useListboxContext = () => useContext(ListboxContext);
const useListboxGroupContext = () => useContext(ListboxGroupContext);

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxInput
 *
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxinput
 */
export const ListboxInput = forwardRef<
  HTMLDivElement,
  ListboxInputProps & { _componentName?: string }
>(function ListboxInput(
  {
    autoComplete,
    autoFocus,
    children,
    form,
    name,
    required,
    value: valueProp,
    _componentName = "ListboxInput",
    ...props
  },
  forwardedRef
) {
  let [descendants, setDescendants] = useDescendants<
    HTMLElement,
    DescendantProps
  >();

  let defaultStateData = {
    value: valueProp ?? "",
  };

  /*
   * We will track when a mouse has moved in a ref, then reset it to false each
   * time a popover closes. This is useful because we want the selected value of
   * the listbox to be highlighted when the user opens it, but if the pointer
   * is resting above an option it will steal the highlight.
   */
  let mouseMovedRef = useRef(false);
  let autocompletePropRef = useRef<typeof autoComplete>(autoComplete);

  let inputRef: ListobxInputRef = useRef(null);
  let buttonRef: ListobxButtonRef = useRef(null);
  let popoverRef: ListobxPopoverRef = useRef(null);
  let listRef: ListobxListRef = useRef(null);

  useLayoutEffect(() => {
    autocompletePropRef.current = autoComplete;
  }, [autoComplete, autocompletePropRef]);

  useEffect(() => {
    if (autoFocus) {
      window.requestAnimationFrame(() => {
        buttonRef.current && buttonRef.current.focus();
      });
    }
    // autoFocus should only do anything on the first render, so we don't care
    // if the prop value changes here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let [current, send] = useMachine(createListboxMachine(defaultStateData), {
    input: inputRef,
    button: buttonRef,
    popover: popoverRef,
    list: listRef,
  });

  const _id = useId(props.id);
  const id = props.id || makeId("listbox-input", _id);
  const listboxId = makeId("listbox", id);
  const buttonId = makeId("button", id);
  const ref = useForkedRef(inputRef, forwardedRef);

  let context = {
    send,
    state: current,
    listboxId,
    buttonId,
    inputRef,
    instanceId: id,
    mouseMovedRef,
    buttonRef,
    popoverRef,
    listRef,
  };

  // These props are forwarded to a
  let hiddenSelectProps = {
    autoComplete,
    form,
    name,
    required,
  };

  useControlledSwitchWarning(valueProp, "value", _componentName);

  return (
    <DescendantProvider
      context={ListboxDescendantContext}
      items={descendants}
      set={setDescendants}
    >
      <ListboxContext.Provider value={context}>
        <div {...props} ref={ref}>
          {typeof children === "function"
            ? (children as any)({ value: current.context.value })
            : children}
        </div>
        {Object.values(hiddenSelectProps).some(val => val) && (
          <ListboxHiddenSelect {...hiddenSelectProps} />
        )}
      </ListboxContext.Provider>
    </DescendantProvider>
  );
});

if (__DEV__) {
  ListboxInput.displayName = "ListboxInput";
  ListboxInput.propTypes = {
    autoComplete: PropTypes.string,
    autoFocus: PropTypes.bool,
    form: PropTypes.string,
    name: PropTypes.string,
    required: PropTypes.bool,
    value: PropTypes.string,
  };
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxinput-props
 */
export type ListboxInputProps = Omit<
  React.HTMLProps<HTMLDivElement>,
  // WHY ARE THESE A THING ON A DIV, UGH
  "autoComplete" | "autoFocus" | "form" | "name"
> &
  Pick<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "autoComplete" | "autoFocus" | "form" | "name" | "required"
  > & {
    children: React.ReactNode | ((value: ListboxValue) => React.ReactNode);
    value?: ListboxValue;
    // TODO: Maybe? multiple: boolean
  };

////////////////////////////////////////////////////////////////////////////////

/**
 * A hidden select field to store values controlled by the listbox.
 * This helps with autoComplete and is useful if the listbox is used in a form.
 */
const ListboxHiddenSelect: React.FC<React.SelectHTMLAttributes<
  HTMLSelectElement
>> = props => {
  let { descendants: options } = useDescendantContext();
  let { send, state } = useListboxContext();
  return (
    <select
      hidden
      {...props}
      onChange={event => {
        send({
          type: ListboxEvents.SelectOption,
          value: event.target.value,
        });
      }}
      value={state.context.value || undefined}
    >
      {options.map(({ value, valueText }) => (
        <option value={value} key={value}>
          {valueText}
        </option>
      ))}
    </select>
  );
};

if (__DEV__) {
  ListboxHiddenSelect.displayName = "ListboxHiddenSelect";
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Listbox
 *
 * @see Docs https://reacttraining.com/reach-ui/listbox#listbox-1
 */
export const Listbox = forwardRef<HTMLDivElement, ListboxProps>(
  function Listbox({ children, renderButton, ...props }, forwardedRef) {
    return (
      <ListboxInput {...props} _componentName="Listbox" ref={forwardedRef}>
        {value => (
          <Fragment>
            <ListboxButton>
              {renderButton ? renderButton(value) : "Button"}
            </ListboxButton>
            <ListboxPopover>
              <ListboxList>{children}</ListboxList>
            </ListboxPopover>
          </Fragment>
        )}
      </ListboxInput>
    );
  }
);

if (__DEV__) {
  Listbox.displayName = "Listbox";
  Listbox.propTypes = {
    ...ListboxInput.propTypes,
    renderButton: PropTypes.func,
  };
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listbox-props
 */
export type ListboxProps = ListboxInputProps & {
  renderButton?(value: ListboxValue): React.ReactNode;
};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxButton
 */
export const ListboxButton = forwardRefWithAs<ListboxButtonProps, "button">(
  function ListboxButton({ as: Comp = "button", ...props }, forwardedRef) {
    return <Comp {...props} ref={forwardedRef} />;
  }
);

if (__DEV__) {
  ListboxButton.displayName = "ListboxButton";
  ListboxButton.propTypes = {};
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxbutton-props
 */
export type ListboxButtonProps = {};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxPopover
 */
export const ListboxPopover = forwardRef<any, ListboxPopoverProps>(
  function ListboxPopover(
    { onBlur, onKeyDown, portal = true, ...props },
    forwardedRef
  ) {
    let { popoverRef, buttonRef } = useListboxContext();
    let ref = useForkedRef(popoverRef, forwardedRef);
    let hidden = true; // TODO:

    // TODO:
    function handleBlur() {}
    function handleKeyDown() {}

    let commonProps = {
      ...props,
      ref,
      "data-reach-listbox-popover": "",
      hidden,
      onBlur: wrapEvent(onBlur, handleBlur),
      onKeyDown: wrapEvent(onKeyDown, handleKeyDown),
      tabIndex: -1,
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

if (__DEV__) {
  ListboxPopover.displayName = "ListboxPopover";
  ListboxPopover.propTypes = {
    portal: PropTypes.bool,
    children: PropTypes.node,
  };
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxpopover-props
 */
export type ListboxPopoverProps = React.HTMLProps<HTMLDivElement> & {
  portal?: boolean;
  children: React.ReactNode;
};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxList
 */
export const ListboxList = forwardRefWithAs<ListboxListProps, "ul">(
  function ListboxList({ as: Comp = "ul", ...props }, forwardedRef) {
    let {
      listRef,
      listboxId,
      state: {
        context: { value },
      },
    } = useListboxContext();
    let ref = useForkedRef(forwardedRef, listRef);

    return (
      <Comp
        aria-activedescendant={useOptionId(value)}
        role="listbox"
        {...props}
        ref={ref}
        data-reach-listbox-list=""
        id={listboxId}
        tabIndex={-1}
      />
    );
  }
);

if (__DEV__) {
  ListboxList.displayName = "ListboxList";
  ListboxList.propTypes = {};
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxlist-props
 */
export type ListboxListProps = {};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxOption
 */
export const ListboxOption = forwardRefWithAs<ListboxOptionProps, "li">(
  function ListboxOption(
    { as: Comp = "li", children, value, valueText: valueTextProp, ...props },
    forwardedRef
  ) {
    let {
      state: {
        context: { value: inputValue, navigationValue },
      },
      mouseMovedRef,
    } = useListboxContext();

    let [valueTextState, setValueText] = useState(valueTextProp);
    let valueText = valueTextProp || valueTextState || "";

    let ownRef: ListobxOptionRef = useRef(null);
    let index = useDescendant({
      context: ListboxDescendantContext,
      element: ownRef.current!,
      value,
      valueText,
    });

    // After the ref is mounted to the DOM node, we check to see if we have an
    // explicit valueText prop before looking for the node's textContent for
    // typeahead functionality.
    let getValueTextFromDomNode = useCallback((node: HTMLElement) => {
      setValueText(prevState => {
        if (node.textContent && prevState !== node.textContent) {
          return node.textContent;
        }
        return prevState || "";
      });
    }, []);
    let ref = useForkedRef(getValueTextFromDomNode, forwardedRef, ownRef);

    let isHighlighted = navigationValue ? navigationValue === value : false;
    let isSelected = inputValue === value;

    return (
      <Comp
        aria-selected={isSelected}
        role="option"
        {...props}
        ref={ref}
        id={useOptionId(value)}
        data-reach-listbox-option=""
        data-highlighted={isHighlighted}
        data-value={value}
        data-valuetext={valueText}
        tabIndex={-1}
      >
        {children}
      </Comp>
    );
  }
);

if (__DEV__) {
  ListboxOption.displayName = "ListboxOption";
  ListboxOption.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    valueText: PropTypes.string,
  };
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxoption-props
 */
export type ListboxOptionProps = {
  value: ListboxValue;
  valueText?: string;
};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxGroup
 */
export const ListboxGroup = forwardRef<HTMLDivElement, ListboxGroupProps>(
  function ListboxGroup({ ...props }, forwardedRef) {
    const { listboxId } = useListboxContext();
    const labelId = makeId("label", useId(props.id), listboxId);
    return (
      <ListboxGroupContext.Provider value={{ labelId }}>
        <div
          aria-labelledby={labelId}
          role="group"
          {...props}
          ref={forwardedRef}
        />
      </ListboxGroupContext.Provider>
    );
  }
);

if (__DEV__) {
  ListboxGroup.displayName = "ListboxGroup";
  ListboxGroup.propTypes = {};
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxgroup-props
 */
export type ListboxGroupProps = React.HTMLProps<HTMLDivElement> & {};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxGroupLabel
 */
export const ListboxGroupLabel = forwardRefWithAs<
  ListboxGroupLabelProps,
  "span"
>(function ListboxGroupLabel({ as: Comp = "span", ...props }, forwardedRef) {
  const { labelId } = useListboxGroupContext();
  return (
    <Comp
      role="none"
      {...props}
      ref={forwardedRef}
      data-reach-listbox-group-label=""
      id={labelId}
    />
  );
});

if (__DEV__) {
  ListboxGroupLabel.displayName = "ListboxGroupLabel";
  ListboxGroupLabel.propTypes = {};
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxgroup-props
 */
export type ListboxGroupLabelProps = {};

////////////////////////////////////////////////////////////////////////////////

function useKeyDown() {
  const {
    onSelect,
    state: {
      context: { navigationValue },
      value: state,
    },
    send,
    autocompletePropRef,
    persistSelectionRef,
  } = useListboxContext();

  const { descendants: options } = useContext(ListboxDescendantContext);

  return function handleKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();

        if (!options || options.length === 0) {
          return;
        }

        let index = options.findIndex(({ value }) => value === navigationValue);

        if (state === ListboxStates.Idle) {
          // Opening a closed list
          send(ListboxEvents.Navigate);
        } else {
          const index = options.findIndex(
            ({ value }) => value === navigationValue
          );
          const atBottom = index === options.length - 1;
          if (atBottom) {
            // cycle through
            const firstOption = options[0].value;
            transition(NAVIGATE, { value: firstOption });
          } else {
            // Go to the next item in the list
            const nextValue = options[(index + 1) % options.length].value;
            transition(NAVIGATE, { value: nextValue });
          }
        }
        break;
      }
      // A lot of duplicate code with ArrowDown up next, I'm already over it.
      case "ArrowUp": {
        // Don't scroll the page
        event.preventDefault();

        /*
         * If the developer didn't render any options, there's no point in
         * trying to navigate--but seriously what the heck? Give us some
         * options fam.
         */
        if (!options || options.length === 0) {
          return;
        }

        if (state === IDLE) {
          transition(NAVIGATE);
        } else {
          const index = options.findIndex(
            ({ value }) => value === navigationValue
          );
          if (index === 0) {
            if (autocompletePropRef.current) {
              /*
               * Go back to the value the user has typed because we are
               * autocompleting and they need to be able to get back to what
               * they had typed w/o having to backspace out.
               */
              transition(NAVIGATE, { value: null });
            } else {
              // cycle through
              const lastOption = options[options.length - 1].value;
              transition(NAVIGATE, { value: lastOption });
            }
          } else if (index === -1) {
            // displaying the user's value, so go select the last one
            const value = options.length
              ? options[options.length - 1].value
              : null;
            transition(NAVIGATE, { value });
          } else {
            // normal case, select previous
            const nextValue =
              options[(index - 1 + options.length) % options.length].value;
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
          transition(SELECT_WITH_KEYBOARD, { callback: onSelect });
        }
        break;
      }
    }
  };
}

function useOptionId(value: ListboxValue | null) {
  const { instanceId } = useListboxContext();
  return value ? makeId(`option-${value}`, instanceId) : "";
}

function isRightClick(nativeEvent: MouseEvent) {
  return nativeEvent.which === 3 || nativeEvent.button === 2;
}

// TODO: Move to @reach/utils
export function useControlledSwitchWarning(
  controlPropValue: any,
  controlPropName: string,
  componentName: string
) {
  /*
   * Determine whether or not the component is controlled and warn the developer
   * if this changes unexpectedly.
   */
  let isControlled = controlPropValue != null;
  let { current: wasControlled } = useRef(isControlled);
  useEffect(() => {
    if (__DEV__) {
      warning(
        !(!isControlled && wasControlled),
        `${componentName} is changing from controlled to uncontrolled. ${componentName} should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled ${componentName} for the lifetime of the component. Check the \`${controlPropName}\` prop being passed in.`
      );
      warning(
        !(isControlled && !wasControlled),
        `${componentName} is changing from uncontrolled to controlled. ${componentName} should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled ${componentName} for the lifetime of the component. Check the \`${controlPropName}\` prop being passed in.`
      );
    }
  }, [componentName, controlPropName, isControlled, wasControlled]);
}

////////////////////////////////////////////////////////////////////////////////

function useMachine<
  TC extends object,
  TE extends MachineEventWithRefs = MachineEventWithRefs
>(
  initialMachine: StateMachine.Machine<TC, TE, any>,
  refs: MachineToReactRefMap<TE>
): [
  StateMachine.State<TC, TE, any>,
  StateMachine.Service<TC, DistributiveOmit<TE, "refs">>["send"],
  StateMachine.Service<TC, TE>
] {
  /*
   * State machine should not change between renders, so let's store it in a
   * ref. This should also help if we need to use a creator function to inject
   * dynamic initial state values based on props.
   */
  let { current: machine } = useRef(initialMachine);
  let service = useConstant(() => interpret(machine).start());
  let [current, setCurrent] = useState(machine.initialState);

  // Add refs to every event so we can use them to perform actions.
  let send = useCallback(
    (rawEvent: TE["type"] | DistributiveOmit<TE, "refs">) => {
      let event = typeof rawEvent === "string" ? { type: rawEvent } : rawEvent;
      let refValues = Object.keys(refs).reduce((value, name) => {
        (value as any)[name] = refs[name].current;
        return value;
      }, {});
      service.send({ ...event, refs: refValues } as TE);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    service.subscribe(setCurrent);
    return () => {
      service.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [current, send, service];
}

export interface MachineEventWithRefs extends MachineEvent {
  refs: {
    [key: string]: any;
  };
}

export type MachineToReactRefMap<TE extends MachineEventWithRefs> = {
  [K in keyof TE["refs"]]: React.RefObject<TE["refs"][K]>;
};

////////////////////////////////////////////////////////////////////////////////
// Types

type ListboxValue = React.ReactText;

type ListboxStateData = {
  navigationValue: ListboxValue | null;
  value: ListboxValue | null;
  refs: ListboxNodeRefs;
};

interface DescendantProps {
  value: ListboxValue;
  valueText: string;
}

interface IListboxContext {
  listboxId: string;
  buttonId: string;
  state: StateMachine.State<ListboxStateData, ListboxEvent, ListboxState>;
  send: StateMachine.Service<
    ListboxStateData,
    DistributiveOmit<ListboxEvent, "refs">
  >["send"];
  inputRef: ListobxInputRef;
  instanceId: string;
  listRef: ListobxListRef;
  mouseMovedRef: React.RefObject<boolean>;
  buttonRef: ListobxButtonRef;
  popoverRef: ListobxPopoverRef;
}

interface IListboxGroupContext {
  labelId: string;
}

type ListobxInputRef = React.MutableRefObject<HTMLDivElement | null>;
type ListobxListRef = React.MutableRefObject<HTMLUListElement | null>;
type ListobxButtonRef = React.MutableRefObject<HTMLButtonElement | null>;
type ListobxPopoverRef = React.MutableRefObject<HTMLDivElement | null>;
type ListobxOptionRef = React.MutableRefObject<HTMLDivElement | null>;
