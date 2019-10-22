# Welcome to Reach UI Development ♿️

Thanks for getting involved with Reach UI development!

## Looking for the documentation?

https://reacttraining.com/reach-ui/

## Getting Started

Reach UI is built and tested with [Yarn](https://yarnpkg.com). Please follow their [install instructions](https://yarnpkg.com/docs/install) to get Yarn installed on your system.

Then, run these commands:

```
git clone git@github.com:reach/reach-ui.git
cd reach-ui
yarn install
yarn build
```

## Root Repo Scripts:

```sh
yarn build        # builds all packages
yarn start        # starts storybook server
yarn test         # runs tests in all packages
```

## Running / Writing Examples

First do the steps in "Getting started", then start the Storybook server:

```
yarn start
```

Next, put a file in `packages/<component-dir>/examples/<name>.example.js` and make it look like this:

```jsx
import React from "react";

// The name of the example, you must export it as `name`
export let name = "Basic";

// The example to render, you must name it `Example`
export let Example = () => <div>Cool cool cool</div>;
```

Now you can edit the files in `packages/*` and storybook will automatically reload your changes.

**Note**: If you change an internal dependency you will need to run `yarn build` again. For example, if working on `MenuButton` requires a change to `Rect` (an internal dependency of `MenuButton`), you will need to run `yarn build` for the changes to `Rect` to show up in your `MenuButton` example.

## Running / Writing Tests

First do the steps in "Getting Started", then:

```
yarn test
```

Or if you want to run the tests as you edit files:

```
yarn test --watch
```

Often you'll want to just test the component you're working on:

```
cd packages/<component-path>
yarn test --watch
```

## Development Plans

The components to be built come from the the [Aria Practices Design Patterns and Widgets](https://www.w3.org/TR/wai-aria-practices-1.1). Here is a table of the components and their status.

✅ - Released<br/>
🧪 - Beta Released<br/>
🛠 - Planning to Build<br/>
❓ - Might Build?

| Status | Name                 |
| ------ | -------------------- |
| 🛠      | Accordion            |
| ✅     | Alert                |
| ✅     | Alert Dialog         |
| ❓     | Breadcrumb           |
| ❓     | Button               |
| 🛠      | Carousel             |
| 🛠      | Checkbox             |
| ✅     | Combo Box            |
| ✅     | Dialog (Modal)       |
| 🛠      | Disclosure           |
| ❓     | Feed                 |
| ❓     | Grids                |
| ❓     | Link                 |
| 🛠      | Listbox              |
| 🛠      | Menu or Menu bar     |
| ✅     | Menu Button          |
| 🛠      | Radio Group          |
| 🧪     | Slider               |
| 🛠      | Slider (Multi-Thumb) |
| ❓     | Spinbutton           |
| ❓     | Table                |
| ✅     | Tabs                 |
| ❓     | Toolbar              |
| ✅     | Tooltip              |
| 🛠      | Tree View            |
| ❓     | Treegrid             |
| ❓     | Window Splitter      |

## Website

The website is a Gatsby app in the `website` directory. It automatically deploys to https://reacttraining.com/reach-ui/ when the `website` branch is updated.

## Contributors

This project exists thanks to our contributors and financial backers.

<a href="https://github.com/reach/reach-ui/graphs/contributors"><img alt="graph of Reach UI GitHub contributors" src="https://opencollective.com/reach-ui/contributors.svg?width=1260&button=false%22" /></a>
