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

describe.skip("refs", () => {
  it("maintains refs from render to render", () => {
    let wrapper = renderer.create(
      <Component
        getRefs={() => ({ button: React.createRef() })}
        initialState={{ value: "!" }}
        didUpdate={({ refs }) => {
          // refs.button.current.focus()
        }}
        render={({ refs, state, setState }) => (
          <button
            ref={refs.button}
            onClick={() => {
              setState(prevState => ({ value: prevState.value + "!" }));
            }}
          >
            {state.value}
          </button>
        )}
      />
    );
    let tree = wrapper.toJSON();
    expect(tree).toMatchSnapshot();
    tree.props.onClick();
    tree = wrapper.toJSON();
    expect(tree.children).toEqual(["!!"]);
  });
});

describe("state", () => {
  it("receives initialState", () => {
    let wrapper = renderer.create(<Component initialState={{ value: "!" }} />);
    expect(wrapper.toTree().props.initialState).toEqual({ value: "!" });
  });
  it("calls getInitialState", () => {
    let wrapper = renderer.create(
      <Component getInitialState={() => ({ value: "!" })} />
    );
    expect(wrapper.toTree().props.getInitialState()).toEqual({ value: "!" });
  });
  it("updates state", () => {
    let wrapper = renderer.create(
      <Component
        initialState={{ lang: "en" }}
        render={({ state, setState }) => (
          <div
            lang={state.lang}
            onMouseEnter={() => {
              setState({ lang: "fr" });
            }}
          />
        )}
      />
    );
    let tree = wrapper.toJSON();
    expect(tree).toMatchSnapshot();
    tree.props.onMouseEnter();
    tree = wrapper.toJSON();
    expect(wrapper.root.findByProps({ lang: "fr" })).toBeTruthy();
  });
});

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
