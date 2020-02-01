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
 * @see Docs     https://reacttraining.com/reach-ui/disclosure
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/disclosure
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.1/#disclosure
 */

import React, { forwardRef, useContext, useRef, useState } from "react";
import {
  createNamedContext,
  forwardRefWithAs,
  makeId,
  useForkedRef,
  wrapEvent,
} from "@reach/utils";
import { useId } from "@reach/auto-id";
import PropTypes from "prop-types";
import warning from "warning";

const DisclosureContext = createNamedContext<IDisclosureContext>(
  "DisclosureContext",
  {} as IDisclosureContext
);
const useDisclosureContext = () => useContext(DisclosureContext);

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
 * @see Docs https://reacttraining.com/reach-ui/disclosure#disclosure-1
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
  const { current: isControlled } = useRef(wasControlled);

  const id =
    useId(props.id != null ? String(props.id) : undefined) || "disclosure";
  const panelId = makeId("panel", id);

  const [open, setOpen] = useState(
    isControlled ? (openProp as boolean) : defaultOpen
  );

  if (__DEV__) {
    warning(
      !((isControlled && !wasControlled) || (!isControlled && wasControlled)),
      "Disclosure is changing from controlled to uncontrolled. Disclosure should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled Disclosure for the lifetime of the component. Check the `open` prop being passed in."
    );
  }

  function onSelect() {
    onChange && onChange();
    if (!isControlled) {
      setOpen(!open);
    }
  }

  const context: IDisclosureContext = {
    disclosureId: id,
    onSelect,
    open,
    panelId,
  };

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

export type DisclosureProps = {
  /**
   * `Disclosure` expects to receive accept `DisclosureButton` and
   * `DisclosurePanel` components as children. It can also accept wrapper
   * elements if desired, though it is not recommended to pass other arbitrary
   * components within a disclosure in most cases.
   *
   * @see Docs https://reacttraining.com/reach-ui/disclosure#disclosure-children
   */
  children: React.ReactNode;
  /**
   * Whether or not an uncontrolled disclosure component should default to its
   * `open` state on the initial render.
   *
   * @see Docs https://reacttraining.com/reach-ui/disclosure#disclosure-defaultopen
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
   * @see Docs https://reacttraining.com/reach-ui/disclosure#disclosure-id
   */
  id?: React.ReactText;
  /**
   * The callback that is fired when a disclosure's open state is changed.
   *
   * @see Docs https://reacttraining.com/reach-ui/disclosure#disclosure-onchange
   */
  onChange?(): void;
  /**
   * The controlled open state of the disclosure. The `open` prop should be used
   * along with `onChange` to create controlled disclosure components.
   *
   * @see Docs https://reacttraining.com/reach-ui/disclosure#disclosure-open
   */
  open?: boolean;
};

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
 * @see Docs https://reacttraining.com/reach-ui/disclosure#disclosurebutton
 */
export const DisclosureButton = forwardRefWithAs<
  DisclosureButtonProps,
  "button"
>(function DisclosureButton(
  {
    as: Comp = "button",
    children,
    onClick,
    onMouseDown,
    onPointerDown,
    ...props
  },
  forwardedRef
) {
  const { onSelect, open, panelId } = useDisclosureContext();
  const ownRef = useRef<HTMLElement | null>(null);

  const ref = useForkedRef(forwardedRef, ownRef);

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    ownRef.current && ownRef.current.focus();
    onSelect();
  }

  return (
    <Comp
      aria-controls={panelId}
      aria-expanded={open}
      {...props}
      ref={ref}
      onClick={wrapEvent(onClick, handleClick)}
      data-reach-disclosure-trigger=""
      data-state={open ? DisclosureStates.Open : DisclosureStates.Collapsed}
    >
      {children}
    </Comp>
  );
});

/**
 * @see Docs https://reacttraining.com/reach-ui/disclosure#disclosurebutton-props
 */
export type DisclosureButtonProps = {
  /**
   * Typically a text string that serves as a label for the disclosure button,
   * though nested DOM nodes can be passed as well so long as they are valid
   * children of interactive elements.
   *
   * @see https://adrianroselli.com/2016/12/be-wary-of-nesting-roles.html
   * @see Docs https://reacttraining.com/reach-ui/disclosure#disclosurebutton-children
   */
  children: React.ReactNode;
};

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
 * @see Docs https://reacttraining.com/reach-ui/disclosure#disclosurepanel
 */
export const DisclosurePanel = forwardRef<HTMLDivElement, DisclosurePanelProps>(
  function DisclosurePanel({ children, ...props }, forwardedRef) {
    const { panelId, open } = useDisclosureContext();

    return (
      <div
        ref={forwardedRef}
        hidden={!open}
        {...props}
        data-reach-disclosure-panel=""
        data-state={open ? DisclosureStates.Open : DisclosureStates.Collapsed}
        id={panelId}
        tabIndex={-1}
      >
        {children}
      </div>
    );
  }
);

if (__DEV__) {
  DisclosurePanel.displayName = "DisclosurePanel";
  DisclosurePanel.propTypes = {};
}

/**
 * @see Docs https://reacttraining.com/reach-ui/disclosure#disclosurepanel-props
 */
type DisclosurePanelProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Inner collapsible content for the disclosure item.
   *
   * @see Docs https://reacttraining.com/reach-ui/disclosure#disclosurepanel-children
   */
  children: React.ReactNode;
};

////////////////////////////////////////////////////////////////////////////////
// Types

interface IDisclosureContext {
  disclosureId: string;
  onSelect(): void;
  open: boolean;
  panelId: string;
}
