What we know for sure:

- Breadcrumb should be a `nav` element
- It should have the `aria-label="breadcrumb"`
- It should contain an ordered list
- The separator between breadcrumb items should not be read by the screen reader
- The current (last) item on the list should have `aria-current`

Resources followed:

- Source: https://github.com/reach/reach-ui/tree/master/packages/breadcrumb
- WAI ARIA: https://www.w3.org/TR/wai-aria-practices-1.1/#breadcrumb
- Further reading: https://scottaohara.github.io/a11y_breadcrumbs/

Open questions:

### Separator implementation

1. The separator can be built with an additional element inside the component or with `:before` in CSS.

   If we chose to build it with CSS, we have to create a transformed border that looks like a slash(example below) and add `content: ''`. This makes sure it is not read out loud by the screen reader.

   This approach is easy to style but also has the scope for making a mistake.

   Reference: https://www.w3.org/TR/wai-aria-practices/examples/breadcrumb/index.html

   ```css
   [data-reach-breadcrumb-item] + [data-reach-breadcrumb-item]::before {
     display: inline-block;
     margin: 0 0.5em;
     transform: rotate(15deg);
     border-right: 0.1em solid grey;
     height: 0.8em;
     content: ""; /* this is important, do not remove */
   }
   ```

   If we take the other approach, we have to add an additional element with `aria-hidden`. This is in the details of the component, so it's foolproof but it is slightly harder to customise but gives you more freedom (This is the one I have taken right now)

   ```jsx
   /** New prop alert! */
   <Breadcrumb separator="➤">...</Breadcrumb>

   /** You can even bring your own component */
   <Breadcrumb separator={<Icon name="arrow"/>}>...</Breadcrumb>
   ```

   and then style it with

   ```css
   [data-breadcrumb-separator] {
   }
   ```

2. Which element should the last item take?

   There are mixed advice on what should the last element be: a span or an anchor?

   If it is a link, we know that it should have an `aria-current`, but what should it be it's `href`?

   It it's a span, `aria-current` is optional.

   Should we make this decision for the user and wrap that in a `BreadcrumbItem` or `BreadcrumbLink` API

   OR

   Should we leave this responsibility to the user and only take care of attaching `aria-current`. (this is the one I have taken right now)

3. In almost all cases, `aria-current` should have the value `page`, but it also have other values like `location`.

   Reference: https://developer.yoast.com/website-accessibility-aria-current/

   The more relevant thing that this brought up is that in the current API has a lot of indirection baked in to do the right thing, but that also means, we don't have a good way to pass props down to transient elements like the `li` item.

   ```jsx
   <Breadcrumb>
     <a href="/">Home</a>
     <a href="/components">Parent</a>
     <span>Current Page</span>
   </Breadcrumb>
   ```

   renders

   ```html
   <nav aria-label="breadcrumb">
     <ol>
       <li>
         <a href="/">Home</a>
       </li>
       <li>
         <a href="/components">Parent</a>
       </li>
       <li>
         <span aria-current="page">Current Page</span>
       </li>
     </ol>
   </nav>
   ```

   Compare this to the alternate API:

   ```jsx
   <Breadcrumb>
     <BreadcrumbLink href="/">Home</BreadcrumbLink>
     <BreadcrumbLink href="/components">Parent</BreadcrumbLink>
     <BreadcrumbLink aria-current="location">Current Page</BreadcrumbLink>
   </Breadcrumb>
   ```

   This gives us a different style of indirection:

   - The `aria-current` prop is meant for the `li`, but all the other props are meant for the underlying link (example: `target=_blank`)
   - This introduces the need for another prop: `as`, as we would like to let the user bring a `Link` component from their router of choice. We should be careful about adding new APIs but I don't feel too bad about the `as` prop because it's getting fairly common in the ecosystem.

   ```jsx
   <Breadcrumb>
     <BreadcrumbLink as={Link} to="/">
       Home
     </BreadcrumbLink>
     <BreadcrumbLink as={Link} to="/components">
       Parent
     </BreadcrumbLink>
     <BreadcrumbLink as={Link} aria-current="location">
       Current Page
     </BreadcrumbLink>
   </Breadcrumb>
   ```

   This also solves the confusing around #2, where we control the rendered element but is customizable by the user using the `as` prop
