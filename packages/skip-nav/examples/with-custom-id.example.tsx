import * as React from "react";
import { SkipNavLink, SkipNavContent } from "@reach/skip-nav";
import "@reach/skip-nav/styles.css";

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
            <button onClick={() => console.log("Focus click")}>Focus me</button>
          </main>
        </SkipNavContent>
      </div>
    </div>
  );
}

Example.displayName = "SkipNav.WithCustomId";
export default Example;
