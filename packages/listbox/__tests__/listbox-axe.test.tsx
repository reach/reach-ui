/// <reference types="vitest-axe/extend-expect" />
/// <reference types="vitest-dom/extend-expect" />

import * as React from "react";
import { cleanup, render, act } from "@reach-internal/test/utils";
import { axe } from "vitest-axe";
import type { AxeCore } from "vitest-axe";
import { Listbox, ListboxOption } from "@reach/listbox";
import type { ListboxProps } from "@reach/listbox";
import { VisuallyHidden } from "@reach/visually-hidden";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

describe("<Listbox /> with axe", () => {
  it("Should not have ARIA violations", async () => {
    vi.useRealTimers();
    let { container } = render(<FancyListbox />);
    let results: AxeCore.AxeResults = null as any;
    await act(async () => {
      results = await axe(container);
    });
    expect(results).toHaveNoViolations();
  });
});

function FancyListbox(props: Partial<Omit<ListboxProps, "ref">>) {
  return (
    <div>
      <VisuallyHidden id="taco-label">Choose a taco</VisuallyHidden>
      <Listbox
        aria-labelledby="taco-label"
        defaultValue="asada"
        portal={false}
        {...props}
      >
        <ListboxOption value="default">
          Choose a taco <Taco />
        </ListboxOption>
        <hr />
        <ListboxOption value="asada">
          Carne Asada <Taco />
        </ListboxOption>
        <ListboxOption value="pollo" disabled>
          Pollo <Taco /> <Tag>Sold Out!</Tag>
        </ListboxOption>
        <div style={{ background: "#ccc" }}>
          <ListboxOption value="pastor">
            Pastor <Taco /> <Tag>Fan favorite!</Tag>
          </ListboxOption>
        </div>
        <ListboxOption value="lengua">
          Lengua <Taco />
        </ListboxOption>
      </Listbox>
    </div>
  );
}

function Taco() {
  return (
    <span aria-hidden style={{ display: "inline-block", margin: "0 4px" }}>
      🌮
    </span>
  );
}

function Tag(props: any) {
  return (
    <span
      style={{
        display: "inline-block",
        lineHeight: 1,
        fontSize: 11,
        textTransform: "uppercase",
        fontWeight: "bolder",
        marginLeft: 6,
        padding: 4,
        background: "crimson",
        borderRadius: 2,
        color: "#fff",
      }}
      {...props}
    />
  );
}
