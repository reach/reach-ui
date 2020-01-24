/**
 * Welcome to @reach/disclosure!
 *
 * TODO: Screen reader testing
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
  wrapEvent
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
  Collapsed = "collapsed"
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Disclosure
 *
 * @param props
 */
type DisclosureProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
  onChange?(): void;
  open?: boolean;
  id?: React.ReactText;
};
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
    panelId
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

if (__DEV__) {
  Disclosure.displayName = "Disclosure";
  Disclosure.propTypes = {
    children: PropTypes.node.isRequired,
    onChange: PropTypes.func,
    open: PropTypes.bool
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * DisclosureButton
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
      ref={ref}
      {...props}
      onClick={wrapEvent(onClick, handleClick)}
      aria-controls={panelId}
      aria-expanded={open}
      data-reach-disclosure-trigger=""
      data-state={open ? DisclosureStates.Open : DisclosureStates.Collapsed}
    >
      {children}
    </Comp>
  );
});

type DisclosureButtonProps = {};

if (__DEV__) {
  DisclosureButton.displayName = "DisclosureButton";
  DisclosureButton.propTypes = {
    as: PropTypes.any,
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * DisclosurePanel
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

type DisclosurePanelProps = React.HTMLAttributes<HTMLDivElement> & {};

////////////////////////////////////////////////////////////////////////////////
// Types

interface IDisclosureContext {
  disclosureId: string;
  onSelect(): void;
  open: boolean;
  panelId: string;
}
