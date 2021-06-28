import * as React from "react";
// import renderer from "react-test-renderer";
// import { act } from "react-dom/test-utils";
import { render, fireEvent } from "$test/utils";
import {
  Slider,
  SliderHandle,
  SliderInput,
  SliderMarker,
  SliderTrack,
  SliderRange,
  // SLIDER_HANDLE_ALIGN_CENTER,
  // SLIDER_HANDLE_ALIGN_CONTAIN,
  // SLIDER_ORIENTATION_HORIZONTAL,
  // SLIDER_ORIENTATION_VERTICAL
} from "@reach/slider";

const getCurrentValue = (el: HTMLElement) =>
  Number(el.getAttribute("aria-valuenow"));

describe("<Slider />", () => {
  describe("rendering", () => {});

  //   describe("a11y", () => {
  //   });

  describe("user events", () => {
    it("updates marker state as value is exceeded", () => {
      const min = 0;
      const max = 100;
      const { getByRole, getByTestId } = render(
        <SliderInput aria-label="highlighter" min={min} max={max}>
          <SliderTrack>
            <SliderRange />
            <SliderHandle />
            <SliderMarker data-testid="handle-1" value={20} />
            <SliderMarker data-testid="handle-2" value={40} />
            <SliderMarker data-testid="handle-3" value={60} />
            <SliderMarker data-testid="handle-4" value={80} />
          </SliderTrack>
        </SliderInput>
      );

      // markers get this attribute to style highlights
      const handle = getByRole("slider");

      expect(getByTestId("handle-2").getAttribute("data-state")).toBe(
        "over-value"
      );

      fireEvent.keyDown(handle, { key: "PageUp", code: 33 });
      fireEvent.keyDown(handle, { key: "PageUp", code: 33 });
      fireEvent.keyDown(handle, { key: "PageUp", code: 33 });
      fireEvent.keyDown(handle, { key: "PageUp", code: 33 });
      fireEvent.keyDown(handle, { key: "PageUp", code: 33 });

      expect(getByTestId("handle-2").getAttribute("data-state")).toBe(
        "under-value"
      );
    });

    it("moves the handle", () => {
      const min = 0;
      const max = 100;
      const keyStep = (max - min) / 100;
      const tenSteps = (max - min) / 10;

      const { getByRole } = render(
        <SliderInput aria-label="mover" min={min} max={max}>
          <SliderTrack>
            <SliderRange />
            <SliderHandle />
          </SliderTrack>
        </SliderInput>
      );
      const handle = getByRole("slider");
      const startingValue = getCurrentValue(handle);

      fireEvent.click(handle);

      fireEvent.keyDown(handle, { key: "ArrowRight", code: 39 });
      fireEvent.keyDown(handle, { key: "ArrowRight", code: 39 });

      expect(getCurrentValue(handle)).toEqual(startingValue + keyStep * 2);

      fireEvent.keyDown(handle, { key: "ArrowLeft", code: 37 });
      fireEvent.keyDown(handle, { key: "ArrowLeft", code: 37 });

      expect(getCurrentValue(handle)).toEqual(startingValue);

      fireEvent.keyDown(handle, { key: "End", code: 35 });
      expect(getCurrentValue(handle)).toEqual(max);

      fireEvent.keyDown(handle, { key: "Home", code: 36 });
      expect(getCurrentValue(handle)).toEqual(min);

      fireEvent.keyDown(handle, { key: "Home", code: 36 });
      expect(getCurrentValue(handle)).toEqual(min);

      fireEvent.keyDown(handle, { key: "PageUp", code: 33 });
      fireEvent.keyDown(handle, { key: "PageUp", code: 33 });
      expect(getCurrentValue(handle)).toEqual(min + tenSteps * 2);

      fireEvent.keyDown(handle, { key: "PageDown", code: 34 });
      expect(getCurrentValue(handle)).toEqual(min + tenSteps);
    });

    it("does not move when disabled", () => {
      const { getByRole } = render(
        <SliderInput aria-label="mover" disabled>
          <SliderTrack>
            <SliderRange />
            <SliderHandle />
          </SliderTrack>
        </SliderInput>
      );
      const handle = getByRole("slider");

      fireEvent.click(handle);

      fireEvent.keyDown(handle, { key: "ArrowRight", code: 39 });
      fireEvent.keyDown(handle, { key: "ArrowRight", code: 39 });

      expect(getCurrentValue(handle)).toEqual(0);
    });
  });
});
