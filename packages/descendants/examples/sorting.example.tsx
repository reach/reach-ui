import * as React from "react";
import { action } from "@storybook/addon-actions";
import { useStatefulRefValue } from "@reach/utils/use-stateful-ref-value";
import {
  createDescendantContext,
  DescendantProvider,
  useDescendant,
  useDescendantsInit,
} from "@reach/descendants";
import type { Descendant } from "@reach/descendants";
import { isFunction } from "@reach/utils/type-check";

/*
For dynamic lists where items may be rearranged, you should explicitly pass an
index prop. Of course you don't *need* the descendants package at all in this
case, this is to illustrate that the explicit index takes precedence over the
calculated index.
 */

const name = "Sorting";

function Example() {
  let [items, setItems] = React.useState([0, 1, 2, 3, 4, 5]);
  return (
    <div>
      <button
        onClick={() => {
          setItems((items) => {
            return [...items].sort(() => 0.5 - Math.random());
          });
        }}
      >
        Randomize
      </button>
      <hr />
      <ListProvider>
        {items.map((item, i) => (
          <ListItem
            key={item}
            index={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: 200,
              maxWidth: "100%",
              gap: 10,
              fontFamily: "monospace",
            }}
          >
            {({ index }) => (
              <React.Fragment>
                <div>Item: {item}</div>
                <div>Index: {index}</div>
              </React.Fragment>
            )}
          </ListItem>
        ))}
      </ListProvider>
    </div>
  );
}

Example.storyName = name;
export { Example };

const DescendantContext =
  createDescendantContext<DescendantType>("DescendantContext");

const ListProvider: React.FC = ({ children }) => {
  let [descendants, setDescendants] = useDescendantsInit<DescendantType>();
  return (
    <DescendantProvider
      context={DescendantContext}
      items={descendants}
      set={setDescendants}
    >
      {children}
    </DescendantProvider>
  );
};

const ListItem: React.FC<{
  children: React.ReactNode | ((props: { index: number }) => React.ReactNode);
  index?: number;
  style?: React.CSSProperties;
}> = ({ children, index: indexProp, ...rest }) => {
  let ref = React.useRef<HTMLDivElement | null>(null);
  let [element, handleRefSet] = useStatefulRefValue(ref, null);
  let descendant: Omit<DescendantType, "index"> = React.useMemo(() => {
    return { element };
  }, [element]);
  let index = useDescendant(descendant, DescendantContext, indexProp);

  return (
    <div data-index={index} ref={handleRefSet} {...rest}>
      {isFunction(children) ? children({ index }) : children}
    </div>
  );
};

type DescendantType = Descendant<HTMLDivElement>;
