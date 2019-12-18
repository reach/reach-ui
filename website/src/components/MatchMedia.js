import { useLayoutEffect, useReducer, useMemo } from "react";
import createMediaListener from "./createMediaListener";

let canUseDOM = typeof window !== "undefined";

function reducer(state, action) {
  if (action.state) {
    return {
      ...state,
      ...action.state
    };
  }
  return state;
}

export function useMatchMedia(media) {
  let mediaListener = useMemo(
    () => (canUseDOM ? createMediaListener(media) : null),
    [media]
  );
  let [state, dispatch] = useReducer(
    reducer,
    mediaListener ? mediaListener.getState() : null
  );

  useLayoutEffect(() => {
    if (mediaListener) {
      mediaListener.listen(newState => dispatch({ state: newState }));
      return mediaListener.dispose;
    }
  }, [mediaListener]);

  return state;
}

export function MatchMedia({ media: mediaProp, children }) {
  let media = useMatchMedia(mediaProp);
  return children(media);
}
