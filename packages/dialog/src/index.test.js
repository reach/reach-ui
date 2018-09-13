import React from "react";
import renderer from "react-test-renderer";
import { Dialog } from "./index";

describe("rendering", () => {
  it("does not render children when not open", () => {
    let wrapper = renderer.create(
      <div lang="gr">
        <Dialog isOpen={false}>
          <div lang="en" />
        </Dialog>
      </div>
    );
    expect(wrapper.root.findAllByProps({ lang: "gr" })).toHaveLength(1);
    expect(wrapper.root.findAllByProps({ lang: "en" })).toHaveLength(0);
    expect(wrapper.toJSON()).toMatchSnapshot();
  });
});

describe.skip("refs", () => {});

describe.skip("didMount", () => {});

describe.skip("willUnmount", () => {});
