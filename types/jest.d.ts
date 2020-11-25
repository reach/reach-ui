declare namespace jest {
  interface Matchers<R> {
    toHaveNoViolations(): CustomMatcherResult;
    toHaveNoAxeViolations(): Promise<CustomMatcherResult>;
  }
}
