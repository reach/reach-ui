import * as React from "react";

export function msToTime(ms: number) {
	let seconds = Math.floor((ms / 1000) % 60);
	let minutes = Math.floor((ms / (1000 * 60)) % 60);
	let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

	let hoursStr = hours < 10 && hours > 0 ? "0" + hours : hours;
	let minutesStr = minutes < 10 ? "0" + minutes : minutes;
	let secondsStr = seconds < 10 ? "0" + seconds : seconds;

	return (hoursStr ? hoursStr + ":" : "") + minutesStr + ":" + secondsStr;
}

export function timeToMs(time: number) {
	return Math.round(time * 1000);
}

// https://github.com/streamich/react-use/blob/master/src/util/createHTMLMediaHook.ts
export function useAudio(
	elementOrProps: AudioDOMElement | AudioProps
): [AudioElement, AudioState, AudioControls, AudioRef] {
	let domElement: AudioDOMElement | null = null;
	let props: AudioProps;

	if (React.isValidElement(elementOrProps)) {
		domElement = elementOrProps;
		props = domElement.props;
	} else {
		props = elementOrProps;
	}

	const [state, setState] = React.useState<AudioState>({
		buffered: [],
		time: 0,
		duration: 0,
		paused: true,
		muted: false,
		volume: 1,
	});
	let ref = React.useRef<HTMLAudioElement | null>(null);

	function onPlay() {
		return setState((prev) => ({ ...prev, paused: false }));
	}

	function onPause() {
		return setState((prev) => ({ ...prev, paused: true }));
	}

	function onVolumeChange() {
		let el = ref.current;
		setState((prev) =>
			el ? { ...prev, muted: el.muted, volume: el.volume } : prev
		);
	}

	function onDurationChange() {
		let el = ref.current;
		if (!el) {
			return;
		}
		let { duration, buffered } = el;
		setState((prev) => ({
			...prev,
			duration,
			buffered: parseTimeRanges(buffered),
		}));
	}
	const onTimeUpdate = () => {
		let el = ref.current;
		setState((prev) => (el ? { ...prev, time: el.currentTime } : prev));
	};
	const onProgress = () => {
		let el = ref.current;
		setState((prev) =>
			el ? { ...prev, buffered: parseTimeRanges(el.buffered) } : prev
		);
	};

	let reactElement: AudioElement;
	if (domElement) {
		reactElement = React.cloneElement(domElement, {
			controls: false,
			...props,
			// @ts-ignore
			ref,
			onPlay: wrapEvent(props.onPlay, onPlay),
			onPause: wrapEvent(props.onPause, onPause),
			onVolumeChange: wrapEvent(props.onVolumeChange, onVolumeChange),
			onDurationChange: wrapEvent(props.onDurationChange, onDurationChange),
			onTimeUpdate: wrapEvent(props.onTimeUpdate, onTimeUpdate),
			onProgress: wrapEvent(props.onProgress, onProgress),
		});
	} else {
		reactElement = React.createElement("audio", {
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

	let controls: AudioControls = {
		play() {
			let el = ref.current;
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
		pause() {
			let el = ref.current;
			if (el && !lockPlay) {
				return el.pause();
			}
		},
		seek(time) {
			let el = ref.current;
			if (!el || state.duration === undefined) {
				return;
			}
			time = Math.min(state.duration, Math.max(0, time));
			el.currentTime = time;
		},
		volume(volume) {
			let el = ref.current;
			if (!el) {
				return;
			}
			volume = Math.min(1, Math.max(0, volume));
			el.volume = volume;
			setState((prev) => ({ ...prev, volume }));
		},
		mute() {
			const el = ref.current;
			if (!el) {
				return;
			}
			el.muted = true;
		},
		unmute() {
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

		setState((prev) => ({
			...prev,
			volume: el.volume,
			muted: el.muted,
			paused: el.paused,
		}));

		// Start media, if autoPlay requested.
		if (props.autoPlay && el.paused) {
			controls.play();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.src]);

	return [reactElement, state, controls, ref];
}

interface ParsedTimeRange {
	start: number;
	end: number;
}

function parseTimeRanges(ranges: TimeRanges): ParsedTimeRange[] {
	let result = [];
	for (let i = 0; i < ranges.length; i++) {
		result.push({
			start: ranges.start(i),
			end: ranges.end(i),
		});
	}
	return result;
}

export function wrapEvent<EventType extends React.SyntheticEvent | Event>(
	proxyEvent: ((event: EventType) => any) | undefined,
	userEvent: (event: EventType) => any
): (event: EventType) => any {
	return (event) => {
		try {
			proxyEvent?.(event);
		} finally {
			userEvent?.(event);
		}
	};
}

interface AudioState {
	buffered: ParsedTimeRange[];
	time: number;
	duration: number;
	paused: boolean;
	muted: boolean;
	volume: number;
}

interface AudioControls {
	play(): void;
	pause(): void;
	seek(time: number): void;
	volume(vol: number): void;
	mute(): void;
	unmute(): void;
}

type AudioRef = React.MutableRefObject<HTMLAudioElement | null>;
type AudioProps = React.ComponentPropsWithoutRef<"audio">;
type AudioDOMElement = React.ReactElement<AudioProps, "audio">;
type AudioElement = React.DetailedReactHTMLElement<
	Pick<
		React.DetailedHTMLProps<
			React.AudioHTMLAttributes<HTMLAudioElement>,
			HTMLAudioElement
		>,
		"key" | keyof React.AudioHTMLAttributes<HTMLAudioElement>
	>,
	HTMLElement
>;
