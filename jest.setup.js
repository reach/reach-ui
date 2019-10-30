import "@testing-library/jest-dom/extend-expect";

jest.mock("@reach/utils", () => ({
  ...jest.requireActual("@reach/utils"),
  checkStyles: jest.fn()
}));
