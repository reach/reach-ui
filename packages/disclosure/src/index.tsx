////////////////////////////////////////////////////////////////////////////////
// Welcome to @reach/disclosure!

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useRef,
  useState
} from "react";
import {
  forwardRefWithAs,
  makeId,
  wrapEvent,
  useForkedRef
} from "@reach/utils";
import { useId } from "@reach/auto-id";
import PropTypes from "prop-types";
import warning from "warning";

// A11y reference:
//   - https://www.w3.org/TR/wai-aria-practices/examples/disclosure/disclosure-faq.html

// TODO: Screen reader testing

const DisclosureContext = createContext<IDisclosureContext>(
  {} as IDisclosureContext
);
const useDisclosureContext = () => useContext(DisclosureContext);

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

Disclosure.displayName = "Disclosure";
if (__DEV__) {
  Disclosure.propTypes = {
    children: PropTypes.node.isRequired,
    onChange: PropTypes.func,
    open: PropTypes.bool
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * DisclosureTrigger
 */
export const DisclosureTrigger = forwardRefWithAs<
  "button",
  DisclosureTriggerProps
>(function DisclosureTrigger(
  {
    as: Comp = "button",
    children,
    onClick,
    onKeyDown,
    onMouseDown,
    onPointerDown,
    ...props
  },
  forwardedRef
) {
  const { onSelect, open, panelId } = useDisclosureContext();

  /*
   * If the user decides to use a div instead of a native button, we check the
   * ref's node type after it mounts to the DOM in order to shim the necessary
   * attributes.
   */
  const [isButtonElement, setIsButtonElement] = useState(Comp === "button");
  const ownRef = useRef<HTMLElement | null>(null);
  const setButtonRef = useCallback(
    node => {
      ownRef.current = node;
      if (node && Comp !== "button") {
        setIsButtonElement(node.nodeName === "BUTTON");
      }
    },
    [Comp]
  );
  const buttonAttributeProps = isButtonElement
    ? {}
    : {
        role: "button",
        tabIndex: 0
      };

  const ref = useForkedRef(forwardedRef, setButtonRef);

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    ownRef.current && ownRef.current.focus();
    onSelect();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    const { key } = event;
    if (!isButtonElement && (key === " " || key === "Enter")) {
      event.preventDefault();
      ownRef.current && ownRef.current.click();
    }
  }

  return (
    <Comp
      ref={ref}
      aria-controls={panelId}
      aria-expanded={open}
      data-reach-disclosure-trigger=""
      data-open={open ? "" : undefined}
      onClick={wrapEvent(onClick, handleClick)}
      onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
      {...buttonAttributeProps}
      {...props}
    >
      {children}
    </Comp>
  );
});

type DisclosureTriggerProps = {};

DisclosureTrigger.displayName = "DisclosureTrigger";
if (__DEV__) {
  DisclosureTrigger.propTypes = {
    as: PropTypes.any,
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * DisclosurePanel
 */
export const DisclosurePanel = forwardRef<HTMLDivElement>(
  function DisclosurePanel({ children, ...props }, forwardedRef) {
    const { panelId, open } = useDisclosureContext();

    return (
      <div
        ref={forwardedRef}
        data-reach-disclosure-panel=""
        data-open={open ? "" : undefined}
        hidden={!open}
        id={panelId}
        tabIndex={-1}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DisclosurePanel.displayName = "DisclosurePanel";
if (__DEV__) {
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
