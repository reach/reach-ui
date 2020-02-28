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
 * TODO:
 *   - Test in a form
 *   - Finish prop types
 *   - Figure out why nav selection isn't working with button clicks
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
  useMemo,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { useId } from "@reach/auto-id";
import Popover, { positionMatchWidth } from "@reach/popover";
import {
  createDescendantContext,
  DescendantProvider,
  useDescendant,
  useDescendantKeyDown,
  useDescendants,
} from "@reach/descendants";
import {
  checkStyles,
  createNamedContext,
  forwardRefWithAs,
  isBoolean,
  isFunction,
  isRightClick,
  isString,
  makeId,
  stateToAttributeString,
  useControlledSwitchWarning,
  useForkedRef,
  useIsomorphicLayoutEffect as useLayoutEffect,
  useStateLogger,
  wrapEvent,
} from "@reach/utils";
import { useMachine, useMachineLogger, useCreateMachine } from "@reach/machine";
import {
  createMachineDefinition,
  ListboxEvents,
  ListboxStates,
} from "./machine";
import {
  ListboxArrowProps,
  ListboxButtonProps,
  ListboxContextValue,
  ListboxDescendantProps,
  ListboxGroupContextValue,
  ListboxGroupLabelProps,
  ListboxGroupProps,
  ListboxInputProps,
  ListboxListProps,
  ListboxOptionProps,
  ListboxPopoverProps,
  ListboxProps,
  ListboxValue,
  ListobxButtonRef,
  ListobxInputRef,
  ListobxListRef,
  ListobxOptionRef,
  ListobxPopoverRef,
} from "./types";

let DEBUG = true;

const expandedStates = [
  ListboxStates.Navigating,
  ListboxStates.NavigatingWithKeys,
  ListboxStates.Interacting,
  ListboxStates.Searching,
];
const isExpanded = (state: ListboxStates) => expandedStates.includes(state);

////////////////////////////////////////////////////////////////////////////////
// ListboxContext

const ListboxDescendantContext = createDescendantContext<
  HTMLElement,
  ListboxDescendantProps
>("ListboxDescendantContext");
const ListboxContext = createNamedContext(
  "ListboxContext",
  {} as ListboxContextValue
);
const ListboxGroupContext = createNamedContext(
  "ListboxGroupContext",
  {} as ListboxGroupContextValue
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
    children,
    disabled,
    form,
    name,
    onChange,
    required,
    value: valueProp,

    // We only use this prop for console warnings
    _componentName = "ListboxInput",
    ...props
  },
  forwardedRef
) {
  let mounted = useRef(false);
  let { current: isControlled } = useRef(valueProp != null);
  let [options, setOptions] = useDescendants<
    HTMLElement,
    ListboxDescendantProps
  >();

  useFocusChange();

  // We will track when a mouse has moved in a ref, then reset it to false each
  // time a popover closes. This is useful because we want the selected value of
  // the listbox to be highlighted when the user opens it, but if the pointer
  // is resting above an option it will steal the highlight.
  // TODO: Use state machine instead
  let mouseMovedRef = useRef(false);

  // If a user clicks the button while the listbox is open, the blur event
  // will close the popover and send us back to IDLE. The mousup event will
  // then fire and send us right back to NAVIGATING, which we probably don't
  // want.
  // TODO: We can probably do this better in the state machine, but for now
  // this ref will track where these mouse events are starting so we can
  // conditionally send events based on this value. Old habits die hard 🙃
  let mouseEventStartedRef = useRef(false);

  let inputRef: ListobxInputRef = useRef(null);
  let buttonRef: ListobxButtonRef = useRef(null);
  let popoverRef: ListobxPopoverRef = useRef(null);
  let listRef: ListobxListRef = useRef(null);

  let machine = useCreateMachine(
    createMachineDefinition({ value: valueProp || null })
  );

  let [current, send] = useMachineLogger(
    useMachine(machine, {
      input: inputRef,
      button: buttonRef,
      popover: popoverRef,
      list: listRef,
    }),
    DEBUG
  );

  // IDs for aria attributes
  let _id = useId(props.id);
  let id = props.id || makeId("listbox-input", _id);
  let listboxId = makeId("listbox", id);
  let buttonId = makeId("button", id);

  let ref = useForkedRef(inputRef, forwardedRef);

  let expanded = isExpanded(current.value as ListboxStates);

  // If the button has children, we just render them as the label.
  // Otherwise we'll find the option with a value that matches the listbox value
  // and use its label in the button. We'll get that here and send it to the
  // button via context.
  // If a user needs the label for SSR to prevent hydration mismatch issues,
  // they need to control the state of the component and pass a label directly
  // to the button.
  let valueLabel = useMemo(() => {
    let selected = options.find(
      option => option.value === current.context.value
    );
    return selected ? selected.label : null;
  }, [options, current.context.value]);

  let context: ListboxContextValue = useMemo(() => {
    return {
      buttonId,
      buttonRef,
      disabled: !!disabled,
      inputRef,
      instanceId: id,
      expanded,
      listboxId,
      listboxValue: current.context.value,
      listboxValueLabel: valueLabel,
      listRef,
      mouseEventStartedRef,
      mouseMovedRef,
      onValueChange: onChange,
      popoverRef,
      send,
      state: current,
    };
  }, [
    buttonId,
    current,
    disabled,
    expanded,
    id,
    listboxId,
    onChange,
    send,
    valueLabel,
  ]);

  // These props are forwarded to a hidden select field
  let hiddenSelectProps = {
    autoComplete,
    disabled,
    form,
    name,
    required,
  };

  useControlledSwitchWarning(valueProp, "value", _componentName);

  // For uncontrolled listbox components where no `defaultValue` is provided, we
  // will update the value based on the value of the first selectable option.
  // We call the update directly because:
  //   A) we only ever need to do this once, so we can guard with a mounted ref
  //   B) useLayoutEffect races useDecendant, so we might not have options yet
  //   C) useEffect will cause a flash
  if (!isControlled && !mounted.current && options.length) {
    mounted.current = true;
    let first = options.find(option => !option.disabled);
    if (first && first.value) {
      send({
        type: ListboxEvents.ValueChange,
        value: first.value!,
      });
    }
  }

  // We need to get some data from props to pass to the state machine in the
  // event that they change
  if (isControlled && valueProp !== current.context.value) {
    send({
      type: ListboxEvents.ValueChange,
      value: valueProp!,
    });
  }

  useLayoutEffect(() => {
    send({
      type: ListboxEvents.GetDerivedData,
      data: { options },
    });
  }, [options, send]);

  useEffect(() => {
    function listener(event: MouseEvent) {
      let { target, relatedTarget } = event;
      send({
        type: ListboxEvents.OutsideMouseDown,
        relatedTarget: relatedTarget || target,
      });
    }
    window.addEventListener("mousedown", listener);
    return () => {
      window.removeEventListener("mousedown", listener);
    };
  }, [send]);

  useStateLogger(current.value, DEBUG);
  useEffect(() => checkStyles("listbox"), []);

  return (
    <DescendantProvider
      context={ListboxDescendantContext}
      items={options}
      set={setOptions}
    >
      <ListboxContext.Provider value={context}>
        <div
          {...props}
          ref={ref}
          data-reach-listbox-input=""
          data-expanded={expanded ? "" : undefined}
          data-state={stateToAttributeString(current.value)}
          data-value={current.context.value}
        >
          {isFunction(children)
            ? children({
                value: current.context.value,
                valueLabel,
              })
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
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    autoComplete: PropTypes.string,

    // TODO: Consider autoFocus prop implementation, if possible
    // Not sure how this would work without some sort of App-wrapper provider
    // that manages focus. Inputs get this out of the box, div's do not.
    // autoFocus: PropTypes.bool,
    form: PropTypes.string,
    name: PropTypes.string,
    required: PropTypes.bool,
    value: PropTypes.string,
  };
}

export { ListboxInputProps };

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxHiddenSelect
 *
 * A hidden select field to store values controlled by the listbox.
 * This *should* help with autoComplete (I think, need to test) and is useful if
 * the listbox is used in a form.
 */
const ListboxHiddenSelect: React.FC<React.SelectHTMLAttributes<
  HTMLSelectElement
>> = props => {
  let { descendants: options } = useDescendantContext();
  let { send, state, onValueChange, mouseMovedRef } = useListboxContext();
  return (
    <select
      hidden
      {...props}
      onChange={event => {
        send({
          type: ListboxEvents.ValueChange,
          value: event.target.value,
          callback: val => {
            onValueChange && onValueChange(val);
            mouseMovedRef.current = false;
          },
        });
      }}
      value={state.context.value || undefined}
    >
      {options.map(({ value, label }) => (
        <option value={value} key={value}>
          {label}
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
 * High-level listbox API
 *
 * <Listbox>
 *   <ListboxOption value="1">Option 1</ListboxOption>
 *   <ListboxOption value="2">Option 2</ListboxOption>
 *   <ListboxOption value="3">Option 3</ListboxOption>
 * </Listbox>
 *
 * @see Docs https://reacttraining.com/reach-ui/listbox#listbox-1
 */
export const Listbox = forwardRef<HTMLDivElement, ListboxProps>(
  function Listbox({ arrow = "▼", button, children, ...props }, forwardedRef) {
    return (
      <ListboxInput {...props} _componentName="Listbox" ref={forwardedRef}>
        {({ value, valueLabel }) => (
          <Fragment>
            <ListboxButton
              arrow={arrow}
              children={
                button
                  ? isFunction(button)
                    ? button({ value, label: valueLabel })
                    : button
                  : undefined
              }
            />
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
    arrow: PropTypes.oneOfType([PropTypes.node, PropTypes.bool]),
    button: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  };
}

export { ListboxProps };

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxButton
 */
export const ListboxButton = forwardRefWithAs<ListboxButtonProps, "span">(
  function ListboxButton(
    {
      arrow = false,
      as: Comp = "span",
      children,
      onKeyDown,
      onMouseDown,
      onMouseUp,
      tabIndex,
      ...props
    },
    forwardedRef
  ) {
    let {
      buttonId,
      buttonRef,
      expanded,
      listboxId,
      mouseEventStartedRef,
      state,
      send,
      listboxValueLabel,
    } = useListboxContext();
    let listboxValue = state.context.value;

    let ref = useForkedRef(buttonRef, forwardedRef);

    let handleKeyDown = useKeyDown();

    function handleMouseDown(event: React.MouseEvent) {
      if (!isRightClick(event.nativeEvent)) {
        mouseEventStartedRef.current = true;
        event.persist();
        event.preventDefault();
        send({ type: ListboxEvents.ButtonMouseDown });
      }
    }

    function handleMouseUp(event: React.MouseEvent) {
      if (mouseEventStartedRef.current) {
        if (!isRightClick(event.nativeEvent)) {
          send({ type: ListboxEvents.ButtonMouseUp });
        }
      }
      mouseEventStartedRef.current = false;
    }

    // If the button has children, we just render them as the label
    // If a user needs the label on the server to prevent hydration mismatch
    // errors, they need to control the state of the component and pass a label
    // directly to the button.
    let label: React.ReactNode = useMemo(() => {
      if (!children) {
        return listboxValueLabel;
      } else if (isFunction(children)) {
        return children({
          isExpanded: expanded,
          label: listboxValueLabel!,
          value: listboxValue,
        });
      }
      return children;
    }, [children, listboxValueLabel, expanded, listboxValue]);

    return (
      <Comp
        aria-controls={listboxId}
        aria-expanded={expanded}
        aria-haspopup="listbox"
        aria-labelledby={`${buttonId} ${listboxId}`}
        role="button"
        {...props}
        ref={ref}
        data-reach-listbox-button=""
        id={buttonId}
        onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
        onMouseDown={wrapEvent(onMouseDown, handleMouseDown)}
        onMouseUp={wrapEvent(onMouseUp, handleMouseUp)}
        tabIndex={tabIndex ?? 0}
      >
        {label}
        {arrow && (
          <ListboxArrow>{!isBoolean(arrow) ? arrow : null}</ListboxArrow>
        )}
      </Comp>
    );
  }
);

if (__DEV__) {
  ListboxButton.displayName = "ListboxButton";
  ListboxButton.propTypes = {
    arrow: PropTypes.oneOfType([PropTypes.node, PropTypes.bool]),
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  };
}

export { ListboxButtonProps };

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxArrow
 *
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxarrow
 */
export const ListboxArrow = forwardRef<HTMLSpanElement, ListboxArrowProps>(
  function ListboxArrow({ children, ...props }, forwardedRef) {
    let { expanded } = useListboxContext();
    let defaultArrow = expanded ? "▲" : "▼";
    return (
      <span
        aria-hidden
        {...props}
        ref={forwardedRef}
        data-reach-listbox-arrow=""
      >
        {isFunction(children)
          ? children({ isExpanded: expanded })
          : children || defaultArrow}
      </span>
    );
  }
);

if (__DEV__) {
  ListboxArrow.displayName = "ListboxArrow";
  ListboxArrow.propTypes = {};
}

export { ListboxArrowProps };

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxPopover
 */
export const ListboxPopover = forwardRef<any, ListboxPopoverProps>(
  function ListboxPopover(
    {
      position = positionMatchWidth,
      onBlur,
      onKeyDown,
      portal = true,
      ...props
    },
    forwardedRef
  ) {
    let { expanded, popoverRef, buttonRef, send } = useListboxContext();
    let ref = useForkedRef(popoverRef, forwardedRef);
    let hidden = !expanded;

    let handleKeyDown = useKeyDown();

    let commonProps = {
      ...props,
      ref,
      "data-reach-listbox-popover": "",
      hidden,
      onBlur: wrapEvent(onBlur, handleBlur),
      onKeyDown: wrapEvent(onKeyDown, handleKeyDown),
      tabIndex: -1,
    };

    function handleBlur(event: React.FocusEvent) {
      let { nativeEvent } = event;
      requestAnimationFrame(() => {
        send({
          type: ListboxEvents.Blur,
          relatedTarget: nativeEvent.relatedTarget,
        });
      });
    }

    return portal ? (
      <Popover
        {...commonProps}
        targetRef={buttonRef as any}
        position={position}
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

export { ListboxPopoverProps };

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

export { ListboxListProps };

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxOption
 */
export const ListboxOption = forwardRefWithAs<ListboxOptionProps, "li">(
  function ListboxOption(
    {
      as: Comp = "li",
      children,
      disabled,
      onMouseDown,
      onMouseEnter,
      onMouseLeave,
      onMouseMove,
      onMouseUp,
      value,
      label: labelProp,
      ...props
    },
    forwardedRef
  ) {
    if (__DEV__ && !value) {
      throw Error(`A ListboxOption must have a value prop.`);
    }

    let {
      send,
      state: {
        context: { value: listboxValue, navigationValue },
      },
      onValueChange,
      mouseEventStartedRef,
      mouseMovedRef,
    } = useListboxContext();

    let [labelState, setLabel] = useState(labelProp);
    let label = labelProp || labelState || "";

    let ownRef: ListobxOptionRef = useRef(null);
    useDescendant({
      context: ListboxDescendantContext,
      element: ownRef.current!,
      value,
      label,
      disabled: !!disabled,
    });

    // After the ref is mounted to the DOM node, we check to see if we have an
    // explicit label prop before looking for the node's textContent for
    // typeahead functionality.
    let getLabelFromDomNode = useCallback(
      (node: HTMLElement) => {
        if (!labelProp) {
          setLabel(prevState => {
            if (node.textContent && prevState !== node.textContent) {
              return node.textContent;
            }
            return prevState || "";
          });
        }
      },
      [labelProp]
    );
    let ref = useForkedRef(getLabelFromDomNode, forwardedRef, ownRef);

    let isHighlighted = navigationValue ? navigationValue === value : false;
    let isSelected = listboxValue === value;

    function handleMouseEnter() {
      // If the user hasn't moved their mouse but mouse enter event still fires
      // (this happens if the popup opens due to a keyboard event), we don't
      // want to change the navigationSelect value
      if (mouseMovedRef.current) {
        mouseMovedRef.current = false;
        send({
          type: ListboxEvents.Navigate,
          value,
          disabled: !!disabled,
        });
      }
    }

    function handleMouseLeave() {
      send({ type: ListboxEvents.ClearNavSelection });
    }

    function handleMouseDown(event: React.MouseEvent) {
      mouseEventStartedRef.current = true;
      if (!isRightClick(event.nativeEvent)) {
        send({ type: ListboxEvents.OptionStartClick });
      }
    }

    function handleMouseUp(event: React.MouseEvent) {
      if (mouseEventStartedRef.current) {
        mouseEventStartedRef.current = false;
        if (!isRightClick(event.nativeEvent)) {
          send({
            type: ListboxEvents.OptionFinishClick,
            value,
            callback: onValueChange,
            disabled: !!disabled,
          });
        }
      }
    }

    function handleMouseMove() {
      mouseMovedRef.current = true;
      // We don't really *need* this guard if we put this in the state machine,
      // but in this case it seems wise not to needlessly run our transitions
      // every time the user's mouse moves. Seems like a lot.
      if (navigationValue !== value) {
        send({
          type: ListboxEvents.Navigate,
          value,
          disabled: !!disabled,
        });
      }
    }

    return (
      <Comp
        aria-selected={isSelected}
        aria-disabled={disabled ? true : undefined}
        role="option"
        {...props}
        ref={ref}
        id={useOptionId(value)}
        data-reach-listbox-option=""
        data-highlighted={isHighlighted ? "" : undefined}
        data-label={label}
        data-value={value}
        onMouseDown={wrapEvent(onMouseDown, handleMouseDown)}
        onMouseEnter={wrapEvent(onMouseEnter, handleMouseEnter)}
        onMouseLeave={wrapEvent(onMouseLeave, handleMouseLeave)}
        onMouseMove={wrapEvent(onMouseMove, handleMouseMove)}
        onMouseUp={wrapEvent(onMouseUp, handleMouseUp)}
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
    value: PropTypes.string.isRequired,
    label: PropTypes.string,
  };
}

export { ListboxOptionProps };

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxGroup
 */
export const ListboxGroup = forwardRef<HTMLDivElement, ListboxGroupProps>(
  function ListboxGroup({ label, children, ...props }, forwardedRef) {
    let { listboxId } = useListboxContext();
    let labelId = makeId("label", useId(props.id), listboxId);
    return (
      <ListboxGroupContext.Provider value={{ labelId }}>
        <div
          aria-labelledby={labelId}
          role="group"
          {...props}
          ref={forwardedRef}
        >
          {label && <ListboxGroupLabel>{label}</ListboxGroupLabel>}
          {children}
        </div>
      </ListboxGroupContext.Provider>
    );
  }
);

if (__DEV__) {
  ListboxGroup.displayName = "ListboxGroup";
  ListboxGroup.propTypes = {};
}

export { ListboxGroupProps };

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxGroupLabel
 */
export const ListboxGroupLabel = forwardRefWithAs<
  ListboxGroupLabelProps,
  "span"
>(function ListboxGroupLabel({ as: Comp = "span", ...props }, forwardedRef) {
  let { labelId } = useListboxGroupContext();
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

export { ListboxGroupLabelProps };

////////////////////////////////////////////////////////////////////////////////

function useKeyDown() {
  let {
    onValueChange,
    state: {
      context: { navigationValue, typeaheadQuery },
    },
    send,
  } = useListboxContext();

  let { descendants: options } = useDescendantContext();

  useEffect(() => {
    if (typeaheadQuery) {
      send({
        type: ListboxEvents.UpdateAfterTypeahead,
        query: typeaheadQuery,
        callback: onValueChange,
      });
    }
    let timeout = window.setTimeout(() => {
      if (typeaheadQuery != null) {
        send({ type: ListboxEvents.ClearTypeahead });
      }
    }, 1000);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [onValueChange, send, typeaheadQuery]);

  let index = options.findIndex(({ value }) => value === navigationValue);

  let handleKeyDown = wrapEvent(
    function(event: React.KeyboardEvent) {
      let { key } = event;
      let isSearching = isString(key) && key.length === 1;
      let navOption = options.find(option => option.value === navigationValue);
      switch (key) {
        case "Enter":
          send({
            type: ListboxEvents.KeyDownEnter,
            value: navigationValue,
            callback: onValueChange,
            disabled: !!navOption?.disabled,
          });
          return;
        case " ":
          event.preventDefault();
          send({
            type: ListboxEvents.KeyDownSpace,
            value: navigationValue,
            callback: onValueChange,
            disabled: !!navOption?.disabled,
          });
          return;
        case "Escape":
          send({ type: ListboxEvents.KeyDownEscape });
          return;
        case "Tab":
          let eventType = event.shiftKey
            ? ListboxEvents.KeyDownShiftTab
            : ListboxEvents.KeyDownTab;
          send({ type: eventType });
          return;
        default:
          if (isSearching) {
            send({
              type: ListboxEvents.KeyDownSearch,
              query: key,
            });
          }
          return;
      }
    },

    useDescendantKeyDown(ListboxDescendantContext, {
      currentIndex: index,
      orientation: "vertical",
      key: "index",
      rotate: true,
      filter: option => !option.disabled,
      callback(nextIndex: number) {
        send({
          type: ListboxEvents.KeyDownNavigate,
          value: options[nextIndex].value,
        });
      },
    })
  );

  return handleKeyDown;
}

function useOptionId(value: ListboxValue | null) {
  let { instanceId } = useListboxContext();
  return value ? makeId(`option-${value}`, instanceId) : "";
}

function useFocusChange(
  handleChange: (
    activeElement: Element | null,
    previousActiveElement: Element | null,
    event?: FocusEvent
  ) => void = console.log,
  when: "focus" | "blur" = "focus",
  ownerDocument: Document = document
) {
  let lastActiveElement = useRef(ownerDocument.activeElement);

  useEffect(() => {
    lastActiveElement.current = ownerDocument.activeElement;

    function onChange(event: FocusEvent) {
      if (lastActiveElement.current !== ownerDocument.activeElement) {
        typeof handleChange === "function" &&
          handleChange(
            ownerDocument.activeElement,
            lastActiveElement.current,
            event
          );
        lastActiveElement.current = ownerDocument.activeElement;
      }
    }

    ownerDocument.addEventListener(when, onChange, true);

    return () => {
      ownerDocument.removeEventListener(when, onChange);
    };
  }, [when, handleChange, ownerDocument]);
}
