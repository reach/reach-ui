# Welcome

Thanks for getting involved with Reach UI development!

## Getting Started

This project uses

- [Lerna](https://lernajs.io/) to manage multiple libs
- [Storybook](https://storybook.js.org/) for a great development experience
- [Jest](https://jest?.com) for painless testing.

So it goes a little something like this:

```
git clone <repo-url>
cd reach-ui
yarn install
yarn bootstrap
```

## Root Repo Scripts:

```sh
yarn bootstrap    # bootstraps lerna so all dependencies get
                  # linked for cross-component development

yarn start        # starts storybook server

yarn test         # runs tests in all packages

yarn build        # builds all packages

yarn publish      # publishes changed packages

yarn site:start   # starts the website dev server

yarn site:build   # builds the website

yarn site:deploy  # deploys the website
```

## Running / Writing Examples

First do the steps in "Getting Started", then:

```
yarn start
```

Next, put a file in `<component-dir>/examples/<name>.example.js` and make it look like this:

```jsx
// The name of the example, you must export it as `name`
export let name = "Basic";

// The example to render, you must name it `Example`
export let Example = () => <div>Cool cool cool</div>;
```

Now you can edit the files in `packages/*` and storybook will automatically reload your changes.

## Running / Writing Tests

First do the steps in "Getting Started", then:

```
yarn test
```

Or if you want to run the tests as you edit files:

```
yarn test --watch
```

Usually you'll want to just test the component you're working on:

```
cd packages/<component-path>
yarn test --watch
```
