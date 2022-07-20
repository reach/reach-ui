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
  createContext,
  makeId,
  useComposedRefs,
  composeEventHandlers,
  useControlledState,
} from "@reach/utils";
import type { Polymorphic } from "@reach/utils";
import { useId } from "@reach/auto-id";

const [DisclosureProvider, useDisclosureCtx] =
  createContext<DisclosureContextValue>("Disclosure");

////////////////////////////////////////////////////////////////////////////////

enum DisclosureStates {
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
const Disclosure: React.FC<DisclosureProps> = ({
  children,
  defaultOpen = false,
  onChange,
  open: openProp,
  ...props
}) => {
  let id = useId(props.id ?? "disclosure");
  let panelId = makeId("panel", id);

  let [open, setOpen] = useControlledState({
    controlledValue: openProp,
    defaultValue: defaultOpen,
    calledFrom: "Disclosure",
  });

  function onSelect() {
    onChange?.();
    setOpen((open) => !open);
  }

  return (
    <DisclosureProvider
      disclosureId={id}
      onSelect={onSelect}
      open={open}
      panelId={panelId}
    >
      {children}
    </DisclosureProvider>
  );
};

interface DisclosureProps {
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
}

Disclosure.displayName = "Disclosure";

////////////////////////////////////////////////////////////////////////////////

/**
 * DisclosureButton
 *
 * The trigger button a user clicks to interact with a disclosure.
 *
 * @see Docs https://reach.tech/disclosure#disclosurebutton
 */
const DisclosureButton = React.forwardRef(function DisclosureButton(
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
  const { onSelect, open, panelId } = useDisclosureCtx("DisclosureButton");
  const ownRef = React.useRef<HTMLElement | null>(null);

  const ref = useComposedRefs(forwardedRef, ownRef);

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
      onClick={composeEventHandlers(onClick, handleClick)}
    >
      {children}
    </Comp>
  );
}) as Polymorphic.ForwardRefComponent<"button", DisclosureButtonProps>;

/**
 * @see Docs https://reach.tech/disclosure#disclosurebutton-props
 */
interface DisclosureButtonProps {
  /**
   * Typically a text string that serves as a label for the disclosure button,
   * though nested DOM nodes can be passed as well so long as they are valid
   * children of interactive elements.
   *
   * @see https://adrianroselli.com/2016/12/be-wary-of-nesting-roles.html
   * @see Docs https://reach.tech/disclosure#disclosurebutton-children
   */
  children: React.ReactNode;
}

DisclosureButton.displayName = "DisclosureButton";

////////////////////////////////////////////////////////////////////////////////

/**
 * DisclosurePanel
 *
 * The collapsible panel in which inner content for an disclosure item is
 * rendered.
 *
 * @see Docs https://reach.tech/disclosure#disclosurepanel
 */
const DisclosurePanel = React.forwardRef(function DisclosurePanel(
  { as: Comp = "div", children, ...props },
  forwardedRef
) {
  const { panelId, open } = useDisclosureCtx("DisclosurePanel");

  return (
    <Comp
      ref={forwardedRef}
      hidden={!open}
      {...props}
      data-reach-disclosure-panel=""
      data-state={open ? DisclosureStates.Open : DisclosureStates.Collapsed}
      id={panelId}
    >
      {children}
    </Comp>
  );
}) as Polymorphic.ForwardRefComponent<"div", DisclosurePanelProps>;

DisclosurePanel.displayName = "DisclosurePanel";

/**
 * @see Docs https://reach.tech/disclosure#disclosurepanel-props
 */
interface DisclosurePanelProps {
  /**
   * Inner collapsible content for the disclosure item.
   *
   * @see Docs https://reach.tech/disclosure#disclosurepanel-children
   */
  children: React.ReactNode;
}

////////////////////////////////////////////////////////////////////////////////

/**
 * A hook that exposes data for a given `Disclosure` component to its
 * descendants.
 *
 * @see Docs https://reach.tech/disclosure#usedisclosurecontext
 */
function useDisclosureContext() {
  let { open, panelId, disclosureId } = useDisclosureCtx(
    "useDisclosureContext"
  );
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
  disclosureId: string | number;
  onSelect(): void;
  open: boolean;
  panelId: string;
}

////////////////////////////////////////////////////////////////////////////////
// Exports

export type { DisclosureButtonProps, DisclosurePanelProps, DisclosureProps };
export {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  DisclosureStates,
  useDisclosureContext,
};
