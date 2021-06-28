import * as React from "react";
import { axe } from "jest-axe";
import { render } from "$test/utils";

const { useId } = jest.requireActual("@reach/auto-id");

describe("useId with axe", () => {
  it("should provide a valid ID for a11y", async () => {
    jest.useRealTimers();
    let { container } = render(<TestInput />);
    let results = await axe(container);
    expect(results).toHaveNoViolations();
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
