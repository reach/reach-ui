import React from "react";
import { createPortal } from "react-dom";

let Portal = ({ children, type = "reach-portal" }) => {
  const mountNode = React.useRef(null);
  const portalNode = React.useRef(null);
  const forceUpdate = useForceUpdate();
  React.useEffect(() => {
    // It's possible that the content we are portal has, itself, been portaled.
    // In that case, it's important to append to the correct document element.
    const ownerDocument = mountNode.current.ownerDocument;
    portalNode.current = ownerDocument.createElement(type);
    forceUpdate();
    return () => {
      portalNode.current.ownerDocument.body.removeChild(portalNode.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);
  return !portalNode.current ? (
    <div ref={mountNode} />
  ) : (
    createPortal(children, portalNode.current)
  );
};

export default Portal;

function useForceUpdate() {
  const [, dispatch] = React.useState(Object.create(null));
  const update = React.useCallback(() => {
    dispatch(Object.create(null));
  }, [dispatch]);
  return update;
}
