import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useEffect,
  useState,
  useRef
} from "react";

////////////////////////////////////////////////////////////////////////////////
// SUPER HACKS AHEAD: The React team will hate this enough to hopefully
// give us a way to know the index of a descendant given a parent (will
// help generate IDs for accessibility a long with the ability create
// maximally composable component abstractions).
//
// This is all to avoid cloneElement. If we can avoid cloneElement then
// people can have arbitrary markup around MenuItems.  This basically
// takes advantage of react's render lifecycles to let us "register"
// descendants to an ancestor, so that we can track all the descendants
// and manage focus on them, etc.  The super hacks here are for the child
// to know it's index as well, so that it can set attributes, match
// against state from above, etc.
const DescendantContext = createContext();

export function useDescendants() {
  return useRef([]);
}

export function DescendantProvider({ items, ...props }) {
  const assigning = useRef(false);
  return <DescendantContext.Provider {...props} value={{ items, assigning }} />;
}

export function useDescendant(descendant) {
  const context = useContext(DescendantContext);
  const updatingIndex = useRef(false);
  const firstToGo = useRef(false);
  const [index, setIndex] = useState(null);

  // eslint-disable-next-line
  useLayoutEffect(() => {
    if (context.assigning.current === false) {
      console.log("first to go", descendant);
      firstToGo.current = true;
      context.items.current = [];
      context.assigning.current = true;
    }

    if (context.assigning.current && !updatingIndex.current) {
      console.log("assigning", descendant);
      const newIndex = context.items.current.push(descendant) - 1;
      updatingIndex.current = true;
      setIndex(newIndex);
    }

    return () => {};
  });

  useEffect(() => {
    updatingIndex.current = false;
    if (firstToGo.current) {
      context.assigning.current = false;
      firstToGo.current = false;
      console.log("done", context.items);
    }
  });

  return index;
}
