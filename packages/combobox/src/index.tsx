/**
 * Welcome to @reach/combobox!
 *
 * Accessible combobox (autocomplete or autosuggest) component for React.
 *
 * A combobox is the combination of an `<input type="text"/>` and a list. The
 * list is designed to help the user arrive at a value, but the value does not
 * necessarily have to come from that list. Don't think of it like a
 * `<select/>`, but more of an `<input type="text"/>` with some suggestions. You
 * can, however, validate that the value comes from the list, that's up to your
 * app.
 *
 * ???: navigate w/ arrows, then hit backspace: should it delete the
 *      autocompleted text or the old value the user had typed?!
 *
 * @see Docs     https://reacttraining.com/reach-ui/combobox
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/combobox
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#combobox
 */

import React, {
  forwardRef,
  useEffect,
  useRef,
  useCallback,
  useContext,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import {
  checkStyles,
  createNamedContext,
  forwardRefWithAs,
  getOwnerDocument,
  isFunction,
  makeId,
  memoWithAs,
  useIsomorphicLayoutEffect,
  useForkedRef,
  useUpdateEffect,
  wrapEvent,
  noop,
  DistributiveOmit,
} from "@reach/utils";
import { useCreateMachine, useMachine, StateMachine } from "@reach/machine";
import {
  createDescendantContext,
  Descendant,
  DescendantProvider,
  useDescendant,
  useDescendants,
  useDescendantsInit,
} from "@reach/descendants";
import { findAll } from "highlight-words-core";
import { useId } from "@reach/auto-id";
import Popover, { positionMatchWidth, PopoverProps } from "@reach/popover";
import {
  createMachineDefinition,
  ComboboxStateData,
  ComboboxEvents,
  ComboboxEvent,
  ComboboxStates,
} from "./machine";

const DEBUG = false;

const ComboboxDescendantContext = createDescendantContext<ComboboxDescendant>(
  "ComboboxDescendantContext"
);
const ComboboxContext = createNamedContext(
  "ComboboxContext",
  {} as InternalComboboxContextValue
);

// Allows us to put the option's value on context so that ComboboxOptionText
// can work it's highlight text magic no matter what else is rendered around
// it.
const OptionContext = createNamedContext(
  "OptionContext",
  {} as ComboboxOptionContextValue
);

////////////////////////////////////////////////////////////////////////////////

/**
 * Combobox
 *
 * @see Docs https://reacttraining.com/reach-ui/combobox#combobox
 */
export const Combobox = forwardRefWithAs<ComboboxProps, "div">(
  function Combobox(
    {
      onSelect,
      openOnFocus = false,
      children,
      as: Comp = "div",
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      ...props
    },
    forwardedRef
  ) {
    let [options, setOptions] = useDescendantsInit<ComboboxDescendant>();

    let inputRef = useRef<HTMLInputElement | null>(null);
    let popoverRef = useRef<HTMLElement | null>(null);
    let buttonRef = useRef<HTMLElement | null>(null);

    // When <ComboboxInput autocomplete={false} /> we don't want cycle back to
    // the user's value while navigating (because it's always the user's value),
    // but we need to know this in useKeyDown which is far away from the prop
    // here, so we do something sneaky and write it to this ref on context so we
    // can use it anywhere else!
    let autocompletePropRef = useRef();

    let persistSelectionRef = useRef(false);

    let machine = useCreateMachine(
      createMachineDefinition({
        // The value the user has typed. We derive this also when the developer is
        // controlling the value of ComboboxInput.
        value: "",
      })
    );

    let [{ value, context: data }, send] = useMachine(
      machine,
      {
        input: inputRef,
      },
      DEBUG
    );

    // TODO: PR a fix in xstate/fsm types
    let state = value as ComboboxStates;

    // useLayoutEffect so that the cursor goes to the end of the input instead
    // of awkwardly at the beginning, unclear to me why 🤷‍♂️
    // useIsomorphicLayoutEffect(() => {
    //   if (
    //     lastEventType === NAVIGATE ||
    //     lastEventType === ESCAPE ||
    //     lastEventType === SELECT_WITH_CLICK ||
    //     lastEventType === OPEN_WITH_BUTTON
    //   ) {
    //     inputRef.current?.focus();
    //   }
    // }, [lastEventType]);

    let id = useId(props.id);
    let listboxId = id ? makeId("listbox", id) : "listbox";

    let context: InternalComboboxContextValue = {
      ariaLabel,
      ariaLabelledby,
      autocompletePropRef,
      buttonRef,
      comboboxId: id,
      data,
      inputRef,
      isExpanded: popoverIsExpanded(state),
      listboxId,
      onSelect: onSelect || noop,
      openOnFocus,
      persistSelectionRef,
      popoverRef,
      state,
      send,
    };

    useEffect(() => checkStyles("combobox"), []);

    return (
      <DescendantProvider
        context={ComboboxDescendantContext}
        items={options}
        set={setOptions}
      >
        <ComboboxContext.Provider value={context}>
          <Comp {...props} data-reach-combobox="" ref={forwardedRef}>
            {isFunction(children)
              ? children({ id, isExpanded: popoverIsExpanded(state) })
              : children}
          </Comp>
        </ComboboxContext.Provider>
      </DescendantProvider>
    );
  }
);

/**
 * @see Docs https://reacttraining.com/reach-ui/combobox#combobox-props
 */
export type ComboboxProps = {
  /**
   * @see Docs https://reacttraining.com/reach-ui/combobox#combobox-children
   */
  children:
    | React.ReactNode
    | ((props: ComboboxContextValue) => React.ReactNode);
  /**
   * Called with the selection value when the user makes a selection from the
   * list.
   *
   * @see Docs https://reacttraining.com/reach-ui/combobox#combobox-onselect
   */
  onSelect?(value: ComboboxValue): void;
  /**
   * If true, the popover opens when focus is on the text box.
   *
   * @see Docs https://reacttraining.com/reach-ui/combobox#combobox-openonfocus
   */
  openOnFocus?: boolean;
  /**
   * Defines a string value that labels the current element.
   * @see Docs https://reacttraining.com/reach-ui/combobox#accessibility
   */
  "aria-label"?: string;
  /**
   * Identifies the element (or elements) that labels the current element.
   * @see Docs https://reacttraining.com/reach-ui/combobox#accessibility
   */
  "aria-labelledby"?: string;
};

if (__DEV__) {
  Combobox.displayName = "Combobox";
  Combobox.propTypes = {
    as: PropTypes.any,
    onSelect: PropTypes.func,
    openOnFocus: PropTypes.bool,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * ComboboxInput
 *
 * Wraps an `<input/>` with a couple extra props that work with the combobox.
 *
 * @see Docs https://reacttraining.com/reach-ui/combobox#comboboxinput
 */
const ComboboxInputImpl = forwardRefWithAs<ComboboxInputProps, "input">(
  function ComboboxInput(
    {
      as: Comp = "input",
      selectOnClick = false,
      autocomplete = true,
      onClick,
      onChange,
      onKeyDown,
      onBlur,
      onFocus,
      value: controlledValue,
      ...props
    },
    forwardedRef
  ) {
    // https://github.com/reach/reach-ui/issues/464
    let { current: initialControlledValue } = useRef(controlledValue);
    let controlledValueChangedRef = useRef(false);
    useUpdateEffect(() => {
      controlledValueChangedRef.current = true;
    }, [controlledValue]);

    let {
      data: { navigationValue, value },
      inputRef,
      state,
      send,
      listboxId,
      autocompletePropRef,
      openOnFocus,
      isExpanded,
      ariaLabel,
      ariaLabelledby,
    } = useContext(ComboboxContext);

    let ref = useForkedRef(inputRef, forwardedRef);

    // Because we close the List on blur, we need to track if the blur is
    // caused by clicking inside the list, and if so, don't close the List.
    let selectOnClickRef = useRef(false);

    let handleKeyDown = useKeyDown();

    let handleBlur = useBlur();

    let isControlled = controlledValue != null;

    // Layout effect should be SSR-safe here because we don't actually do
    // anything with this ref that involves rendering until after we've
    // let the client hydrate in nested components.
    useIsomorphicLayoutEffect(() => {
      autocompletePropRef.current = autocomplete;
    }, [autocomplete, autocompletePropRef]);

    let handleValueChange = useCallback(
      (value: ComboboxValue) => {
        if (value.trim() === "") {
          send(ComboboxEvents.Clear);
        } else {
          send({
            type: ComboboxEvents.Change,
            value,
            controlledValueChanged: controlledValueChangedRef.current,
            initialControlledValue,
          });
        }
      },
      [initialControlledValue, send]
    );

    useEffect(() => {
      // If they are controlling the value we still need to do our transitions,
      // so  we have this derived state to emulate onChange of the input as we
      // receive new `value`s ...[*]
      if (
        isControlled &&
        controlledValue !== value &&
        // https://github.com/reach/reach-ui/issues/481
        (controlledValue!.trim() === "" ? (value || "").trim() !== "" : true)
      ) {
        handleValueChange(controlledValue!);
      }
    }, [controlledValue, handleValueChange, isControlled, value]);

    // [*]... and when controlled, we don't trigger handleValueChange as the
    // user types, instead the developer controls it with the normal input
    // onChange prop
    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      let { value } = event.target;
      if (!isControlled) {
        handleValueChange(value);
      }
    }

    function handleFocus() {
      if (selectOnClick) {
        selectOnClickRef.current = true;
      }
      send({ type: ComboboxEvents.Focus, openOnFocus });
    }

    function handleClick() {
      if (selectOnClickRef.current) {
        selectOnClickRef.current = false;
        inputRef.current.select();
      }
    }

    let inputValue =
      autocomplete &&
      (state === ComboboxStates.Navigating ||
        state === ComboboxStates.Interacting)
        ? // When idle, we don't have a navigationValue on ArrowUp/Down
          navigationValue || controlledValue || value
        : controlledValue || value;

    return (
      <Comp
        aria-activedescendant={
          navigationValue ? String(makeHash(navigationValue)) : undefined
        }
        aria-autocomplete="both"
        aria-controls={listboxId}
        aria-expanded={isExpanded}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : ariaLabelledby}
        role="combobox"
        {...props}
        data-reach-combobox-input=""
        ref={ref}
        onBlur={wrapEvent(onBlur, handleBlur)}
        onChange={wrapEvent(onChange, handleChange)}
        onClick={wrapEvent(onClick, handleClick)}
        onFocus={wrapEvent(onFocus, handleFocus)}
        onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
        value={inputValue || ""}
      />
    );
  }
);

if (__DEV__) {
  ComboboxInputImpl.displayName = "ComboboxInput";
}

export const ComboboxInput = memoWithAs(ComboboxInputImpl);

/**
 * @see Docs https://reacttraining.com/reach-ui/combobox#comboboxinput-props
 */
export type ComboboxInputProps = {
  /**
   * If true, when the user clicks inside the text box the current value will
   * be selected. Use this if the user is likely to delete all the text anyway
   * (like the URL bar in browsers).
   *
   * However, if the user is likely to want to tweak the value, leave this
   * false, like a google search--the user is likely wanting to edit their
   * search, not replace it completely.
   *
   * @see Docs https://reacttraining.com/reach-ui/combobox#comboboxinput-selectonclick
   */
  selectOnClick?: boolean;
  /**
   * Determines if the value in the input changes or not as the user navigates
   * with the keyboard. If true, the value changes, if false the value doesn't
   * change.
   *
   * Set this to false when you don't really need the value from the input but
   * want to populate some other state (like the recipient selector in Gmail).
   * But if your input is more like a normal `<input type="text"/>`, then leave
   * the `true` default.
   *
   * @see Docs https://reacttraining.com/reach-ui/combobox#comboboxinput-autocomplete
   */
  autocomplete?: boolean;
  /**
   * @see Docs https://reacttraining.com/reach-ui/combobox#comboboxinput-value
   */
  value?: ComboboxValue;
};

////////////////////////////////////////////////////////////////////////////////

/**
 * ComboboxPopover
 *
 * Contains the popup that renders the list. Because some UI needs to render
 * more than the list in the popup, you need to render one of these around the
 * list. For example, maybe you want to render the number of results suggested.
 *
 * @see Docs https://reacttraining.com/reach-ui/combobox#comboboxpopover
 */
const ComboboxPopoverImpl = forwardRef<
  HTMLDivElement,
  ComboboxPopoverProps & Partial<PopoverProps>
>(function ComboboxPopover(
  { children, portal = true, onKeyDown, onBlur, ...props },
  forwardedRef: React.Ref<any>
) {
  let { popoverRef, inputRef, isExpanded } = useContext(ComboboxContext);
  let ref = useForkedRef(popoverRef, forwardedRef);
  let handleKeyDown = useKeyDown();
  let handleBlur = useBlur();

  let sharedProps = {
    "data-reach-combobox-popover": "",
    onKeyDown: wrapEvent<any>(onKeyDown, handleKeyDown),
    onBlur: wrapEvent<any>(onBlur, handleBlur),
    // Instead of conditionally rendering the popover we use the `hidden` prop
    // because we don't want to unmount on close (from escape or onSelect).
    // However, the developer can conditionally render the ComboboxPopover if
    // they do want to cause mount/unmount based on the app's own data (like
    // results.length or whatever).
    hidden: !isExpanded,
    tabIndex: -1,
    children,
  };

  return portal ? (
    <Popover
      {...props}
      // @ts-ignore
      ref={ref}
      position={positionMatchWidth}
      targetRef={inputRef}
      {...sharedProps}
    />
  ) : (
    <div ref={ref} {...props} {...sharedProps} />
  );
});

if (__DEV__) {
  ComboboxPopoverImpl.displayName = "ComboboxPopover";
}

export const ComboboxPopover = React.memo(ComboboxPopoverImpl);

/**
 * @see Docs https://reacttraining.com/reach-ui/combobox#comboboxpopover-props
 */
export type ComboboxPopoverProps = {
  /**
   * If you pass `<ComboboxPopover portal={false} />` the popover will not
   * render inside of a portal, but in the same order as the React tree. This
   * is mostly useful for styling the entire component together, like the pink
   * focus outline in the example earlier in this page.
   *
   * @see Docs https://reacttraining.com/reach-ui/combobox#comboboxpopover-portal
   */
  portal?: boolean;
};

////////////////////////////////////////////////////////////////////////////////

/**
 * ComboboxList
 *
 * Contains the `ComboboxOption` elements and sets up the proper aria attributes
 * for the list.
 *
 * @see Docs https://reacttraining.com/reach-ui/combobox#comboboxlist
 */
export const ComboboxList = forwardRefWithAs<ComboboxListProps, "ul">(
  function ComboboxList(
    {
      // when true, and the list opens again, the option with a matching value
      // will be automatically highlighted.
      persistSelection = false,
      as: Comp = "ul",
      ...props
    },
    forwardedRef
  ) {
    let { persistSelectionRef, listboxId } = useContext(ComboboxContext);

    React.useEffect(() => {
      persistSelectionRef.current = persistSelection;
    }, [persistSelectionRef, persistSelection]);

    return (
      <Comp
        role="listbox"
        {...props}
        ref={forwardedRef}
        data-reach-combobox-list=""
        id={listboxId}
      />
    );
  }
);

/**
 * @see Docs https://reacttraining.com/reach-ui/combobox#comboboxlist-props
 */
export type ComboboxListProps = {
  /**
   * Defaults to false. When true and the list is opened, if an option's value
   * matches the value in the input, it will automatically be highlighted and
   * be the starting point for any keyboard navigation of the list.
   *
   * This allows you to treat a Combobox more like a `<select>` than an
   * `<input/>`, but be mindful that the user is still able to put any
   * arbitrary value into the input, so if the only valid values for the input
   * are from the list, your app will need to do that validation on blur or
   * submit of the form.
   *
   * @see Docs https://reacttraining.com/reach-ui/combobox#comboboxlist-persistselection
   */
  persistSelection?: boolean;
};

if (__DEV__) {
  ComboboxList.displayName = "ComboboxList";
}

////////////////////////////////////////////////////////////////////////////////

/**
 * ComboboxOption
 *
 * An option that is suggested to the user as they interact with the combobox.
 *
 * @see Docs https://reacttraining.com/reach-ui/combobox#comboboxoption
 */
export const ComboboxOption = forwardRefWithAs<ComboboxOptionProps, "li">(
  function ComboboxOption(
    { as: Comp = "li", children, value, onClick, ...props },
    forwardedRef: React.Ref<any>
  ) {
    let {
      onSelect,
      data: { navigationValue },
      send,
    } = useContext(ComboboxContext);

    let ownRef = useRef<HTMLElement | null>(null);
    let ref = useForkedRef(forwardedRef, ownRef);

    let index = useDescendant(
      {
        element: ownRef.current!,
        value,
      },
      ComboboxDescendantContext
    );

    let isActive = navigationValue === value;

    function handleClick() {
      onSelect && onSelect(value);
      send({ type: ComboboxEvents.SelectWithClick, value });
    }

    return (
      <OptionContext.Provider value={{ value, index }}>
        <Comp
          aria-selected={isActive}
          role="option"
          {...props}
          data-reach-combobox-option=""
          ref={ref}
          id={String(makeHash(value))}
          data-highlighted={isActive ? "" : undefined}
          // Without this the menu will close from `onBlur`, but with it the
          // element can be `document.activeElement` and then our focus checks in
          // onBlur will work as intended
          tabIndex={-1}
          onClick={wrapEvent(onClick, handleClick)}
          children={children || <ComboboxOptionText />}
        />
      </OptionContext.Provider>
    );
  }
);

/**
 * @see Docs https://reacttraining.com/reach-ui/combobox#comboboxoption-props
 */
export type ComboboxOptionProps = {
  /**
   * Optional. If omitted, the `value` will be used as the children like as:
   * `<ComboboxOption value="Seattle, Tacoma, Washington" />`. But if you need
   * to control a bit more, you can put whatever children you want, but make
   * sure to render a `ComboboxOptionText` as well, so the value is still
   * displayed with the text highlighting on the matched portions.
   *
   * @example
   *   <ComboboxOption value="Apple" />
   *     🍎 <ComboboxOptionText />
   *   </ComboboxOption>
   *
   * @see Docs https://reacttraining.com/reach-ui/combobox#comboboxoption-children
   */
  children?: React.ReactNode;
  /**
   * The value to match against when suggesting.
   *
   * @see Docs https://reacttraining.com/reach-ui/combobox#comboboxoption-value
   */
  value: string;
};

if (__DEV__) {
  ComboboxOption.displayName = "ComboboxOption";
}

////////////////////////////////////////////////////////////////////////////////

/**
 * ComboboxOptionText
 *
 * Renders the value of a `ComboboxOption` as text but with spans wrapping the
 * matching and non-matching segments of text.
 *
 * We don't forwardRef or spread props because we render multiple spans or null,
 * should be fine 🤙
 *
 * @example
 *   <ComboboxOption value="Seattle">
 *     🌧 <ComboboxOptionText />
 *   </ComboboxOption>
 *
 * @see Docs https://reacttraining.com/reach-ui/combobox#comboboxoptiontext
 */
export function ComboboxOptionText() {
  let { value } = useContext(OptionContext);
  let {
    data: { value: contextValue },
  } = useContext(ComboboxContext);

  let results = useMemo(
    () =>
      findAll({
        searchWords: escapeRegexp(contextValue || "").split(/\s+/),
        textToHighlight: value,
      }),
    [contextValue, value]
  );

  return (
    <>
      {results.length
        ? results.map((result, index) => {
            let str = value.slice(result.start, result.end);
            return (
              <span
                key={index}
                data-user-value={result.highlight ? true : undefined}
                data-suggested-value={result.highlight ? undefined : true}
              >
                {str}
              </span>
            );
          })
        : value}
    </>
  );
}

if (__DEV__) {
  ComboboxOptionText.displayName = "ComboboxOptionText";
}

////////////////////////////////////////////////////////////////////////////////

/**
 * ComboboxButton
 */
export const ComboboxButton = forwardRefWithAs<{}, "button">(
  function ComboboxButton(
    {
      as: Comp = "button",
      onClick,
      onKeyDown,
      onMouseDown,
      onTouchStart,
      ...props
    },
    forwardedRef
  ) {
    let {
      send,
      buttonRef,
      listboxId,
      isExpanded,
      persistSelectionRef,
      state,
    } = useContext(ComboboxContext);
    let ref = useForkedRef(buttonRef, forwardedRef);

    // When a user starts clicking the button, the blur event fires and closes
    // the popover if it's open. When a click finishes, the next click event
    // fires then reopens the menu. So we'll track the click in this pointer
    // and only fire the ClickButton event when the click is intended.
    let clickStarted = React.useRef(false);

    function handleMouseDown() {
      if (state !== ComboboxStates.Idle) {
        clickStarted.current = true;
      }
    }

    let handleKeyDown = useKeyDown();

    function handleClick() {
      if (!clickStarted.current) {
        send({
          type: ComboboxEvents.ClickButton,
          persistSelection: persistSelectionRef.current,
        });
      }
      clickStarted.current = false;
    }

    useEffect(() => {
      window.addEventListener("mouseup", handler);
      window.addEventListener("touchend", handler);
      function handler(event: any) {
        if (
          event.target !== buttonRef.current &&
          !buttonRef.current?.contains(event.target)
        ) {
          clickStarted.current = false;
        }
      }
      return () => {
        window.removeEventListener("mouseup", handler);
        window.removeEventListener("touchend", handler);
      };
    }, [buttonRef]);

    return (
      <Comp
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-expanded={isExpanded}
        {...props}
        data-reach-combobox-button=""
        ref={ref}
        onClick={wrapEvent(onClick, handleClick)}
        onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
        onMouseDown={wrapEvent(onMouseDown, handleMouseDown)}
        onTouchStart={wrapEvent(onTouchStart, handleMouseDown)}
      />
    );
  }
);

if (__DEV__) {
  ComboboxButton.displayName = "ComboboxButton";
}

////////////////////////////////////////////////////////////////////////////////

/**
 * We want the same events when the input or the popup have focus (HOW COOL ARE
 * HOOKS BTW?) This is probably the hairiest piece but it's not bad.
 */
function useKeyDown() {
  let {
    data: { navigationValue },
    onSelect,
    state,
    send,
    autocompletePropRef,
    persistSelectionRef,
  } = useContext(ComboboxContext);

  let options = useDescendants(ComboboxDescendantContext);

  return function handleKeyDown(event: React.KeyboardEvent) {
    let index = options.findIndex(({ value }) => value === navigationValue);

    function getNextOption() {
      let atBottom = index === options.length - 1;
      if (atBottom) {
        if (autocompletePropRef.current) {
          // Go back to the value the user has typed because we are
          // autocompleting and they need to be able to get back to what
          // they had typed w/o having to backspace out.
          return null;
        } else {
          // cycle through
          return getFirstOption();
        }
      } else {
        // Go to the next item in the list
        return options[(index + 1) % options.length];
      }
    }

    function getPreviousOption() {
      let atTop = index === 0;
      if (atTop) {
        if (autocompletePropRef.current) {
          // Go back to the value the user has typed because we are
          // autocompleting and they need to be able to get back to what
          // they had typed w/o having to backspace out.
          return null;
        } else {
          // cycle through
          return getLastOption();
        }
      } else if (index === -1) {
        // displaying the user's value, so go select the last one
        return getLastOption();
      } else {
        // normal case, select previous
        return options[(index - 1 + options.length) % options.length];
      }
    }

    function getFirstOption() {
      return options[0];
    }

    function getLastOption() {
      return options[options.length - 1];
    }

    switch (event.key) {
      case "ArrowDown":
        // Don't scroll the page
        event.preventDefault();
        if (!options || !options.length) {
          return;
        }

        send({
          type: ComboboxEvents.Navigate,
          value: getNextOption()?.value || null,
          persistSelection: persistSelectionRef.current,
        });
        break;

      // A lot of duplicate code with ArrowDown up next, I'm already over it.
      case "ArrowUp":
        // Don't scroll the page
        event.preventDefault();
        if (!options || options.length === 0) {
          return;
        }

        send({
          type: ComboboxEvents.Navigate,
          value: getPreviousOption()?.value || null,
          persistSelection: persistSelectionRef.current,
        });
        break;

      case "Home":
      case "PageUp":
        // Don't scroll the page
        event.preventDefault();
        if (!options || options.length === 0) {
          return;
        }

        send({
          type: ComboboxEvents.Navigate,
          value: getFirstOption().value,
        });
        break;

      case "End":
      case "PageDown":
        // Don't scroll the page
        event.preventDefault();
        if (!options || options.length === 0) {
          return;
        }

        send({
          type: ComboboxEvents.Navigate,
          value: getLastOption().value,
        });
        break;

      case "Escape":
        send(ComboboxEvents.Escape);
        break;
      case "Enter":
        send({
          type: ComboboxEvents.SelectWithKeyboard,
          event: event.nativeEvent,
          onSelect,
          navigationValue,
        });
        break;
    }
  };
}

function useBlur() {
  let { state, send, popoverRef, inputRef, buttonRef } = useContext(
    ComboboxContext
  );

  return function handleBlur() {
    let ownerDocument = getOwnerDocument(inputRef.current) || document;
    requestAnimationFrame(() => {
      // we on want to close only if focus propss outside the combobox
      if (
        ownerDocument.activeElement !== inputRef.current &&
        ownerDocument.activeElement !== buttonRef.current &&
        popoverRef.current
      ) {
        if (popoverRef.current.contains(ownerDocument.activeElement)) {
          // focus landed inside the combobox, keep it open
          if (state !== ComboboxStates.Interacting) {
            send(ComboboxEvents.Interact);
          }
        } else {
          // focus landed outside the combobox, close it.
          send(ComboboxEvents.Blur);
        }
      }
    });
  };
}

function popoverIsExpanded(state: ComboboxStates) {
  return [
    ComboboxStates.Suggesting,
    ComboboxStates.Navigating,
    ComboboxStates.Interacting,
  ].includes(state);
}

/**
 * We don't want to track the active descendant with indices because nothing is
 * more annoying in a combobox than having it change values RIGHT AS YOU HIT
 * ENTER. That only happens if you use the index as your data, rather than
 * *your data as your data*. We use this to generate a unique ID based on the
 * value of each item. This function is short, sweet, and good enough™ (I also
 * don't know how it works, tbqh)
 *
 * @see https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
 * @param str
 */
function makeHash(str: string) {
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
}

/**
 * Escape regexp special characters in `str`
 *
 * @see https://github.com/component/escape-regexp/blob/5ce923c1510c9802b3da972c90b6861dd2829b6b/index.js
 * @param str
 */
function escapeRegexp(str: string) {
  return String(str).replace(/([.*+?=^!:${}()|[\]/\\])/g, "\\$1");
}

////////////////////////////////////////////////////////////////////////////////

/**
 * A hook that exposes data for a given `Combobox` component to its descendants.
 *
 * @see Docs https://reacttraining.com/reach-ui/combobox#usecomboboxcontext
 */
export function useComboboxContext(): ComboboxContextValue {
  let { isExpanded, comboboxId } = useContext(ComboboxContext);
  return useMemo(
    () => ({
      id: comboboxId,
      isExpanded,
    }),
    [comboboxId, isExpanded]
  );
}

////////////////////////////////////////////////////////////////////////////////

// Well alright, you made it all the way here to like 1100 lines of code (geez,
// what the heck?). Have a great day :D

////////////////////////////////////////////////////////////////////////////////
// Types

export type ComboboxContextValue = {
  id: string | undefined;
  isExpanded: boolean;
};

export type ComboboxDescendant = Descendant<HTMLElement> & {
  value: ComboboxValue;
};

interface ComboboxOptionContextValue {
  value: ComboboxValue;
  index: number;
}

interface InternalComboboxContextValue {
  ariaLabel?: string;
  ariaLabelledby?: string;
  autocompletePropRef: React.MutableRefObject<any>;
  buttonRef: React.MutableRefObject<any>;
  comboboxId: string | undefined;
  data: ComboboxStateData;
  inputRef: React.MutableRefObject<any>;
  isExpanded: boolean;
  listboxId: string;
  onSelect(value?: ComboboxValue): any;
  openOnFocus: boolean;
  persistSelectionRef: React.MutableRefObject<any>;
  popoverRef: React.MutableRefObject<any>;
  send: StateMachine.Service<
    ComboboxStateData,
    DistributiveOmit<ComboboxEvent, "refs">
  >["send"];
  state: ComboboxStates;
}

export type ComboboxValue = string;
