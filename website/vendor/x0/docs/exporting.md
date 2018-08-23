
# Exporting

x0 sites can be exported as static sites using the `x0 build` command.

```sh
x0 build docs
```

## Options

Options for static export can be passed as flags or specified in a `package.json` field named `x0`.

```
-d --out-dir    Output directory (default dist)
-s --static     Output static HTML without JS bundle
-t --template   Path to custom HTML template
--basename      Basename for URL paths
--title         Page title
```

## Custom HTML Templates

A custom HTML template function can be used for greater control over the HTML output.

```js
module.exports = ({
  html = '',
  css = '',
  scripts,
  title = 'x0',
  meta = [],
  links = [],
}) =>
`<!DOCTYPE html>
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width,initial-scale=1'>
  <title>${title}</title>
  ${css}
</head>
<div id=root>${html}</div>
${scripts}
`
```

See the [default template][template] for an example.

[template]: https://github.com/c8r/x0/blob/master/lib/template.js
