import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  useAccordionItemContext,
} from "@reach/accordion";
import { animated, useSpring } from "@react-spring/web";
import { action } from "@storybook/addon-actions";
import "@reach/accordion/styles.css";

let name = "Animated";

function useDivHeight() {
  const ref = React.useRef(null);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
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

const AnimatedPanel = React.forwardRef(({ children }, forwardedRef) => {
  const { isExpanded } = useAccordionItemContext();
  const { ref, height } = useDivHeight();
  const animation = useSpring({
    opacity: isExpanded ? 1 : 0,
    height: isExpanded ? height : 0,
    overflow: "hidden",
  });

  return (
    <AnimatedAccordionPanel
      style={animation}
      // We need to set hidden to false for the exit animations to work
      // but the panel should still be hidden from the accessibility tree
      // when the panel is closed. We'll use aria-hidden instead.
      hidden={false}
      aria-hidden={!isExpanded || undefined}
      ref={forwardedRef}
    >
      <div ref={ref}>{children}</div>
    </AnimatedAccordionPanel>
  );
});

Example.storyName = name;
export { Example };
