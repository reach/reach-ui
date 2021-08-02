import * as React from "react";
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

const name = "Adding/Removing";

function Example() {
  let addBtn = React.useRef<HTMLInputElement>(null);
  let [{ items, inputValue }, set] = React.useState(() => ({
    items: [] as string[],
    inputValue: "",
  }));

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          let value = inputValue.trim();
          if (!value) {
            console.log("Please enter a value!");
            return;
          } else if (items.includes(value)) {
            console.log("Items in the list must be unique");
            return;
          }

          set(({ items }) => ({
            items: [...items, value],
            inputValue: "",
          }));
        }}
      >
        <div>
          <label>
            <input
              maxLength={7}
              type="text"
              name="add"
              ref={addBtn}
              autoComplete="off"
              required
              onChange={(e) => {
                let next = e.target.value;
                if (!next.includes(" ")) {
                  set(({ items }) => ({
                    items,
                    inputValue: next,
                  }));
                }
              }}
              value={inputValue}
            />
          </label>
        </div>
        <button type="submit" disabled={!inputValue || undefined}>
          Add
        </button>
        <button
          type="button"
          disabled={items.length < 1 || undefined}
          onClick={() => {
            if (items.length < 1) {
              return;
            }
            set(({ items, inputValue }) => {
              let i = Math.floor(Math.random() * items.length);
              return {
                inputValue,
                items: [
                  ...items.slice(0, i),
                  ...items.slice(i + 1, items.length),
                ],
              };
            });
          }}
        >
          Remove Random Item
        </button>
      </form>

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
