import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  createNamedContext,
  noop,
  useIsomorphicLayoutEffect,
} from "@reach/utils";

export function createDescendantContext<ElementType, DescendantProps = {}>(
  name: string,
  initialValue = {}
) {
  return createNamedContext(name, {
    descendants: [],
    registerDescendant: noop,
    unregisterDescendant: noop,
    ...initialValue,
  } as IDescendantContext<ElementType, DescendantProps>);
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
 * * As for SSR, the good news is that we don't actually need the index on the
 * server for most use-cases, as we are only using it to determine the order of
 * composed descendants for keyboard navigation. However, in the few cases where
 * this is not the case, we can require an explicit index from the app.
 */
export function useDescendant<ElementType, DescendantProps>(
  {
    context,
    element,
    ...rest
  }: Omit<Descendant<ElementType, DescendantProps>, "index"> & {
    context: React.Context<IDescendantContext<ElementType, DescendantProps>>;
  },
  indexProp?: number
) {
  let [, forceUpdate] = useState();
  let { registerDescendant, unregisterDescendant, descendants } = useContext(
    context
  );

  // Prevent any flashing
  useIsomorphicLayoutEffect(() => {
    if (!element) forceUpdate({});
    // @ts-ignore
    registerDescendant({ element, ...rest });
    return () => unregisterDescendant(element);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, ...Object.values(rest)]);

  return indexProp ?? descendants.findIndex(item => item.element === element);
}

export function useDescendants<ElementType, DescendantProps = {}>() {
  return useState<Descendant<ElementType, DescendantProps>[]>([]);
}

export function DescendantProvider<ElementType, DescendantProps>({
  context: Ctx,
  children,
  items,
  set,
}: {
  context: React.Context<IDescendantContext<ElementType, DescendantProps>>;
  children: React.ReactNode;
  items: Descendant<ElementType, DescendantProps>[];
  set: React.Dispatch<
    React.SetStateAction<Descendant<ElementType, DescendantProps>[]>
  >;
}) {
  let registerDescendant = React.useCallback(
    ({ element, ...rest }: Descendant<ElementType, DescendantProps>) => {
      if (!element) {
        return;
      }

      set(items => {
        let newItem: Descendant<ElementType, DescendantProps>;
        let newItems: Descendant<ElementType, DescendantProps>[];
        // If there are no items, register at index 0 and bail.
        if (items.length === 0) {
          newItem = {
            element,
            index: 0,
            ...rest,
          } as Descendant<ElementType, DescendantProps>;
          newItems = [...items, newItem];
        } else if (items.find(item => item.element === element)) {
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
          let index = items.findIndex(item => {
            if (!item.element || !element) {
              return false;
            }
            // Does this element's DOM node appear before another item in the
            // array in our DOM tree? If so, return true to grab the index at
            // this point in the array so we know where to insert the new
            // element.
            return Boolean(
              item.element.compareDocumentPosition(element) &
                Node.DOCUMENT_POSITION_PRECEDING
            );
          });

          newItem = {
            element,
            index,
            ...rest,
          } as Descendant<ElementType, DescendantProps>;

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
    // set is a state setter initialized by the useDescendants hook.
    // We can safely ignore the lint warning here because it will not change
    // between renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  let unregisterDescendant = useCallback(
    (element: Descendant<ElementType>["element"]) => {
      if (!element) {
        return;
      }

      set(items => items.filter(item => element !== item.element));
    },
    // set is a state setter initialized by the useDescendants hook.
    // We can safely ignore the lint warning here because it will not change
    // between renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const value: IDescendantContext<
    ElementType,
    DescendantProps
  > = useMemo(() => {
    return {
      descendants: items,
      registerDescendant,
      unregisterDescendant,
    };
  }, [items, registerDescendant, unregisterDescendant]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
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
export function useDescendantKeyDown<
  ElementType,
  DescendantProps = {},
  K extends keyof Descendant<ElementType, DescendantProps> = keyof Descendant<
    ElementType,
    DescendantProps
  >
>(
  context: React.Context<IDescendantContext<ElementType, DescendantProps>>,
  options: {
    currentIndex: number | null | undefined;
    key?: K | "option";
    filter?: (descendant: Descendant<ElementType, DescendantProps>) => boolean;
    orientation?: "vertical" | "horizontal" | "both";
    rotate?: boolean;
    rtl?: boolean;
    callback(
      nextOption:
        | Descendant<ElementType, DescendantProps>
        | Descendant<ElementType, DescendantProps>[K]
    ): void;
  }
) {
  let { descendants } = useContext(context);
  let {
    callback,
    currentIndex,
    filter,
    key = "index" as K,
    orientation = "vertical",
    rotate = true,
    rtl = false,
  } = options;
  let index = currentIndex ?? -1;

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

    // If we use a filter function, we need to re-index our descendants array
    // so that filtered descendent elements aren't selected.
    let selectableDescendants = descendants;
    if (filter) {
      selectableDescendants = [];
      let n = -1;
      for (let i = 0; i < descendants.length; i++) {
        let descendant = descendants[i];
        if (filter(descendant)) {
          selectableDescendants.push({ ...descendant, index: n++ });

          // Current index should map to the updated array vs. the original
          // descendants array.
          index = i === currentIndex ? n : index;
        }
      }
      selectableDescendants = descendants.filter(filter);
    }

    // We need some options for any of this to work!
    if (!selectableDescendants.length) {
      return;
    }

    function getNextOption() {
      let atBottom = index === selectableDescendants.length - 1;
      return atBottom
        ? rotate
          ? getFirstOption()
          : selectableDescendants[index]
        : selectableDescendants[(index + 1) % selectableDescendants.length];
    }

    function getPreviousOption() {
      let atTop = index === 0;
      return atTop
        ? rotate
          ? getLastOption()
          : selectableDescendants[index]
        : selectableDescendants[
            (index - 1 + selectableDescendants.length) %
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
        let prevOrFirst = (event.ctrlKey
          ? getPreviousOption
          : getFirstOption)();
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

type SomeHTMLElement<T> = T extends HTMLElement ? T : HTMLElement;

export type Descendant<ElementType, DescendantProps = {}> = DescendantProps & {
  element: SomeHTMLElement<ElementType> | null;
  index: number;
};

export interface IDescendantContext<ElementType, DescendantProps> {
  descendants: Descendant<ElementType, DescendantProps>[];
  registerDescendant(
    descendant: Descendant<ElementType, DescendantProps>
  ): void;
  unregisterDescendant(element: SomeHTMLElement<ElementType> | null): void;
}
