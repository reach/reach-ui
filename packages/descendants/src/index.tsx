import * as React from "react";
import { useForceUpdate } from "@reach/utils/use-force-update";
import { useIsomorphicLayoutEffect as useLayoutEffect } from "@reach/utils/use-isomorphic-layout-effect";
import { createNamedContext } from "@reach/utils/context";
import { noop } from "@reach/utils/noop";

function createDescendantContext<DescendantType extends Descendant>(
  name: string,
  initialValue = {}
) {
  type T = DescendantContextValue<DescendantType>;
  const descendants: DescendantType[] = [];
  return createNamedContext<T>(name, {
    descendants,
    registerDescendant: noop,
    unregisterDescendant: noop,
    ...initialValue,
  });
}

/**
 * This hook registers our descendant by passing it into an array. We can then
 * search that array by to find its index when registering it in the component.
 * We use this for focus management, keyboard navigation, and typeahead
 * functionality for some components.
 *
 * The hook accepts the element node and (optionally) a key. The key is useful
 * if multiple descendants have identical text values and we need to
 * differentiate siblings for some reason.
 *
 * Our main goals with this are:
 *   1) maximum composability,
 *   2) minimal API friction
 *   3) SSR compatibility*
 *   4) concurrent safe
 *   5) index always up-to-date with the tree despite changes
 *   6) works with memoization of any component in the tree (hopefully)
 *
 * As for SSR, the good news is that we don't actually need the index on the
 * server for most use-cases, as we are only using it to determine the order of
 * composed descendants for keyboard navigation. However, in the few cases where
 * this is not the case, we can require an explicit index from the app.
 */
function useDescendant<DescendantType extends Descendant>(
  descendant: Omit<DescendantType, "index">,
  context: React.Context<DescendantContextValue<DescendantType>>,
  indexProp?: number
) {
  let forceUpdate = useForceUpdate();
  let { registerDescendant, unregisterDescendant, descendants } =
    React.useContext(context);

  // This will initially return -1 because we haven't registered the descendant
  // on the first render. After we register, this will then return the correct
  // index on the following render and we will re-register descendants so that
  // everything is up-to-date before the user interacts with a collection.
  let index =
    indexProp ??
    descendants.findIndex((item) => item.element === descendant.element);

  // Prevent any flashing
  useLayoutEffect(() => {
    if (!descendant.element) forceUpdate();

    registerDescendant({
      ...descendant,
      index,
    } as DescendantType);
    return () => {
      unregisterDescendant(descendant.element);
    };
  }, [
    descendant,
    forceUpdate,
    index,
    registerDescendant,
    unregisterDescendant,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...Object.values(descendant),
  ]);

  return index;
}

function useDescendantsInit<DescendantType extends Descendant>() {
  return React.useState<DescendantType[]>([]);
}

function useDescendants<DescendantType extends Descendant>(
  ctx: React.Context<DescendantContextValue<DescendantType>>
) {
  return React.useContext(ctx).descendants;
}

function DescendantProvider<DescendantType extends Descendant>({
  context: Ctx,
  children,
  items,
  set,
}: {
  context: React.Context<DescendantContextValue<DescendantType>>;
  children: React.ReactNode;
  items: DescendantType[];
  set: React.Dispatch<React.SetStateAction<DescendantType[]>>;
}) {
  let registerDescendant = React.useCallback(
    ({
      element,
      index: explicitIndex,
      ...rest
    }: Omit<DescendantType, "index"> & { index?: number | undefined }) => {
      if (!element) {
        return;
      }

      set((items) => {
        let newItems: DescendantType[];
        if (explicitIndex != null) {
          return [
            ...items,
            {
              ...rest,
              element,
              index: explicitIndex,
            } as DescendantType,
          ].sort((a, b) => a.index - b.index);
        } else if (items.length === 0) {
          // If there are no items, register at index 0 and bail.
          newItems = [
            {
              ...rest,
              element,
              index: 0,
            } as DescendantType,
          ];
        } else if (items.find((item) => item.element === element)) {
          // If the element is already registered, just use the same array
          newItems = items;
        } else {
          // When registering a descendant, we need to make sure we insert in
          // into the array in the same order that it appears in the DOM. So as
          // new descendants are added or maybe some are removed, we always know
          // that the array is up-to-date and correct.
          //
          // So here we look at our registered descendants and see if the new
          // element we are adding appears earlier than an existing descendant's
          // DOM node via `node.compareDocumentPosition`. If it does, we insert
          // the new element at this index. Because `registerDescendant` will be
          // called in an effect every time the descendants state value changes,
          // we should be sure that this index is accurate when descendent
          // elements come or go from our component.
          let index = items.findIndex((item) => {
            if (!item.element || !element) {
              return false;
            }
            // Does this element's DOM node appear before another item in the
            // array in our DOM tree? If so, return true to grab the index at
            // this point in the array so we know where to insert the new
            // element.
            return Boolean(
              item.element.compareDocumentPosition(element as Node) &
                Node.DOCUMENT_POSITION_PRECEDING
            );
          });

          let newItem = {
            ...rest,
            element,
            index,
          } as DescendantType;

          // If an index is not found we will push the element to the end.
          if (index === -1) {
            newItems = [...items, newItem];
          } else {
            newItems = [
              ...items.slice(0, index),
              newItem,
              ...items.slice(index),
            ];
          }
        }
        return newItems.map((item, index) => ({ ...item, index }));
      });
    },
    // set is a state setter initialized by the useDescendantsInit hook.
    // We can safely ignore the lint warning here because it will not change
    // between renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  let unregisterDescendant = React.useCallback(
    (element: DescendantType["element"]) => {
      if (!element) {
        return;
      }

      set((items) => items.filter((item) => element !== item.element));
    },
    // set is a state setter initialized by the useDescendantsInit hook.
    // We can safely ignore the lint warning here because it will not change
    // between renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Ctx.Provider
      value={React.useMemo(() => {
        return {
          descendants: items,
          registerDescendant,
          unregisterDescendant,
        };
      }, [items, registerDescendant, unregisterDescendant])}
    >
      {children}
    </Ctx.Provider>
  );
}

/**
 * Testing this as an abstraction for compound components that use keyboard
 * navigation. Hoping this will help us prevent bugs and mismatched behavior
 * across various components, but it may also prove to be too messy of an
 * abstraction in the end.
 *
 * Currently used in:
 *   - Tabs
 *   - Accordion
 *
 * @param context
 * @param options
 */
function useDescendantKeyDown<
  DescendantType extends Descendant,
  K extends keyof DescendantType = keyof DescendantType
>(
  context: React.Context<DescendantContextValue<DescendantType>>,
  options: {
    currentIndex: number | null | undefined;
    key?: K | "option";
    filter?: (descendant: DescendantType) => boolean;
    orientation?: "vertical" | "horizontal" | "both";
    rotate?: boolean;
    rtl?: boolean;
    callback(nextOption: DescendantType | DescendantType[K]): void;
  }
) {
  let { descendants } = React.useContext(context);
  let {
    callback,
    currentIndex,
    filter,
    key = "index" as K,
    orientation = "vertical",
    rotate = true,
    rtl = false,
  } = options;

  return function handleKeyDown(event: React.KeyboardEvent) {
    if (
      ![
        "ArrowDown",
        "ArrowUp",
        "ArrowLeft",
        "ArrowRight",
        "PageUp",
        "PageDown",
        "Home",
        "End",
      ].includes(event.key)
    ) {
      return;
    }

    let index = currentIndex ?? -1;

    // If we use a filter function, we need to re-index our descendants array
    // so that filtered descendent elements aren't selected.
    let selectableDescendants = filter
      ? descendants.filter(filter)
      : descendants;

    // We need some options for any of this to work!
    if (!selectableDescendants.length) {
      return;
    }

    let selectableIndex = selectableDescendants.findIndex(
      (descendant) => descendant.index === currentIndex
    );

    function getNextOption() {
      let atBottom = index === getLastOption().index;
      return atBottom
        ? rotate
          ? getFirstOption()
          : selectableDescendants[selectableIndex]
        : selectableDescendants[
            (selectableIndex + 1) % selectableDescendants.length
          ];
    }

    function getPreviousOption() {
      let atTop = index === getFirstOption().index;
      return atTop
        ? rotate
          ? getLastOption()
          : selectableDescendants[selectableIndex]
        : selectableDescendants[
            (selectableIndex - 1 + selectableDescendants.length) %
              selectableDescendants.length
          ];
    }

    function getFirstOption() {
      return selectableDescendants[0];
    }

    function getLastOption() {
      return selectableDescendants[selectableDescendants.length - 1];
    }

    switch (event.key) {
      case "ArrowDown":
        if (orientation === "vertical" || orientation === "both") {
          event.preventDefault();
          let next = getNextOption();
          callback(key === "option" ? next : next[key]);
        }
        break;
      case "ArrowUp":
        if (orientation === "vertical" || orientation === "both") {
          event.preventDefault();
          let prev = getPreviousOption();
          callback(key === "option" ? prev : prev[key]);
        }
        break;
      case "ArrowLeft":
        if (orientation === "horizontal" || orientation === "both") {
          event.preventDefault();
          let nextOrPrev = (rtl ? getNextOption : getPreviousOption)();
          callback(key === "option" ? nextOrPrev : nextOrPrev[key]);
        }
        break;
      case "ArrowRight":
        if (orientation === "horizontal" || orientation === "both") {
          event.preventDefault();
          let prevOrNext = (rtl ? getPreviousOption : getNextOption)();
          callback(key === "option" ? prevOrNext : prevOrNext[key]);
        }
        break;
      case "PageUp":
        event.preventDefault();
        let prevOrFirst = (
          event.ctrlKey ? getPreviousOption : getFirstOption
        )();
        callback(key === "option" ? prevOrFirst : prevOrFirst[key]);
        break;
      case "Home":
        event.preventDefault();
        let first = getFirstOption();
        callback(key === "option" ? first : first[key]);
        break;
      case "PageDown":
        event.preventDefault();
        let nextOrLast = (event.ctrlKey ? getNextOption : getLastOption)();
        callback(key === "option" ? nextOrLast : nextOrLast[key]);
        break;
      case "End":
        event.preventDefault();
        let last = getLastOption();
        callback(key === "option" ? last : last[key]);
        break;
    }
  };
}

////////////////////////////////////////////////////////////////////////////////
// Types

type SomeElement<T> = T extends Element ? T : HTMLElement;

type Descendant<ElementType = HTMLElement> = {
  element: SomeElement<ElementType> | null;
  index: number;
};

interface DescendantContextValue<DescendantType extends Descendant> {
  descendants: DescendantType[];
  registerDescendant(descendant: DescendantType): void;
  unregisterDescendant(element: DescendantType["element"]): void;
}

////////////////////////////////////////////////////////////////////////////////
// Exports

export type { Descendant, DescendantContextValue };
export {
  createDescendantContext,
  DescendantProvider,
  useDescendant,
  useDescendantKeyDown,
  useDescendants,
  useDescendantsInit,
};
