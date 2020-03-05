import React, { useRef, useEffect, useState, forwardRef } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  useAccordionItemContext,
} from "@reach/accordion";
import { animated, config, useSpring } from "react-spring";
import { action } from "@storybook/addon-actions";
import "@reach/accordion/styles.css";

let name = "Animated";

function useDivHeight() {
  const ref = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(([entry]) => {
      requestAnimationFrame(() => {
        if (!entry) {
          return;
        }
        setHeight(entry.target.getBoundingClientRect().height);
      });
    });

    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return { ref, height };
}

function Example() {
  return (
    <Accordion defaultIndex={2} onChange={action(`Selecting panel`)}>
      <AccordionItem>
        <AccordionButton>I am animated!</AccordionButton>
        <AnimatedPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AnimatedPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton>Me too!</AccordionButton>
        <AnimatedPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AnimatedPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton>Look ma', auto height animations!</AccordionButton>
        <AnimatedPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AnimatedPanel>
      </AccordionItem>
    </Accordion>
  );
}

const AnimatedAccordionPanel = animated(AccordionPanel);

const AnimatedPanel = forwardRef(({ children }, forwardedRef) => {
  const { open } = useAccordionItemContext();
  const { ref, height } = useDivHeight();
  const animation = useSpring({
    opacity: open ? 1 : 0,
    height: open ? height : 0,
    overflow: "hidden",
    config: config.default,
  });

  return (
    <AnimatedAccordionPanel style={animation} hidden={false} ref={forwardedRef}>
      <div ref={ref}>{children}</div>
    </AnimatedAccordionPanel>
  );
});

Example.story = { name };
export const Comp = Example;
export default { title: "Accordion" };
