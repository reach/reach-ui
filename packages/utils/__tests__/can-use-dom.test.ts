import { canUseDOM } from "@reach/utils/can-use-dom";

describe("@reach/utils/can-use-dom", () => {
  describe("canUseDOM", () => {
    let windowSpy: jest.SpyInstance;

    beforeEach(() => {
      windowSpy = jest.spyOn(window, "window", "get");
    });

    afterEach(() => {
      windowSpy.mockRestore();
    });

    it("returns true with DOM globals", () => {
      // globals are defined in JS DOM by default
      expect(canUseDOM()).toBe(true);
    });

    it("returns false without DOM globals", () => {
      windowSpy.mockImplementation(() => undefined);
      expect(canUseDOM()).toBe(false);
    });
  });
});
