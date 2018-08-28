# Reach UI www

This website uses [Gatsby](https://gatsbyjs.org) v2 with [Gatsby MDX](https://github.com/ChristopherBiscardi/gatsby-mdx) powering most of the pages, which are both in beta so ... heads up. It is deployed with [now](https://now.sh)

```
yarn start        # starts the website

yarn build        # builds the production site to "public/"

yarn stage        # deploys the site with now.sh

yarn deploy       # alias the latest deploy to production
```

## Running / Writing Examples

From the root of the reach-ui repository (not www)

```
yarn
yarn bootstrap
```

Then you're ready to go:

```
cd www
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

It's incredibly slow, you might want to comment out the auto file loading in `.storybook/config.js` and just require the single example you're working on 😬.

**Note**: If you change an internal dependency you will need to run `yarn build` again. For example, if working on `MenuButton` requires a change to `Rect` (an internal dependency of `MenuButton`), you will need to run `yarn build` for the changes to `Rect` to show up in your `MenuButton` example.
