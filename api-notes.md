## ❓: Breadcrumbs

```jsx
// High level API
<Breadcrumbs separator={<FancyIcon />}>
  <Breadcrumb as="a" href="/">Home</Breadcrumb>
  <Breadcrumb as={StyledLink} href="/components">Parent</Breadcrumb>
  <Breadcrumb current>Current Page</Breadcrumb>
</Breadcrumbs>

// Lower level API
<Breadcrumbs>
  <BreadcrumbList>
    <BreadcrumbItem>
      <a href="/">Home</a>
      <FancyIcon aria-hidden />
    </BreadcrumbItem>
    <BreadcrumbItem>
      <StyledLink href="/components">Parent</StyledLink>
      <FancyIcon aria-hidden />
    </BreadcrumbItem>
    <BreadcrumbItem>
      <span>Current Page</span>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumbs>
```

## ❓: Button

TBD

## 🛠: Carousel

```jsx
<Carousel>
  <CarouselSlides>
    <CarouselSlide>Slide 1</CarouselSlide>
    <CarouselSlide>Slide 2</CarouselSlide>
    <CarouselSlide>Slide 3</CarouselSlide>
  </CarouselSlides>
  <CarouselArrows />
  <CarouselIndicators />
</Carousel>
```

```ts
type CarouselProps = {
  activeIndex: // starting index for controlled components
  // if multiple slides are visible, this positions the currently active slide.
  // default: center
  activeSlidePosition: 'center' | 'start' | 'end';
  autoPlay: boolean | number; // number = speed in MS
  controls: React.RefObject; // turns the slider into a control for another slider.
  defaultActiveIndex: number; // default starting index for uncontrolled components
  disabled: boolean;
  draggable: boolean; // default: true
  // whether or not the slider should be an infinite loop
  // imagining we'd need our component to control this if the user wants to
  // control animation between the last and first slides
  // (might also affect how indicators are rendered + arrow behavior)
  loopSlides: boolean;
  onChange(event, trigger): void;
  orientation: 'horizontal' | 'vertical'; // default: 'horizontal'
  rtl: boolean; // sets read/swipe mode to RTL
  slidesShown?: number; // default: 1
};
```

## 🛠: Disclosure

> NOTE: This should follow the Accordion, as it's essentially the same basic behavior with less flexibility and no custom focus management.

```jsx
<Disclosure>
  <DisclosureItem>
    <DisclosureTrigger>Open the box</DisclosureTrigger>
    <DisclosureContent>Some content</DisclosureContent>
  </DisclosureItem>
  <DisclosureItem>
    <DisclosureTrigger>Open the box</DisclosureTrigger>
    <DisclosureContent>Some content</DisclosureContent>
  </DisclosureItem>
</Disclosure>
```

## ❓: Feed

```jsx
// suspense component? Maybe? Does this even work?
function Example() {
  const posts = resource.posts.read();
  return (
    <Feed fallback={<Loading />} loadingNext={<LoadingNext />}>
      {posts.map(post => (
        <FeedItem key={post.id}>
          <h1>{post.title}</h1>
          <a href={post.src}>
            Read More<VisuallyHidden> about {post.title}</VisuallyHidden>
          </a>
        </FeedItem>
      ))}
    </Feed>
  );
}
```

## ❓: Grid

TBD

## ❓: Link

TBD

## 🛠: Listbox

```jsx
<Listbox>
  <ListboxArea>
    <h2>First group</h2>
    <ListboxList>
      <ListboxItem>Thing 1</ListboxItem>
      <ListboxItem>Thing 2</ListboxItem>
      <ListboxItem>Thing 3</ListboxItem>
    </ListboxList>
    <ListboxControls>
      <button>Move up</button>
      <button>Move down</button>
      <button>Move to next area</button>
    </ListboxControls>
  </ListboxArea>
  <ListboxArea>
    <h2>Second group</h2>
    <ListboxList>
      <ListboxItem>Thing 1</ListboxItem>
      <ListboxItem>Thing 2</ListboxItem>
      <ListboxItem>Thing 3</ListboxItem>
    </ListboxList>
    <ListboxControls>
      <button>Move up</button>
      <button>Move down</button>
      <button>Move to previous area</button>
    </ListboxControls>
  </ListboxArea>
</Listbox>
```

## 🛠: Menu

Seems like we may want to expand the `menu-button` package to include this, no?

- `MenuNav`: always an outer wrapper around a menu bar; provides context, renders a `nav` landmark
- `MenuBar`: renders a `div` with a `menubar` role. Contains either `MenuLink` or `Menu` components

> NOTE: I haven't seen much conversation about this recently, but there were active discussions in the w3c GitHub around menu roles creating confusing and inconsistent experiences for typical site navigation. It may be worth exploring the progress in browser/device implementation and considering language about this in the documentation if the aria recommendations still present challenges in these cases. REFERENCE: https://github.com/w3c/aria-practices/issues/13 / https://github.com/w3c/aria/issues/102

```jsx
<MenuNav>
  <MenuBar>
    <MenuLink href="/somewhere">I am just a simple link</MenuLink>
    <Menu>
      <MenuButton>Open me</MenuButton>
      <MenuList>
        <MenuItem onSelect={action("Download")}>Download</MenuItem>
        <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
        <MenuItem>
          More stuff
          <Menu>
            <MenuItem onSelect={action("whoa")}>Submenu Item 1</MenuItem>
            <MenuItem onSelect={action("nests, cool")}>Submenu Item 2</MenuItem>
          </Menu>
        </MenuItem>
      </MenuList>
    </Menu>
    <Menu>
      <MenuButton>Now open me</MenuButton>
      <MenuList>
        <MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
        <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
      </MenuList>
    </Menu>
  </MenuBar>
</MenuNav>
```

Another thought: what if we handled nested menus similarly to how Michel is handling nested routes in the new React Router API? What if complex menu structures were defined in plain objects instead of JSX? Menus can get big and messy and extra nested. Can't think of a clean API for this right off hand, but putting it out there.

## 🛠: RadioButton

Should this be any different from the `CustomCheckbox`? There is no third state for radio buttons, so it seems like this should be a thinner layer over the checkbox API that just makes it easy to style a non-input element.

## 🛠: Slider (multi-thumb)

I feel like we could possibly work this into the existing Slider API -- the biggest thing is that the slider handle DOM element is what receives all of the aria attributes regarding the slider's values, but in the slider component we are passing that info into each slider wrapper as a context provider. Maybe we could pass an array of values and could render handles in a callback?

```jsx
const [values, setValues] = useState([25, 50, 75]);
return (
  <Slider values={values} onChange={setValues}>
    {sliderValues =>
      sliderValues.map((value, i) => <SliderHandle key={i} value={value} />)
    }
  </Slider>
);
```

## ❓: SpinButton

I hate the name of this role, for the record. It's not a button and it doesn't spin!

IMO the high-level API should basically look like a number input.

```jsx
<SpinButton min={0} max={1000} />
// or
<SpinButton min={0} max={1000}>
  <SpinButtonInput />
  <SpinButtonIncrement>👆</SpinButtonIncrement>
  <SpinButtonDecrement>👇</SpinButtonDecrement>
</SpinButton>
```

## ❓: Table

Don't see any reason not to mirror the standard HTML table here:

```jsx
<Table>
  <TableHead>
    <TableRow>
      <TableCell sort="ascending">H1</TableCell>
      <TableCell>H2</TableCell>
      <TableCell>H3</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>Data yay</TableCell>
      <TableCell>Whoa</TableCell>
      <TableCell>
        <button>Click Me</button>
      </TableCell>
    </TableRow>
  </TableBody>
  <TableFoot>
    <TableRow>
      <TableCell colspan={3}>Some footer info</TableCell>
    </TableRow>
  </TableFoot>
</Table>
```

## ❓: Toolbar

TBD

## 🛠: Tree

```jsx
<Tree aria-label="Plant food tree">
  <TreeItem expanded>
    <span>Fruits</span>
    <TreeBranch>
      <TreeItem>Oranges</TreeItem>
      <TreeItem>Pineapples</TreeItem>
      <TreeItem expanded>
        <span>Apples</span>
        <TreeBranch>
          <TreeItem>Macintosh</TreeItem>
          <TreeItem expanded>
            <span>Granny Smith</span>
            <TreeBranch>
              <TreeItem>Washington State</TreeItem>
              <TreeItem>Michigan</TreeItem>
              <TreeItem>New York</TreeItem>
            </TreeBranch>
          </TreeItem>
          <TreeItem>Fuji</TreeItem>
        </TreeBranch>
      </TreeItem>
      <TreeItem>Bananas</TreeItem>
      <TreeItem>Pears</TreeItem>
    </TreeBranch>
  </TreeItem>
  <TreeItem>
    <span>Vegetables</span>
    <TreeBranch>
      <TreeItem>Broccoli</TreeItem>
      <TreeItem>Carrots</TreeItem>
      <TreeItem>
        <span>Lettuce</span>
        <TreeBranch>
          <TreeItem>Romaine</TreeItem>
          <TreeItem>Iceberg</TreeItem>
          <TreeItem>Butterhead</TreeItem>
        </TreeBranch>
      </TreeItem>
      <TreeItem>Spinach</TreeItem>
      <TreeItem>
        <span>Squash</span>
        <TreeBranch>
          <TreeItem>Acorn</TreeItem>
          <TreeItem>Ambercup</TreeItem>
          <TreeItem>Autumn Cup</TreeItem>
          <TreeItem>Hubbard</TreeItem>
          <TreeItem>Kabocha</TreeItem>
          <TreeItem>Butternut</TreeItem>
          <TreeItem>Spaghetti</TreeItem>
          <TreeItem>Sweet Dumpling</TreeItem>
          <TreeItem>Turban</TreeItem>
        </TreeBranch>
      </TreeItem>
    </TreeBranch>
  </TreeItem>
</Tree>
```

## ❓: TreeGrid

TBD

## ❓: WindowSplitter

TBD
