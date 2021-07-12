import * as React from "react";
import { SkipNavLink, SkipNavContent } from "@reach/skip-nav";
import "@reach/skip-nav/styles.css";
import { action } from "@storybook/addon-actions";

let name = "With custom ID";

function Example() {
  return (
    <div>
      <SkipNavLink contentId="whatever">Skip Nav</SkipNavLink>
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
        <SkipNavContent id="whatever">
          <main>
            <h1>Welcome to the good stuff!</h1>
            <button onClick={action("Focus click")}>Focus me</button>
          </main>
        </SkipNavContent>
      </div>
    </div>
  );
}

Example.storyName = name;
export { Example };
