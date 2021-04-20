/**
 * Detects right clicks
 *
 * @param nativeEvent
 */
export function isRightClick(
  nativeEvent: MouseEvent | PointerEvent | TouchEvent
) {
  return "which" in nativeEvent
    ? nativeEvent.which === 3
    : "button" in nativeEvent
    ? (nativeEvent as any).button === 2
    : false;
}
