import React from "react";
import { axe } from "jest-axe";
import { render } from "$test/utils";

const { useId } = jest.requireActual("@reach/auto-id");

describe("useId", () => {
  it("should provide a valid ID for a11y", async () => {
    let { container } = render(<TestInput />);
    let results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should generate a unique ID value", () => {
    function Comp() {
      const justNull = null;
      const randId = useId(justNull);
      const randId2 = useId();
      return (
        <div>
          <div id={randId}>Wow</div>
          <div id={randId2}>Ok</div>
        </div>
      );
    }
    const { getByText } = render(<Comp />);
    const id1 = Number(getByText("Wow").id);
    const id2 = Number(getByText("Ok").id);
    expect(id2).not.toEqual(id1);
  });
  it("uses a fallback ID", () => {
    function Comp() {
      const newId = useId("awesome");
      return <div id={newId}>Ok</div>;
    }
    const { getByText } = render(<Comp />);
    expect(getByText("Ok").id).toEqual("awesome");
  });
});

function TestInput() {
  let id = `name--${useId()}`;
  return (
    <div>
      <label htmlFor={id}>Name</label>
      <input name="name" id={id} type="text" />
    </div>
  );
}
