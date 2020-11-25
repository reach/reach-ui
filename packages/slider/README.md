# @reach/slider

[![Stable release](https://img.shields.io/npm/v/@reach/slider.svg)](https://npm.im/@reach/slider) ![MIT license](https://badgen.now.sh/badge/license/MIT)

[Docs](https://reach.tech/slider) | [Source](https://github.com/reach/reach-ui/tree/main/packages/slider) | [WAI-ARIA](https://www.w3.org/TR/wai-aria-practices-1.2/#slider)

A UI input component where the user selects a value from within a given range. A Slider has a handle that can be moved along a track to change its value. When the user's mouse or focus is on the Slider's handle, the value can be incremented with keyboard controls.

```jsx
import {
  Slider,
  SliderInput,
  SliderTrack,
  SliderRange,
  SliderHandle,
  SliderMarker,
} from "@reach/slider";
import "@reach/slider/styles.css";

function Example() {
  return <Slider min={0} max={200} step={10} />;
}

function ExampleComposed() {
  return (
    <SliderInput min={0} max={200} step={10}>
      <SliderTrack>
        <SliderRange />
        <SliderHandle />
      </SliderTrack>
    </SliderInput>
  );
}
```
