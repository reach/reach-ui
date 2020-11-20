/**
 * Welcome to @reach/disclosure!
 *
 * A disclosure is a button that controls visibility of a panel of content. When
 * the content inside the panel is hidden, it is often styled as a typical push
 * button with a right-pointing arrow or triangle to hint that activating the
 * button will display additional content. When the content is visible, the
 * arrow or triangle typically points down.
 *
 * If you have a group of disclosures that stack vertically and exist within the
 * same logical context, you may want to use @reach/accordion instead.
 *
 * @see Docs     https://reach.tech/disclosure
 * @see Source   https://github.com/reach/reach-ui/tree/main/packages/disclosure
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#disclosure
 */

import * as React from "react";
import {
  createNamedContext,
  forwardRefWithAs,
  makeId,
  useForkedRef,
  warning,
  wrapEvent,
} from "@reach/utils";
import { useId } from "@reach/auto-id";
import PropTypes from "prop-types";

const DisclosureContext = createNamedContext<DisclosureContextValue>(
  "DisclosureContext",
  {} as DisclosureContextValue
);

////////////////////////////////////////////////////////////////////////////////

export enum DisclosureStates {
  Open = "open",
  Collapsed = "collapsed",
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Disclosure
 *
 * The wrapper component and context provider for a disclosure's button and
 * panel components. A disclosure should only have one button and one panel
 * descendant.
 *
 * @see Docs https://reach.tech/disclosure#disclosure-1
 *
 * @param props
 */
export const Disclosure: React.FC<DisclosureProps> = ({
  children,
  defaultOpen = false,
  onChange,
  open: openProp,
  ...props
}) => {
  /*
   * You shouldn't switch between controlled/uncontrolled. We'll check for a
   * controlled component and track any changes in a ref to show a warning.
   */
  const wasControlled = openProp != null;
  const { current: isControlled } = React.useRef(wasControlled);

  const id =
    useId(props.id != null ? String(props.id) : undefined) || "disclosure";
  const panelId = makeId("panel", id);

  const [open, setOpen] = React.useState(
    isControlled ? (openProp as boolean) : defaultOpen
  );

  if (__DEV__) {
    warning(
      !((isControlled && !wasControlled) || (!isControlled && wasControlled)),
      "Disclosure is changing from controlled to uncontrolled. Disclosure should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled Disclosure for the lifetime of the component. Check the `open` prop being passed in."
    );
  }

  const stableOnChange = useStableCallback(onChange);

  const onSelect = React.useCallback(
    function onSelect() {
      stableOnChange();
      if (!isControlled) {
        setOpen((open) => !open);
      }
    },
    [stableOnChange, isControlled]
  );

  const context: DisclosureContextValue = React.useMemo(
    () => ({
      disclosureId: id,
      onSelect,
      open,
      panelId,
    }),
    [onSelect, id, open, panelId]
  );

  if (isControlled && openProp !== open) {
    /*
     * If the component is controlled, we'll sync internal state with the
     * controlled state
     */
    setOpen(openProp as boolean);
  }

  return (
    <DisclosureContext.Provider value={context}>
      {children}
    </DisclosureContext.Provider>
  );
};

export type DisclosureOwnProps = {
  /**
   * `Disclosure` expects to receive accept `DisclosureButton` and
   * `DisclosurePanel` components as children. It can also accept wrapper
   * elements if desired, though it is not recommended to pass other arbitrary
   * components within a disclosure in most cases.
   *
   * @see Docs https://reach.tech/disclosure#disclosure-children
   */
  children: React.ReactNode;
  /**
   * Whether or not an uncontrolled disclosure component should default to its
   * `open` state on the initial render.
   *
   * @see Docs https://reach.tech/disclosure#disclosure-defaultopen
   */
  defaultOpen?: boolean;
  /**
   * An id used to assign aria and id attributes to nested `DisclosureButton`
   * and `DisclosurePanel` components.
   *
   * Since the Disclosure component itself does not render a DOM element, an
   * `id` prop will not appear in the DOM directly as may be expected. Rather,
   * we need to generate IDs for the panel and button based on a disclosure ID
   * for aria compliance. If no `id` is passed we will generate descendant IDs
   * for you.
   *
   * @see Docs https://reach.tech/disclosure#disclosure-id
   */
  id?: React.ReactText;
  /**
   * The callback that is fired when a disclosure's open state is changed.
   *
   * @see Docs https://reach.tech/disclosure#disclosure-onchange
   */
  onChange?(): void;
  /**
   * The controlled open state of the disclosure. The `open` prop should be used
   * along with `onChange` to create controlled disclosure components.
   *
   * @see Docs https://reach.tech/disclosure#disclosure-open
   */
  open?: boolean;
};
export type DisclosureProps = DisclosureOwnProps;

if (__DEV__) {
  Disclosure.displayName = "Disclosure";
  Disclosure.propTypes = {
    children: PropTypes.node.isRequired,
    defaultOpen: PropTypes.bool,
    onChange: PropTypes.func,
    open: PropTypes.bool,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * DisclosureButton
 *
 * The trigger button a user clicks to interact with a disclosure.
 *
 * @see Docs https://reach.tech/disclosure#disclosurebutton
 */
export const DisclosureButton = forwardRefWithAs<
  DisclosureButtonProps,
  "button"
>(function DisclosureButton(
  {
    // The element that shows and hides the content has role `button`.
    // https://www.w3.org/TR/wai-aria-practices-1.2/#disclosure
    as: Comp = "button",
    children,
    onClick,
    onMouseDown,
    onPointerDown,
    ...props
  },
  forwardedRef
) {
  const { onSelect, open, panelId } = React.useContext(DisclosureContext);
  const ownRef = React.useRef<HTMLElement | null>(null);

  const ref = useForkedRef(forwardedRef, ownRef);

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    ownRef.current && ownRef.current.focus();
    onSelect();
  }

  return (
    <Comp
      // Optionally, the element with role `button` has a value specified for
      // `aria-controls` that refers to the element that contains all the
      // content that is shown or hidden.
      // https://www.w3.org/TR/wai-aria-practices-1.2/#disclosure
      aria-controls={panelId}
      // When the content is visible, the element with role `button` has
      // `aria-expanded` set to `true`. When the content area is hidden, it is
      // set to `false`.
      // https://www.w3.org/TR/wai-aria-practices-1.2/#disclosure
      aria-expanded={open}
      {...props}
      data-reach-disclosure-button=""
      data-state={open ? DisclosureStates.Open : DisclosureStates.Collapsed}
      ref={ref}
      onClick={wrapEvent(onClick, handleClick)}
    >
      {children}
    </Comp>
  );
});

type DisclosureButtonDOMProps = Omit<
  React.ComponentProps<"button">,
  keyof DisclosureButtonOwnProps
>;
/**
 * @see Docs https://reach.tech/disclosure#disclosurebutton-props
 */
export type DisclosureButtonOwnProps = {
  /**
   * Typically a text string that serves as a label for the disclosure button,
   * though nested DOM nodes can be passed as well so long as they are valid
   * children of interactive elements.
   *
   * @see https://adrianroselli.com/2016/12/be-wary-of-nesting-roles.html
   * @see Docs https://reach.tech/disclosure#disclosurebutton-children
   */
  children: React.ReactNode;
};
export type DisclosureButtonProps = DisclosureButtonDOMProps &
  DisclosureButtonOwnProps;

if (__DEV__) {
  DisclosureButton.displayName = "DisclosureButton";
  DisclosureButton.propTypes = {
    as: PropTypes.any,
    children: PropTypes.node,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * DisclosurePanel
 *
 * The collapsible panel in which inner content for an disclosure item is
 * rendered.
 *
 * @see Docs https://reach.tech/disclosure#disclosurepanel
 */
export const DisclosurePanel = forwardRefWithAs<DisclosurePanelProps, "div">(
  function DisclosurePanel(
    { as: Comp = "div", children, ...props },
    forwardedRef
  ) {
    const { panelId, open } = React.useContext(DisclosureContext);

    return (
      <Comp
        ref={forwardedRef}
        hidden={!open}
        {...props}
        data-reach-disclosure-panel=""
        data-state={open ? DisclosureStates.Open : DisclosureStates.Collapsed}
        id={panelId}
        tabIndex={-1}
      >
        {children}
      </Comp>
    );
  }
);

if (__DEV__) {
  DisclosurePanel.displayName = "DisclosurePanel";
  DisclosurePanel.propTypes = {};
}

/**
 * @see Docs https://reach.tech/disclosure#disclosurepanel-props
 */
type DisclosurePanelDOMProps = Omit<
  React.ComponentProps<"div">,
  keyof DisclosurePanelOwnProps
>;
export type DisclosurePanelOwnProps = {
  /**
   * Inner collapsible content for the disclosure item.
   *
   * @see Docs https://reach.tech/disclosure#disclosurepanel-children
   */
  children: React.ReactNode;
};
export type DisclosurePanelProps = DisclosurePanelDOMProps &
  DisclosurePanelOwnProps;

////////////////////////////////////////////////////////////////////////////////

/**
 * A hook that exposes data for a given `Disclosure` component to its
 * descendants.
 *
 * @see Docs https://reach.tech/disclosure#usedisclosurecontext
 */
export function useDisclosureContext() {
  let { open, panelId, disclosureId } = React.useContext(DisclosureContext);
  return React.useMemo(
    () => ({
      id: disclosureId,
      panelId,
      open,
    }),
    [disclosureId, open, panelId]
  );
}

////////////////////////////////////////////////////////////////////////////////
// Types

interface DisclosureContextValue {
  disclosureId: string;
  onSelect(): void;
  open: boolean;
  panelId: string;
}

/**
 * Importing this from @reach/utils is breaking the docs site. Unsure why as of
 * yet. Including here in the mean time.
 *
 * Converts a callback to a ref to avoid triggering re-renders when passed as a
 * prop and exposed as a stable function to avoid executing effects when
 * passed as a dependency.
 */
function useStableCallback<T extends (...args: any[]) => any>(
  callback: T | null | undefined
): T {
  let callbackRef = React.useRef(callback);
  React.useEffect(() => {
    callbackRef.current = callback;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback(
    ((...args) => {
      callbackRef.current && callbackRef.current(...args);
    }) as T,
    []
  );
}
