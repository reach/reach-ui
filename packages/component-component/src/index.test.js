import React from "react";
import renderer from "react-test-renderer";
import Component from "./index";

let snapshot = element => {
  let wrapper = renderer.create(element);
  const tree = wrapper.toJSON();
  expect(tree).toMatchSnapshot();
  return tree;
};

describe("rendering", () => {
  it("renders without figuritively exploding", () => {
    snapshot(
      <Component>
        <div>Heyyyooooo</div>
      </Component>
    );
  });
  it("prefers `render` over `children`", () => {
    let { children } = snapshot(
      <Component
        initialState={{ value: "!" }}
        render={({ state }) => <div>{state.value}</div>}
      >
        <div>!!</div>
      </Component>
    );
    expect(children).toEqual(["!"]);
  });
  it("renders without children", () => {
    let { root } = renderer.create(<Component initialState={{ value: "!" }} />);
    expect(root.props.initialState.value).toBe("!");
  });
  it("renders with normal children", () => {
    let { root } = renderer.create(
      <Component>
        <div>
          <div value="y">!</div>
        </div>
      </Component>
    );
    expect(root.findByProps({ value: "y" })).toBeTruthy();
  });
  it("renders with children render prop", () => {
    let { children } = snapshot(
      <Component
        initialState={{ value: "!" }}
        render={({ state }) => <div>{state.value}</div>}
      />
    );
    expect(children).toEqual(["!"]);
  });
});

// describe("refs", () => {
//   it("maintains refs from render to render");
// });

// describe("state", () => {
//   it("receives initialState");
//   it("calls getInitialState");
//   it("updates state");
// });

// describe("didMount", () => {
//   it("does not require it");
//   it("calls it with the right args");
// });

// describe("willUnmount", () => {
//   it("does not require it");
//   it("calls it with the right args");
// });

// describe("didUpdate", () => {
//   it("does not require it");
//   it("calls it with the right args");
// });

// describe("getSnapshotBeforeUpdate", () => {
//   it("does not require it");
//   it("calls it with the right args");
//   it("returns to cDU correctly");
// });

// describe("shouldUpdate", () => {
//   it("does not require it");
//   it("calls it with the right args");
//   it("returns correctly");
// });
