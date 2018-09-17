import React from "react";
import renderer from "react-test-renderer";

import Disclosure from "./";

let snapshot = element => {
  let wrapper = renderer.create(element);
  const tree = wrapper.toJSON();
  expect(tree).toMatchSnapshot();
  return tree;
};

describe("<Disclosure />", () => {
  test("renders without crashing", () => {
    snapshot(<Disclosure>Hello world</Disclosure>);
  });
});
