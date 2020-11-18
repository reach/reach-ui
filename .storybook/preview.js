import { configure } from "@storybook/react";
import "./styles.css";

configure(() => {
  const req = require.context(
    "../packages",
    true,
    /^((?!node_modules).)*\.example\.(js|ts|tsx)$/
  );

  let allExports = {};
  for (let pathToExample of req.keys()) {
    let { Comp, default: defaultExport } = req(pathToExample);

    if (!Comp || !defaultExport) {
      continue;
    }

    let { name } = Comp.story;
    let { title } = defaultExport;

    allExports[title] = {
      ...(allExports[title] || {}),
      default: { title },
      [name]: Comp,
    };
  }

  return Object.keys(allExports).reduce((prev, cur) => {
    return [...prev, allExports[cur]];
  }, []);
}, module);
