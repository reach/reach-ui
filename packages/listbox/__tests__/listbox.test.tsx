import React from "react";
import { render, act, fireEvent, userEvent } from "$test/utils";
import { axe } from "jest-axe";
import { Listbox, ListboxOption } from "@reach/listbox";
import VisuallyHidden from "@reach/visually-hidden";

describe("<Listbox />", () => {
  it("should not have basic a11y issues", async () => {
    const { container } = render(<BasicListbox />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should toggle on button click", () => {
    let { getByRole, container } = render(<BasicListbox />);
    let getPopover = () =>
      container.querySelector("[data-reach-listbox-popover]");

    // Listbox opens on mousedown, not click!
    function clickButton() {
      fireEvent.mouseDown(getByRole("button"));
      fireEvent.mouseUp(getByRole("button"));
    }

    expect(getPopover()).not.toBeVisible();
    act(clickButton);
    expect(getPopover()).toBeVisible();
    act(clickButton);
    expect(getPopover()).not.toBeVisible();

    // Listbox doesn't use an HTML5 button, so we also need to test keyboard
    // events
  });
});

function BasicListbox() {
  return (
    <div>
      <VisuallyHidden id="taco-label">Choose a taco</VisuallyHidden>
      <Listbox aria-labelledby="taco-label" defaultValue="asada" portal={false}>
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
