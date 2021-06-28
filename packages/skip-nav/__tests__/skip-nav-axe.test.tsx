import * as React from "react";
import { render /* act, fireEvent */ } from "$test/utils";
import { axe } from "jest-axe";
import { SkipNavLink, SkipNavContent } from "@reach/skip-nav";

describe("<SkipNavLink />", () => {
  describe("a11y", () => {
    it("Should not have ARIA violations", async () => {
      jest.useRealTimers();
      let { container } = render(<Layout />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
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
