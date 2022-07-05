import * as React from "react";
import { axe } from "vitest-axe";
import { render, cleanup } from "@reach-internal/test/utils";
import { vi, it, expect, describe, afterEach } from "vitest";

const { useId } = await vi.importActual<typeof import("../src/index")>(
  "@reach/auto-id"
);

afterEach(cleanup);

describe("useId with axe", () => {
  it("should provide a valid ID for a11y", async () => {
    vi.useRealTimers();
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
