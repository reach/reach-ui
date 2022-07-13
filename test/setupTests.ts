import "vitest-axe/extend-expect";
import "vitest-dom/extend-expect";
import * as axeMatchers from "vitest-axe/matchers";
import * as domMatchers from "vitest-dom/matchers";
import { beforeAll, expect, vi } from "vitest";

expect.extend(axeMatchers);
expect.extend(domMatchers);

beforeAll(() => {
  vi.mock("@reach/auto-id", () => {
    return {
      useId: (fallback: string) => fallback || "REACH-ID",
    };
  });

  vi.mock("@reach/rect", () => {
    return {
      useRect: () => ({ height: 1, width: 1, x: 0, y: 0 }),
    };
  });
});
