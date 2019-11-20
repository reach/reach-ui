# Descendants

In React you can wrap up any elements into a component and then render the new component instead. It's beautiful.

```jsx
// old
<h1>Time zones</h1>
<select>
  <option>Eastern</option>
  <option>Central</option>
  <option>Mountain</option>
  <option>Pacific</option>
  <option>UTC-10</option>
  <option>UTC-09</option>
  <option>UTC-09:30</option>
  {/* etc. */}
</select>

// new
<h1>Time zones</h1>
<select>
  <LocaleTimeZoneOptions/>
  <UTCTimeZoneOptions/>
</select>

function LocaleTimeZoneOptions() {
  return (
    <>
      <option>Eastern</option>
      <option>Central</option>
      <option>Mountain</option>
      <option>Pacific</option>
    </>
  )
}
```

Everything will continue to work!

But when we want to create our own abstractions like this we can't always abstract and compose the same way.

The Menu here will set an `aria-activedescendant={activeElementId}` so that assistive tech can announce correctly. The menu also needs a ref to the children so it can set them as the active descendant (or actually focus the node) from keyboard events like ArrowUp and ArrowDown.

Additionally, `MenuItem` needs to know if it is the active descendant so it can style itself differently.

```jsx
<Menu>
  <MenuItem onSelect={download}>Download</MenuItem>
  <MenuItem onSelect={save}>Save</MenuItem>
  <MenuItem onSelect={preview}>Preview</MenuItem>
</Menu>
```

There are a few ways to deal with this.

## Option 1: Bail out of Elements

The solution most people turn to is to bail out of the element API and turn to arrays. This lets a single owner control the state and rendering, makes it way easier to know the index and set the active-descendant.

```jsx
<Menu
  items={[
    { label: "Download", onSelect: download },
    { label: "Save", onSelect: save },
    { label: "Preview", onSelect: preview }
  ]}
/>;

function Menu({ items }) {
  const [activeIndex, setActiveIndex] = useState();
  return (
    <div data-menu aria-activedescendant={activeIndex}>
      {items.map((item, index) => (
        <MenuItem
          // easy to tell the index
          index={index}
          onSelect={item.onSelect}
        >
          {item.label}
        </MenuItem>
      ))}
    </div>
  );
}

function MenuItem({ index, onSelect, children }) {
  // and now we can style
  const isActive = index === activeIndex;
  return (
    <div
      // and add an ID
      id={index}
      data-active={isActive ? "" : undefined}
    >
      {children}
    </div>
  );
}
```

This is where most people live. You see these APIs everywhere because it's way easier when you own all the state and all the elements in one place. But you lose composition.

What happens when we want to add a className to all, one, or just a few of the elements? You end up with weird APIs like:

```jsx
<Listbox
  options={[
    { label: "Download", onSelect: download },
    { label: "Save", onSelect: save },
    { label: "Preview", onSelect: preview }
  ]}
  // stuff like this
  optionClassNames="cool"
  // or shoot, we need more than classNames
  optionsProps={{
    className: "cool",
    onMouseEnter: handler
  }}
  // dangit we need to do it differently depending on the option
  getOptionProps={(option, index) => {
    return index === 2 ? "bg-blue" : "bg-white";
  }}
  // ah forget it, here you do it, enjoy the branching!
  renderOption={(option, index) => (
    <MenuItem
      className={index === 2 ? "bg-blue" : "bg-white"}
      aria-label={index === 2 ? "Preview Invoice" : undefined}
    >
      {index === 0 ? (
        <DownloadIcon />
      ) : index === 1 ? (
        <SaveIcon />
      ) : index === 2 ? (
        <PreviewIcon />
      ) : null}
      {option.label}
    </MenuItem>
  )}
/>
```

Because the rendering is in the same owner as the state, we have to poke holes in the component to change anything about how it renders.

All that, just so the stinking `MenuOption` knows it's index in the parent's element tree.

Had we stuck to elements, we could have done this:

```jsx
<Menu>
  <MenuItem className="bg-white" onSelect={download}>
    <DownloadIcon /> Download
  </MenuItem>
  <MenuItem className="bg-white" onSelect={save}>
    <SaveIcon /> Save
  </MenuItem>
  <MenuItem
    className="bg-white"
    onSelect={preview}
    aria-label="Preview Invoice"
  >
    <PreviewIcon /> Preview
  </MenuItem>
</Menu>
```

But how will the MenuItem's know their index?

## Option 2: cloneElement

We can use cloneElement to keep (most of) the normal React composition. No more `items` prop. Instead we map the children, clone them, and pass them the state that we know in Menu.

```jsx
function Menu({ children }) {
  const [activeIndex, setActiveIndex] = useState();
  return (
    <div data-menu aria-activedescendant={activeIndex}>
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, { index, activeIndex })
      )}
    </div>
  );
}

function MenuItem({ index, activeIndex, onSelect, children }) {
  // index came from the clone
  const isActive = index === activeIndex;
  return (
    <div id={index} data-active={isActive ? "" : undefined}>
      {children}
    </div>
  );
}
```

We've now seperated the state from the elements so that apps can compose however they please. If you want to put a className on one item and not another, you can, and we don't have to poke holes into our `Menu` component just to meet every use case that pops up.

Almost.

What if we need to put a div around one of the items?

```jsx
<Menu>
  <div>
    <MenuItem />
  </div>
  <MenuItem />
</Menu>
```

This is totally broken now because we cloned the `div` not the `MenuItem`. You _could_ recurse down the tree and type check until you find a `MenuItem`, but, come on.

A recursive type check could help a little, but it still limit composition, what if you wanted to do this?

```jsx
function BlueItem(props) {
  return <MenuItem {...props} className="bg-blue" />;
}

<Menu>
  <MenuItem />
  <BlueItem />
</Menu>;
```

The type checking will fail 😭.

## Option 3: Context Wrapper

To get around some of these issues we can create a context around each child and get some composition back:

```jsx
const ItemContext = React.createContext();

function Menu({ children }) {
  const [activeIndex, setActiveIndex] = useState();
  return (
    <div data-menu aria-activedescendant={activeIndex}>
      {React.Children.map(children, (child, index) => (
        // instead of cloning, wrap in context
        <ItemContext.Provider value={{ index, activeIndex }}>
          {child}
        </ItemContext.Provider>
      ))}
    </div>
  );
}

function MenuItem({ onSelect, children }) {
  // state comes from context now
  const { index, activeIndex } = useContext(ItemContext);
  const isActive = index === activeIndex;
  return (
    <div id={index} data-active={isActive ? "" : undefined}>
      {children}
    </div>
  );
}
```

Now we don't need to type check and we can wrap a div around an `Item` or use a `BlueItem` because the values have been moved to context instead of directly cloning the element.

```jsx
<Menu>
  <div>
    <MenuItem />
  </div>
  <BlueItem />
</Menu>
```

But we still have problems:

What if we want to seperate them into groups with arbitrary items inbetween?

```jsx
<Menu>
  <MenuItem />
  <MenuItem />
  <hr />
  <MenuItem />
  <MenuItem />
</Menu>
```

Now we need to tell that third menu item that its index is not 3 (the 4th child of Menu) but rather that it's 2 (the third MenuItem). This also makes it difficult to manage the ArrowUp/ArrowDown keystrokes. Instead of just incrementing or decrementing the `activeIndex` you first have to figure out some way to find an array of _only_ the children that are a `MenuItem`. So, you have to go back to type checking. Oh no! Now every child _must be_ a `MenuItem`, so no more `BlueItem` or `div` wrappers.

Or, ofc, you can bail out of React completely and use DOM manipulation/traversal (not always a bad plan).

Even if we figured all that stuff out, remember `<LocaleTimeZoneOptions/>`? That rendered a fragment! So we'd end up wrapping multiple options in a single `index`. All four timezones would have `index === 0`, so they'd all focus together 😂. That's because the fragment is the child, and that's what we're wrapping in context. It would render this:

```jsx
<Provider value={{ index: 0 }}>
  <>
    <MenuItem />
    <MenuItem />
    <MenuItem />
  </>
</Provider>
```

Oops.

## Option 4: The Unholy Option

I goofed around to see if I could exploit `useLayoutEffect` and context to do a double render to get descendants to figure out their own index inside of that context.

And it worked... afaict.

```jsx
function Menu() {
  // First you `useDescendants` to set up your array of items:
  const itemsRef = useDescendants(); // itemsRef.current === []

  // Next you render a provider
  return <DescendantProvider items={itemsRef}>{children}</DescendantProvider>;
}

function MenuItem({ onSelect }) {
  // Last, you register your descendant and get the index
  // usually you send a ref to your node up so you can focus it
  // from the parent, but you can send any value you want, like
  // our onSelect handler, and let the Menu call it when it wants
  const index = useDescendant(onSelect);
}
```

For completeness, now we'll add in the activeIndex context as well.

```jsx
const MenuContext = React.createContext();

function Menu() {
  const [activeIndex, setActiveIndex] = useState(-1);
  const itemsRef = useDescendants(); // itemsRef.current === []
  return (
    <MenuContext.Provider value={activeIndex}>
      <DescendantProvider items={itemsRef}>
        <div data-menu aria-activedescendant={activeIndex}>
          {children}
        </div>
      </DescendantProvider>
      ;
    </MenuContext.Provider>
  );
}

function MenuItem({ onSelect }) {
  const index = useDescendant(onSelect);
  const activeIndex = useContext(MenuContext);

  // now we know if we're active no matter what!
  const isActive = index === activeIndex;
  return (
    <div id={index} data-active={isActive ? "" : undefined}>
      {children}
    </div>
  );
}
```

Now managing focus and setting the activeDescendant is as easy as incrementing a value, and best of all, apps can do all the things just like a `<select><option/></select>`!

```jsx
const el = (
  <Menu>
    <BlueItem />
    <CommonItems />
    <div>
      <MenuItem />
    </div>
  </Menu>
);

function CommonItems() {
  return (
    <>
      <MenuItem />
      <MenuItem />
      <MenuItem />
    </>
  );
}
```

### Limitations

I'm pretty sure this won't work in concurrent mode if you split your items in different suspense boundaries:

```jsx
<Menu>
  <CommonItems />
  <Suspense>
    <AsyncItems />
  </Suspense>
  <MenuItem />
</Menu>
```

Now the indexes would be all out of whack. I _think_ when those `AsyncItems` render you'll lose the index on all the others, or get duplicates, I dunno.

Seems like bad UX to open a list, and then change some items (I hate that!), so I'm totaly okay with this limitation. As long as all the lists are rendered together, it'll work.

Here's the code. If you dare 👻

```jsx
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
      firstToGo.current = true;
      context.items.current = [];
      context.assigning.current = true;
    }

    if (context.assigning.current && !updatingIndex.current) {
      const newIndex = context.items.current.push(descendant) - 1;
      updatingIndex.current = true;
      setIndex(newIndex);
    }
  });

  useEffect(() => {
    updatingIndex.current = false;
    if (firstToGo.current) {
      context.assigning.current = false;
      firstToGo.current = false;
    }
  });

  return index;
}
```
