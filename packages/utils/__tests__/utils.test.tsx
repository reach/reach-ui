import { checkStyles } from "@reach/utils";

describe("@reach/utils", () => {
  let warn = console.warn;
  afterEach(() => (console.warn = warn));

  describe("checkStyles", () => {
    let consoleOutput: string[] = [];
    let mockedWarn = (output: any) => consoleOutput.push(output);
    beforeEach(() => (console.warn = mockedWarn));
    it("should not issue warnings while testing", () => {
      checkStyles("accordion");
      expect(consoleOutput).toEqual([]);
    });
  });
});
