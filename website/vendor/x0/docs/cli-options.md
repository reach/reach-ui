---
name: CLI Options
---

# CLI Options

```
--webpack       Path to webpack config file
--match         String to match routes against using minimatch
```

The following options are used for the development server.

```
-o --open       Open dev server in default browser
-p --port       Port for dev server
--analyze       Runs with webpack-bundle-analyzer plugin
```

The following options are used for static export.

```
-d --out-dir    Output directory (default dist)
-s --static     Output static HTML without JS bundle
-t --template   Path to custom HTML template
--basename      Basename for URL paths
--title         Page title
```

## package.json

CLI options can also be specified in a `package.json` field named `x0`.

```json
"x0": {
  "title": "Hello",
  "basename": "/my-site"
}
```
