import * as React from "react";

export function msToTime(ms) {
  let seconds = Math.floor((ms / 1000) % 60);
  let minutes = Math.floor((ms / (1000 * 60)) % 60);
  let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  hours = hours < 10 && hours > 0 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return (hours ? hours + ":" : "") + minutes + ":" + seconds;
}

export function timeToMs(time) {
  return Math.round(time * 1000);
}

// https://github.com/streamich/react-use/blob/master/src/util/createHTMLMediaHook.ts
export function useAudio(elOrProps) {
  let element;
  let props;

  if (React.isValidElement(elOrProps)) {
    element = elOrProps;
    props = element.props;
  } else {
    props = elOrProps;
  }

  const [state, setState] = useSetState({
    buffered: [],
    time: 0,
    duration: 0,
    paused: true,
    muted: false,
    volume: 1,
  });
  const ref = React.useRef(null);
  const wrapEvent = (userEvent, proxyEvent) => {
    return (event) => {
      try {
        proxyEvent && proxyEvent(event);
      } finally {
        userEvent && userEvent(event);
      }
    };
  };

  const onPlay = () => setState({ paused: false });
  const onPause = () => setState({ paused: true });
  const onVolumeChange = () => {
    const el = ref.current;
    if (!el) {
      return;
    }
    setState({
      muted: el.muted,
      volume: el.volume,
    });
  };
  const onDurationChange = () => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const { duration, buffered } = el;
    setState({
      duration,
      buffered: parseTimeRanges(buffered),
    });
  };
  const onTimeUpdate = () => {
    const el = ref.current;
    if (!el) {
      return;
    }
    setState({ time: el.currentTime });
  };
  const onProgress = () => {
    const el = ref.current;
    if (!el) {
      return;
    }
    setState({ buffered: parseTimeRanges(el.buffered) });
  };

  if (element) {
    element = React.cloneElement(element, {
      controls: false,
      ...props,
      ref,
      onPlay: wrapEvent(props.onPlay, onPlay),
      onPause: wrapEvent(props.onPause, onPause),
      onVolumeChange: wrapEvent(props.onVolumeChange, onVolumeChange),
      onDurationChange: wrapEvent(props.onDurationChange, onDurationChange),
      onTimeUpdate: wrapEvent(props.onTimeUpdate, onTimeUpdate),
      onProgress: wrapEvent(props.onProgress, onProgress),
    });
  } else {
    element = React.createElement("audio", {
      controls: false,
      ...props,
      ref,
      onPlay: wrapEvent(props.onPlay, onPlay),
      onPause: wrapEvent(props.onPause, onPause),
      onVolumeChange: wrapEvent(props.onVolumeChange, onVolumeChange),
      onDurationChange: wrapEvent(props.onDurationChange, onDurationChange),
      onTimeUpdate: wrapEvent(props.onTimeUpdate, onTimeUpdate),
      onProgress: wrapEvent(props.onProgress, onProgress),
    });
  }

  // Some browsers return `Promise` on `.play()` and may throw errors
  // if one tries to execute another `.play()` or `.pause()` while that
  // promise is resolving. So we prevent that with this lock.
  // See: https://bugs.chromium.org/p/chromium/issues/detail?id=593273
  let lockPlay = false;

  const controls = {
    play: () => {
      const el = ref.current;
      if (!el) {
        return undefined;
      }

      if (!lockPlay) {
        const promise = el.play();
        const isPromise = typeof promise === "object";

        if (isPromise) {
          lockPlay = true;
          const resetLock = () => {
            lockPlay = false;
          };
          promise.then(resetLock, resetLock);
        }

        return promise;
      }
      return undefined;
    },
    pause: () => {
      const el = ref.current;
      if (el && !lockPlay) {
        return el.pause();
      }
    },
    seek: (time) => {
      const el = ref.current;
      if (!el || state.duration === undefined) {
        return;
      }
      time = Math.min(state.duration, Math.max(0, time));
      el.currentTime = time;
    },
    volume: (volume) => {
      const el = ref.current;
      if (!el) {
        return;
      }
      volume = Math.min(1, Math.max(0, volume));
      el.volume = volume;
      setState({ volume });
    },
    mute: () => {
      const el = ref.current;
      if (!el) {
        return;
      }
      el.muted = true;
    },
    unmute: () => {
      const el = ref.current;
      if (!el) {
        return;
      }
      el.muted = false;
    },
  };

  React.useEffect(() => {
    const el = ref.current;
    if (!el) {
      if (process.env.NODE_ENV !== "production") {
        console.error(
          "useAudio() ref to <audio> element is empty at mount. " +
            "It seem you have not rendered the audio element, which is " +
            "returns as the first argument const [audio] = useAudio(...)."
        );
      }
      return;
    }

    setState({
      volume: el.volume,
      muted: el.muted,
      paused: el.paused,
    });

    // Start media, if autoPlay requested.
    if (props.autoPlay && el.paused) {
      controls.play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.src]);

  return [element, state, controls, ref];
}

function useSetState(initialState) {
  const [state, set] = React.useState(initialState);
  const setState = React.useCallback(
    (patch) => {
      set((prevState) =>
        Object.assign(
          {},
          prevState,
          patch instanceof Function ? patch(prevState) : patch
        )
      );
    },
    [set]
  );
  return [state, setState];
}

function parseTimeRanges(ranges) {
  const result = [];
  for (let i = 0; i < ranges.length; i++) {
    result.push({
      start: ranges.start(i),
      end: ranges.end(i),
    });
  }
  return result;
}
