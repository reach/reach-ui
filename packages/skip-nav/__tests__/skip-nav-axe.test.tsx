import * as React from "react";
import { cleanup, render } from "@reach-internal/test/utils";
import { axe } from "vitest-axe";
import { SkipNavLink, SkipNavContent } from "@reach/skip-nav";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

describe("<SkipNavLink />", () => {
  describe("a11y", () => {
    it("Should not have ARIA violations", async () => {
      vi.useRealTimers();
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
          <button onClick={vi.fn}>Focus me</button>
        </main>
      </div>
    </div>
  );
}
