import React, { useEffect, useState } from "react";
import { Slider } from "@reach/slider";
import { useAudio, timeToMs, msToTime } from "./utils.js";
import "@reach/slider/styles.css";

export const name = "Audio Progress";

export function Example() {
  const [value, setValue] = useState(0);
  const [max, setMax] = useState(1000);
  const [audio, audioState, audioControls, audioRef] = useAudio({
    src: "http://techslides.com/demos/samples/sample.mp3",
    autoPlay: false,
    controls: true,
    onLoadedMetadata: function(event) {
      if (audioRef.current) {
        setMax(Math.round(timeToMs(audioRef.current.duration)));
      }
    }
  });

  function handleChange(newValue) {
    if (audioRef.current && audioControls) {
      audioControls.seek(newValue / 1000);
    }
  }

  useEffect(() => {
    if (audioState.time != null) {
      setValue(timeToMs(audioState.time));
    }
  }, [audioState.time]);

  return (
    <div>
      <Slider
        onChange={handleChange}
        value={value}
        min={0}
        max={max}
        getValueText={val => msToTime(val)}
      ></Slider>
      {audio}
    </div>
  );
}
