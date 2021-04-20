import { checkStyles, useCheckStyles } from "@reach/utils/dev-utils";
import { renderHook } from "@testing-library/react-hooks";

describe("@reach/utils/dev-utils", () => {
  describe("checkStyles", () => {
    let originalWarn = console.warn;
    let consoleOutput: string[] = [];
    let mockedWarn = (output: any) => consoleOutput.push(output);

    beforeEach(() => {
      console.warn = mockedWarn;
    });

    afterEach(() => {
      console.warn = originalWarn;
    });

    describe("when process.env.NODE_ENV === 'test'", () => {
      afterEach(() => {
        consoleOutput = [];
      });

      it("should not issue warnings", () => {
        checkStyles("accordion");
        expect(consoleOutput).toHaveLength(0);
      });
    });

    describe("when process.env.NODE_ENV === 'production'", () => {
      const OLD_ENV = process.env;

      beforeAll(() => {
        jest.resetModules(); // clears jest cache
        process.env = { ...OLD_ENV, NODE_ENV: "production" };
      });

      afterEach(() => {
        consoleOutput = [];
      });

      afterAll(() => {
        process.env = OLD_ENV;
      });

      it("should not issue warnings", () => {
        checkStyles("listbox");
        expect(consoleOutput).toHaveLength(0);
      });
    });

    describe("when process.env.NODE_ENV === 'development'", () => {
      const OLD_ENV = process.env;

      beforeAll(() => {
        jest.resetModules(); // clears jest cache
        process.env = { ...OLD_ENV, NODE_ENV: "development" };
      });

      afterEach(() => {
        consoleOutput = [];
      });

      afterAll(() => {
        process.env = OLD_ENV;
      });

      it("should issue warnings", () => {
        checkStyles("slider");
        expect(consoleOutput).toHaveLength(1);
      });

      it("should issue additional warnings for other packages", () => {
        checkStyles("tabs");
        expect(consoleOutput).toHaveLength(1);
      });

      it("should not issue warnings for the same package more than once", () => {
        checkStyles("tabs");
        expect(consoleOutput).toHaveLength(0);
      });

      it("should not issue warnings when --reach-{package} is set", () => {
        document.body.style.setProperty("--reach-combobox", "1");
        checkStyles("combobox");
        expect(consoleOutput).toHaveLength(0);

        // clear custom property
        document.body.style.setProperty("--reach-combobox", null);
      });
    });
  });

  describe("useCheckStyles", () => {
    let originalWarn = console.warn;
    let consoleOutput: string[] = [];
    let mockedWarn = (output: any) => consoleOutput.push(output);

    beforeEach(() => {
      console.warn = mockedWarn;
    });

    afterEach(() => {
      console.warn = originalWarn;
    });

    describe("when process.env.NODE_ENV === 'test'", () => {
      afterEach(() => {
        consoleOutput = [];
      });

      it("should not issue warnings", () => {
        renderHook(() => useCheckStyles("tooltip"));
        expect(consoleOutput).toHaveLength(0);
      });
    });

    describe("when process.env.NODE_ENV === 'production'", () => {
      const OLD_ENV = process.env;

      beforeAll(() => {
        jest.resetModules(); // clears jest cache
        process.env = { ...OLD_ENV, NODE_ENV: "production" };
      });

      afterEach(() => {
        consoleOutput = [];
      });

      afterAll(() => {
        process.env = OLD_ENV;
      });

      it("should not issue warnings", () => {
        renderHook(() => useCheckStyles("menu-button"));
        expect(consoleOutput).toHaveLength(0);
      });
    });

    describe("when process.env.NODE_ENV === 'development'", () => {
      const OLD_ENV = process.env;

      beforeAll(() => {
        jest.resetModules(); // clears jest cache
        process.env = { ...OLD_ENV, NODE_ENV: "development" };
      });

      afterEach(() => {
        consoleOutput = [];
      });

      afterAll(() => {
        process.env = OLD_ENV;
      });

      it("should issue warnings", () => {
        renderHook(() => useCheckStyles("checkbox"));
        expect(consoleOutput).toHaveLength(1);
      });

      it("should issue additional warnings for other packages", () => {
        renderHook(() => useCheckStyles("dialog"));
        expect(consoleOutput).toHaveLength(1);
      });

      it("should not issue warnings for the same package more than once", () => {
        renderHook(() => useCheckStyles("dialog"));
        expect(consoleOutput).toHaveLength(0);
      });

      it("should not issue warnings when --reach-{package} is set", () => {
        document.body.style.setProperty("--reach-disclosure", "1");
        renderHook(() => useCheckStyles("disclosure"));
        expect(consoleOutput).toHaveLength(0);

        // clear custom property
        document.body.style.setProperty("--reach-disclosure", null);
      });
    });
  });

  // TODO: Help wanted :)
  // describe("useStateLogger", () => {});

  // TODO: Help wanted :)
  // describe("useControlledSwitchWarning", () => {});
});
