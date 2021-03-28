import { useRef, useEffect } from "react";

/**
 * Adds a DOM event listener
 *
 * @param eventName
 * @param listener
 * @param element
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  listener: (event: WindowEventMap[K]) => any,
  element: HTMLElement | Document | Window | EventTarget = window
) {
  const savedHandler = useRef(listener);
  useEffect(() => {
    savedHandler.current = listener;
  }, [listener]);

  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) {
      if (__DEV__) {
        console.warn("Event listener not supported on the element provided");
      }
      return;
    }

    function eventListener(event: WindowEventMap[K]) {
      savedHandler.current(event);
    }

    element.addEventListener(eventName, eventListener as any);
    return () => {
      element.removeEventListener(eventName, eventListener as any);
    };
  }, [eventName, element]);
}
