/**
 * Welcome to @reach/accordion!
 *
 * TODO: Animation examples
 *
 * @see Docs     https://reach.tech/accordion
 * @see Source   https://github.com/reach/reach-ui/tree/main/packages/accordion
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
 */

import * as React from "react";
import {
	createContext,
	makeId,
	noop,
	useComposedRefs,
	useControlledState,
	composeEventHandlers,
	useStatefulRefValue,
} from "@reach/utils";
import type * as Polymorphic from "@reach/polymorphic";
import {
	createDescendantContext,
	DescendantProvider,
	useDescendant,
	useDescendantKeyDown,
	useDescendantsInit,
} from "@reach/descendants";
import { useId } from "@reach/auto-id";

import type { Descendant } from "@reach/descendants";

const AccordionDescendantContext = createDescendantContext<AccordionDescendant>(
	"AccordionDescendantContext"
);
const [AccordionProvider, useAccordionCtx] =
	createContext<InternalAccordionContextValue>("Accordion");
const [AccordionItemProvider, useAccordionItemCtx] =
	createContext<InternalAccordionItemContextValue>("AccordionItem");

////////////////////////////////////////////////////////////////////////////////

enum AccordionStates {
	Open = "OPEN",
	Collapsed = "COLLAPSED",
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Accordion
 *
 * The wrapper component for all other accordion components. Each accordion
 * component will consist of accordion items whose buttons are keyboard
 * navigable using arrow keys.
 *
 * @see Docs https://reach.tech/accordion#accordion-1
 */
const Accordion = React.forwardRef(function Accordion(
	{
		as: Comp = "div",
		children,
		defaultIndex,
		index: controlledIndex,
		onChange,
		readOnly = false,
		collapsible = false,
		multiple = false,
		...props
	},
	forwardedRef
) {
	let [openPanels, setOpenPanels] = useControlledState({
		controlledValue: controlledIndex,
		defaultValue: () => {
			if (defaultIndex != null) {
				// If multiple is set to true, we need to make sure the `defaultIndex`
				// is an array (and vice versa).
				if (multiple) {
					return Array.isArray(defaultIndex) ? defaultIndex : [defaultIndex];
				} else {
					return Array.isArray(defaultIndex)
						? defaultIndex[0] ?? 0
						: defaultIndex!;
				}
			}

			if (collapsible) {
				// Collapsible accordions with no defaultIndex will start with all
				// panels collapsed.
				return multiple ? [] : -1;
			}

			// Otherwise the first panel will be our default.
			return multiple ? [0] : 0;
		},
		calledFrom: "Tabs",
	});

	let [descendants, setDescendants] = useDescendantsInit<AccordionDescendant>();

	let id = useId(props.id);

	let onSelectPanel = React.useCallback(
		(index: number) => {
			onChange && onChange(index);

			setOpenPanels((prevOpenPanels) => {
				/*
				 * If we're dealing with an uncontrolled component, the index arg
				 * in selectChange will always be a number rather than an array.
				 */
				index = index as number;
				// multiple allowed
				if (multiple) {
					// state will always be an array here
					prevOpenPanels = prevOpenPanels as number[];
					if (
						// User is clicking on an already-open button
						prevOpenPanels.includes(index as number)
					) {
						// Other panels are open OR accordion is allowed to collapse
						if (prevOpenPanels.length > 1 || collapsible) {
							// Close the panel by filtering it from the array
							return prevOpenPanels.filter((i) => i !== index);
						}
					} else {
						// Open the panel by adding it to the array.
						return [...prevOpenPanels, index].sort();
					}
				} else {
					prevOpenPanels = prevOpenPanels as number;
					return prevOpenPanels === index && collapsible ? -1 : index;
				}
				return prevOpenPanels;
			});
		},
		[collapsible, multiple, onChange, setOpenPanels]
	);

	return (
		<DescendantProvider
			context={AccordionDescendantContext}
			items={descendants}
			set={setDescendants}
		>
			<AccordionProvider
				accordionId={id}
				openPanels={openPanels}
				onSelectPanel={readOnly ? noop : onSelectPanel}
				readOnly={readOnly}
			>
				<Comp {...props} ref={forwardedRef} data-reach-accordion="">
					{children}
				</Comp>
			</AccordionProvider>
		</DescendantProvider>
	);
}) as Polymorphic.ForwardRefComponent<"div", AccordionProps>;

/**
 * @see Docs https://reach.tech/accordion#accordion-props
 */
interface AccordionProps {
	/**
	 * `Accordion` can accept `AccordionItem` components as children.
	 *
	 * @see Docs https://reach.tech/accordion#accordion-children
	 */
	children: React.ReactNode;
	/**
	 * Whether or not all panels of an uncontrolled accordion can be toggled
	 * to a closed state. By default, an uncontrolled accordion will have an open
	 * panel at all times, meaning a panel can only be closed if the user opens
	 * another panel. This prop allows the user to collapse all open panels.
	 *
	 * It's important to note that this prop has no impact on controlled
	 * components, since the state of any given accordion panel is managed solely
	 * by the index prop.
	 */
	collapsible?: boolean;
	/**
	 * A default value for the open panel's index or indices in an uncontrolled
	 * accordion component when it is initially rendered.
	 *
	 * @see Docs https://reach.tech/accordion#accordion-defaultindex
	 */
	defaultIndex?: AccordionIndex;
	/**
	 * The index or array of indices for open accordion panels. The `index` props
	 * should be used along with `onChange` to create controlled accordion
	 * components.
	 *
	 * @see Docs https://reach.tech/accordion#accordion-index
	 */
	index?: AccordionIndex;
	/**
	 * The callback that is fired when an accordion item's open state is changed.
	 *
	 * @see Docs https://reach.tech/accordion#accordion-onchange
	 */
	onChange?(index: number): void;
	/**
	 * Whether or not an uncontrolled accordion is read-only or controllable by a
	 * user interaction.
	 *
	 * Generally speaking you probably want to avoid this, as
	 * it can be confusing especially when navigating by keyboard. However, this
	 * may be useful if you want to lock an accordion under certain conditions
	 * (perhaps user authentication is required to access the content). In these
	 * instances, you may want to include an alert when a user tries to activate
	 * a read-only accordion panel to let them know why it does not toggle as may
	 * be expected.
	 *
	 * TODO: Create example with @reach/alert.
	 *
	 * @see Docs https://reach.tech/accordion#accordion-onchange
	 */
	readOnly?: boolean;
	/**
	 * Whether or not multiple panels in an uncontrolled accordion can be opened
	 * at the same time. By default, when a user opens a new panel, the previously
	 * opened panel will close. This prop prevents that behavior.
	 *
	 * It's important to note that this prop has no impact on controlled
	 * components, since the state of any given accordion panel is managed solely
	 * by the index prop.
	 */
	multiple?: boolean;
}

Accordion.displayName = "Accordion";

/**
 * AccordionItem
 *
 * A group that wraps a an accordion's button and panel components.
 *
 * @see Docs https://reach.tech/accordion#accordionitem
 */
const AccordionItem = React.forwardRef(function AccordionItem(
	{ as: Comp = "div", children, disabled = false, index: indexProp, ...props },
	forwardedRef
) {
	let { accordionId, openPanels, readOnly } = useAccordionCtx("AccordionItem");
	let buttonRef: ButtonRef = React.useRef(null);

	let [element, handleButtonRefSet] = useStatefulRefValue<HTMLElement | null>(
		buttonRef,
		null
	);
	let descendant = React.useMemo(() => {
		return {
			element,
			disabled,
		};
	}, [disabled, element]);
	let index = useDescendant(descendant, AccordionDescendantContext, indexProp);

	// We need unique IDs for the panel and button to point to one another
	let itemId = makeId(accordionId, index);
	let panelId = makeId("panel", itemId);
	let buttonId = makeId("button", itemId);

	let state =
		(Array.isArray(openPanels)
			? openPanels.includes(index) && AccordionStates.Open
			: openPanels === index && AccordionStates.Open) ||
		AccordionStates.Collapsed;

	let context: InternalAccordionItemContextValue = {
		buttonId,
		buttonRef,
		disabled,
		handleButtonRefSet,
		index,
		itemId,
		panelId,
		state,
	};

	return (
		<AccordionItemProvider {...context}>
			<Comp
				{...props}
				ref={forwardedRef}
				data-reach-accordion-item=""
				data-state={getDataState(state)}
				data-disabled={disabled ? "" : undefined}
				data-read-only={readOnly ? "" : undefined}
			>
				{children}
			</Comp>
		</AccordionItemProvider>
	);
}) as Polymorphic.ForwardRefComponent<"div", AccordionItemProps>;

/**
 * @see Docs https://reach.tech/accordion#accordionitem-props
 */
interface AccordionItemProps {
	/**
	 * An `AccordionItem` expects to receive an `AccordionButton` and
	 * `AccordionPanel` components as its children, though you can also nest other
	 * components within an `AccordionItem` if you want some persistant content
	 * that is relevant to the section but not collapsible when the
	 * `AccordionButton` is toggled.
	 *
	 * @see Docs https://reach.tech/accordion#accordionitem-children
	 */
	children: React.ReactNode;
	/**
	 * Whether or not an accordion panel is disabled from user interaction.
	 *
	 * @see Docs https://reach.tech/accordion#accordionitem-disabled
	 */
	disabled?: boolean;
	/**
	 * TODO: Document this!
	 */
	index?: number;
}

AccordionItem.displayName = "AccordionItem";

////////////////////////////////////////////////////////////////////////////////

/**
 * AccordionButton
 *
 * The trigger button a user clicks to interact with an accordion.
 *
 * Must be a direct child of a `AccordionItem`.
 *
 * @see Docs https://reach.tech/accordion#accordionbutton
 */
const AccordionButton = React.forwardRef(function AccordionButton(
	{
		as: Comp = "button",
		children,
		onClick,
		onKeyDown,
		onMouseDown,
		onPointerDown,
		tabIndex,
		...props
	},
	forwardedRef
) {
	let { onSelectPanel } = useAccordionCtx("AccordionButton");

	let {
		disabled,
		buttonId,
		buttonRef: ownRef,
		handleButtonRefSet,
		index,
		panelId,
		state,
	} = useAccordionItemCtx("AccordionButton");

	let ref = useComposedRefs(forwardedRef, handleButtonRefSet);

	function handleClick(event: React.MouseEvent) {
		event.preventDefault();
		if (disabled) {
			return;
		}
		ownRef.current.focus();
		onSelectPanel(index);
	}

	let handleKeyDown = useDescendantKeyDown(AccordionDescendantContext, {
		currentIndex: index,
		orientation: "vertical",
		key: "element",
		rotate: true,
		callback(element: HTMLElement) {
			element?.focus();
		},
		filter: (button) => !button.disabled,
	});

	return (
		<Comp
			// Each accordion header `button` is wrapped in an element with role
			// `heading` that has a value set for `aria-level` that is appropriate
			// for the information architecture of the page.
			// https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
			// I believe this should be left for apps to handle, since headings
			// are necessarily context-aware. An app can wrap a button inside any
			// arbitrary tag(s).
			// TODO: Revisit documentation and examples
			// @example
			// <div>
			//   <h3>
			//     <AccordionButton>Click Me</AccordionButton>
			//   </h3>
			//   <SomeComponent />
			// </div>

			// The title of each accordion header is contained in an element with
			// role `button`. We use an HTML button by default, so we can omit
			// this attribute.
			// https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
			// role="button"

			// The accordion header `button` element has `aria-controls` set to the
			// ID of the element containing the accordion panel content.
			// https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
			aria-controls={panelId}
			// If the accordion panel associated with an accordion header is
			// visible, the header `button` element has `aria-expanded` set to
			// `true`. If the panel is not visible, `aria-expanded` is set to
			// `false`.
			// https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
			aria-expanded={state === AccordionStates.Open}
			tabIndex={disabled ? -1 : tabIndex}
			{...props}
			ref={ref}
			data-reach-accordion-button=""
			data-state={getDataState(state)}
			// If the accordion panel associated with an accordion header is
			// visible, and if the accordion does not permit the panel to be
			// collapsed, the header `button` element has `aria-disabled` set to
			// `true`. We can use `disabled` since we opt for an HTML5 `button`
			// element.
			// https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
			disabled={disabled || undefined}
			id={buttonId}
			onClick={composeEventHandlers(onClick, handleClick)}
			onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
		>
			{children}
		</Comp>
	);
}) as Polymorphic.ForwardRefComponent<"button", AccordionButtonProps>;

/**
 * @see Docs https://reach.tech/accordion#accordionbutton-props
 */
interface AccordionButtonProps {
	/**
	 * Typically a text string that serves as a label for the accordion, though
	 * nested DOM nodes can be passed as well so long as they are valid children
	 * of interactive elements.
	 *
	 * @see https://github.com/w3c/html-aria/issues/54
	 * @see Docs https://reach.tech/accordion#accordionbutton-children
	 */
	children: React.ReactNode;
}

AccordionButton.displayName = "AccordionButton";

////////////////////////////////////////////////////////////////////////////////

/**
 * AccordionPanel
 *
 * The collapsible panel in which inner content for an accordion item is
 * rendered.
 *
 * @see Docs https://reach.tech/accordion#accordionpanel
 */
const AccordionPanel = React.forwardRef(function AccordionPanel(
	{ as: Comp = "div", children, ...props },
	forwardedRef
) {
	let { disabled, panelId, buttonId, state } =
		useAccordionItemCtx("AccordionPanel");

	return (
		<Comp
			hidden={state !== AccordionStates.Open}
			// Optionally, each element that serves as a container for panel content
			// has role `region` and `aria-labelledby` with a value that refers to
			// the button that controls display of the panel.
			// Role `region` is especially helpful to the perception of structure by
			// screen reader users when panels contain heading elements or a nested
			// accordion.
			// https://www.w3.org/TR/wai-aria-practices-1.2/#accordion

			// Avoid using the region role in circumstances that create landmark
			// region proliferation, e.g., in an accordion that contains more than
			// approximately 6 panels that can be expanded at the same time.
			// A user can override this with `role="none"` or `role="presentation"`
			// TODO: Add to docs
			role="region"
			aria-labelledby={buttonId}
			{...props}
			ref={forwardedRef}
			data-reach-accordion-panel=""
			data-disabled={disabled || undefined}
			data-state={getDataState(state)}
			id={panelId}
		>
			{children}
		</Comp>
	);
}) as Polymorphic.ForwardRefComponent<"div", AccordionPanelProps>;

/**
 * @see Docs https://reach.tech/accordion#accordionpanel-props
 */
interface AccordionPanelProps {
	/**
	 * Inner collapsible content for the accordion item.
	 *
	 * @see Docs https://reach.tech/accordion#accordionpanel-children
	 */
	children: React.ReactNode;
}

AccordionPanel.displayName = "AccordionPanel";

////////////////////////////////////////////////////////////////////////////////

/**
 * A hook that exposes data for a given `Accordion` component to its
 * descendants.
 *
 * @see Docs https://reach.tech/accordion#useaccordioncontext
 */
function useAccordionContext(): AccordionContextValue {
	let { openPanels, accordionId } = useAccordionCtx("useAccordionContext");
	return React.useMemo(() => {
		let panels: number[] = [];
		return {
			id: accordionId,
			openPanels: panels.concat(openPanels).filter((i) => i >= 0),
		};
	}, [accordionId, openPanels]);
}

/**
 * A hook that exposes data for a given `AccordionItem` component to its
 * descendants.
 *
 * @see Docs https://reach.tech/accordion#useaccordionitemcontext
 */
function useAccordionItemContext(): AccordionItemContextValue {
	let { index, state } = useAccordionItemCtx("useAccordionItemContext");
	return React.useMemo(
		() => ({
			index,
			isExpanded: state === AccordionStates.Open,
		}),
		[index, state]
	);
}

////////////////////////////////////////////////////////////////////////////////

function getDataState(state: AccordionStates) {
	return state === AccordionStates.Open ? "open" : "collapsed";
}

////////////////////////////////////////////////////////////////////////////////
// Types

interface AccordionContextValue {
	id: string | undefined;
	openPanels: number[];
}

interface AccordionItemContextValue {
	index: number;
	isExpanded: boolean;
}

type AccordionDescendant = Descendant & {
	disabled: boolean;
};

type ButtonRef = React.MutableRefObject<any>;

type AccordionIndex = number | number[];

interface InternalAccordionContextValue {
	accordionId: string | undefined;
	openPanels: AccordionIndex;
	onSelectPanel(index: AccordionIndex): void;
	readOnly: boolean;
}

interface InternalAccordionItemContextValue {
	disabled: boolean;
	buttonId: string;
	index: number;
	itemId: string;
	handleButtonRefSet(refValue: HTMLElement): void;
	buttonRef: ButtonRef;
	panelId: string;
	state: AccordionStates;
}

////////////////////////////////////////////////////////////////////////////////
// Exports

export type {
	AccordionButtonProps,
	AccordionContextValue,
	AccordionItemContextValue,
	AccordionItemProps,
	AccordionPanelProps,
	AccordionProps,
};
export {
	Accordion,
	AccordionButton,
	AccordionItem,
	AccordionPanel,
	AccordionStates,
	useAccordionContext,
	useAccordionItemContext,
};
