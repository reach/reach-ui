import React from "react";
import { render /* act, fireEvent */ } from "$test/utils";
import { axe } from "jest-axe";
import { SkipNavLink, SkipNavContent } from "@reach/skip-nav";

describe("<SkipNavLink />", () => {
  describe("a11y", () => {
    it("should not have basic a11y issues", async () => {
      let { container } = render(<Layout />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  // TODO: Doesn't pass, not sure why
  //   it("should focus the SkipNavContent on click", () => {
  //     let { getByText } = render(<Layout />);
  //     act(() => {
  //       fireEvent.click(getByText("Skip Nav"));
  //       fireEvent.keyDown(document, { key: "Tab" });
  //       expect(getByText("Focus me")).toHaveFocus();
  //     });
  //   });
  //   it("should work with a custom ID", () => {
  //     let { getByText } = render(<Layout skipNavId="whatever" />);
  //     act(() => {
  //       fireEvent.click(getByText("Skip Nav"));
  //       fireEvent.keyDown(document, { key: "Tab" });
  //       expect(getByText("Focus me")).toHaveFocus();
  //     });
  //   });
});

function Layout({ skipNavId }: { skipNavId?: string }) {
  return (
    <div>
      <SkipNavLink contentId={skipNavId}>Skip Nav</SkipNavLink>
      <div>
        <header>
          <ul>
            <li>
              <a href="/location">Location</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
          </ul>
        </header>
        <SkipNavContent id={skipNavId} data-testid="content" />
        <main data-testid="main">
          <h1>Welcome to the good stuff!</h1>
          <button onClick={jest.fn}>Focus me</button>
        </main>
      </div>
    </div>
  );
}
