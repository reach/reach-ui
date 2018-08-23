---
title: 'x0: Using Markdown'
---

# Using Markdown

Using standard markdown syntax for documentation means that your docs will be easy to edit
and render in many different markdown renderers, such as on [GitHub.com](https://github.com).

In addition to the standard markdown syntax, x0 supports front matter and special fenced code blocks
that can render as live examples or previews of React components.

## Links

Standard markdown links work out of the box.
Under the hood, x0 converts relative links to React Router [`Link`][rr-link] components,
and absolute URLs are standard `<a>` tags.

```md
- [Link to another page](about)
- [Link to another site](http://example.com)
```

## Images

Images in the same directory can be included with relative URLs,
but we recommend using a CDN and absolute URLs for any images.

```md
![Hubble telescope image of a nebula](https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=2048&q=20)
```

Note: When using relative URLs, be sure to copy image assets to the dist folder when exporting a site with the `x0 build` command.

## Code Fences

To include a code snippet use a code fence.

````md
```sh
npm install @compositor/x0
```
````

### Live Editor

x0 includes support for special code fence language attributes for rendering live examples of React components.
Use the `.jsx` (note the `.` prefix) to render a live preview with an editable code editor.

````md
```.jsx
<Button>Hello</Button>
```
````

The above code will render as the following (note this is only visible on the [documentation site][site]).
Try editing the JSX code below the preview.

```.jsx
<Button>Hello</Button>
```

Using code fences means that your example code will render in any standard markdown renderer, including GitHub.

**Important Note**: To include custom components in scope for the live preview code fences,
you must use the `ScopeProvider` in a [custom App component](custom-app).

#### MDX

The LiveEditor also supports [MDX][] format. Use the `.mdx` language attribute to use MDX.

````md
```.mdx
# Hello MDX

<Button>Hello</Button>
```
````

```.mdx
# Hello MDX

<Button>Hello</Button>
```


### Live Preview

To render a component preview without the code editor below, use the `!jsx` (note the `!` prefix) language attibute.

````md
```!jsx
<Button>Hello</Button>
```
````

The above code will render the following:

```!jsx
<Button>Hello</Button>
```

## Front Matter

All `.md`, `.mdx`, and `.jsx` files in x0 support the use of [front-matter][fm] for setting default props and page-level metadata.

```md
---
title: Getting Started
---
```

### Options

Use the following front-matter options for controlling aspects of how a page renders.

- `ignore`: when set to true, x0 will not add the file as a route

#### HTML Template Options

Front matter will be passed to the [HTML template](customizing) to allow control over the page title, metatags and more.

[rr-link]: https://reacttraining.com/react-router/web/api/Link
[site]: https://compositor.io/x0/markdown
[fm]: https://github.com/jonschlinkert/gray-matter
[MDX]: https://github.com/mdx-js/mdx
