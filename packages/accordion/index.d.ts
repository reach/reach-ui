/**
 * An accessible accordion component.
 *
 * @see Docs     https://reacttraining.com/reach-ui/accordion
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/accordion
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.1/#accordion
 */

import * as React from "react";

////////////////////////////////////////////////////////////////////////////////
// The following types help us deal with the `as` prop.
// I kind of hacked around until I got this to work using some other projects,
// as a rough guide, but it does seem to work so, err, that's cool? Yay TS!
// Anyway, we should consider moving this into @reach/utils since we'll use this
// pattern elsewhere.
// P = additional props
// T = type of component to render

type As<P = any> = React.ElementType<P>;

type PropsWithAs<T extends As, P> = P &
  Omit<React.ComponentPropsWithRef<T>, "as" | keyof P> & {
    as?: T;
  };

interface DynamicComponent<T extends As, P> {
  <TT extends As>(props: PropsWithAs<TT, P> & { as: TT }): JSX.Element;
  (props: PropsWithAs<T, P>): JSX.Element;
}

////////////////////////////////////////////////////////////////////////////////

export interface MenuItemState {
  buttonId: string;
  isOpen: boolean;
  selectionIndex: number;
}

/**
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-props
 */
export type AccordionProps = React.HTMLProps<HTMLDivElement> & {
  /**
   * Requires AccordionItem components as direct children.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-children
   */
  children: React.ReactNode;
  /**
   * A default value for the active index in an uncontrolled component.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-defaultindex
   */
  defaultIndex?: number;
  /**
   * The index or array of indices for active accordion items. Used along with
   * `onChange` to create controlled accordion components.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-index
   */
  index?: number | number[];
  /**
   * Callback that is fired when an accordion item's open state is changed.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-onchange
   */
  onChange?(index?: number): void;
  /**
   * Whether or not an uncontrolled accordion is read-only or controllable by a
   * user interaction.
   *
   * Generally speaking you probably want to avoid this, as
   * is can be confusing especially when navigating by keyboard. However, this
   * may be useful if you want to lock an accordion under certain conditions
   * (perhaps user authentication is required to access the content). In these
   * instances, you may want to include an alert when a user tries to activate
   * a read-only accordion panel to let them know why it does not toggle.
   *
   * TODO: Create example with @reach/alert.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-onchange
   */
  readOnly?: boolean;
  /**
   * Whether or not all panels of an uncontrolled accordion can be toggled
   * to a closed state. By default, an uncontrolled accordion will have an open
   * panel at all times, meaning a panel can only be closed if the user opens
   * another panel. This prop allows the user to close an open panel by clicking
   * its trigger while it is open.
   */
  toggle?: boolean;
};

/**
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordionitem-props
 */
export type AccordionItemProps = React.HTMLProps<HTMLDivElement> & {
  /**
   * Requires AccordionTrigger and AccordionPanel components as direct children.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordionitem-children
   */
  children: React.ReactNode;
  /**
   * Whether or not an accordion panel is disabled from user interaction.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordionitem-disabled
   */
  disabled?: boolean;
};

/**
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordiontrigger-props
 */
export type AccordionTriggerProps = {
  /**
   * Typically a text string that serves as a label for the accordion, though
   * nested DOM nodes can be passed as well so long as they are valid children
   * of interactive elements.
   *
   * @see https://github.com/w3c/html-aria/issues/54
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordiontrigger-children
   */
  children: React.ReactNode;
};

/**
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordionpanel-props
 */
export type AccordionPanelProps = {
  /**
   * Inner content for the accordion item.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordionpanel-children
   */
  children: React.ReactNode;
};

/**
 * The wrapper component for the other components.
 *
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-1
 */
export const Accordion: React.FunctionComponent<AccordionProps>;

/**
 * Wraps a DOM `button` an accordion's trigger and panel components.
 *
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordionitem
 */
export const AccordionItem: React.FunctionComponent<AccordionItemProps>;

/**
 * The trigger button a user clicks to interact with an accordion.
 *
 * Must be a direct child of a `AccordionItem`.
 *
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordiontrigger
 */
export const AccordionTrigger: DynamicComponent<
  "button",
  AccordionTriggerProps
>;

/**
 * The panel in which inner content for an accordion item is rendered.
 *
 * Must be a direct child of a `AccordionItem`.
 *
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordionpanel
 */
export const AccordionPanel: React.FunctionComponent<AccordionPanelProps>;
