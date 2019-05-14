import React, { useRef, forwardRef } from "react";
import Portal from "@reach/portal";
import { useRect } from "@reach/rect";
import { assignRef } from "@reach/utils";

export default forwardRef(function Popover(props, ref) {
  return (
    <Portal>
      <PopoverImpl ref={ref} {...props} />
    </Portal>
  );
});

// Popover is conditionally rendered so we can't start measuring until it shows
// up, so useRect needs to live down here not up in Popover
const PopoverImpl = forwardRef(function PopoverImpl(
  { targetRef, position = positionDefault, style, ...rest },
  forwardedRef
) {
  const popupRef = useRef();
  const popupRect = useRect(popupRef);
  const targetRect = useRect(targetRef);
  return (
    <div
      data-reach-popover=""
      ref={node => {
        assignRef(popupRef, node);
        assignRef(forwardedRef, node);
      }}
      style={{
        ...style,
        position: "absolute",
        ...getStyles(position, targetRect, popupRect)
      }}
      {...rest}
    />
  );
});

const getStyles = (position, targetRect, popupRect) => {
  const needToMeasurePopup = !popupRect;
  if (needToMeasurePopup) {
    return { visibility: "hidden" };
  }
  return position(targetRect, popupRect);
};

export function positionDefault(targetRect, popupRect) {
  const { directionUp, directionRight } = getCollisions(targetRect, popupRect);
  return {
    left: directionRight
      ? `${targetRect.right - popupRect.width + window.scrollX}px`
      : `${targetRect.left + window.scrollX}px`,
    top: directionUp
      ? `${targetRect.top - popupRect.height + window.scrollY}px`
      : `${targetRect.top + targetRect.height + window.scrollY}px`
  };
}

export function positionMatchWidth(targetRect, popupRect) {
  const { directionUp } = getCollisions(targetRect, popupRect);
  return {
    width: targetRect.width,
    left: targetRect.left,
    top: directionUp
      ? `${targetRect.top - popupRect.height + window.scrollY}px`
      : `${targetRect.top + targetRect.height + window.scrollY}px`
  };
}

// Finish this another time
// export function positionHorizontalCenter(targetRect, popupRect) {
//   const targetCenter = targetRect.width / 2 + targetRect.left;
//   const popupHalf = popupRect.width / 2;

//   const collisions = {
//     right: window.innerWidth < targetCenter - popupHalf,
//     left: targetCenter - popupHalf < 0
//     // top:
//     // bottom:
//   };

//   return {
//     left: collisions.right
//       ? `${targetRect.right - popupRect.width + window.scrollX}px`
//       : collisions.left ? `` : ``
//   };
// }

function getCollisions(
  targetRect,
  popupRect,
  offsetLeft = 0,
  offsetBottom = 0
) {
  const collisions = {
    top: targetRect.top - popupRect.height < 0,
    right: window.innerWidth < targetRect.left + popupRect.width - offsetLeft,
    bottom:
      window.innerHeight < targetRect.bottom + popupRect.height - offsetBottom,
    left: targetRect.left - popupRect.width < 0
  };

  const directionRight = collisions.right && !collisions.left;
  const directionUp = collisions.bottom && !collisions.top;

  return { directionRight, directionUp };
}
