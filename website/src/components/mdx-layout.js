import * as React from "react";
import { MDXProvider } from "@mdx-js/react";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from "@reach/accordion";
import { Alert } from "@reach/alert";
import {
  AlertDialog,
  AlertDialogLabel,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogContent,
} from "@reach/alert-dialog";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@reach/disclosure";
import { useId } from "@reach/auto-id";
import {
  CustomCheckbox,
  CustomCheckboxContainer,
  CustomCheckboxInput,
  MixedCheckbox,
  useMixedCheckbox,
} from "@reach/checkbox";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
  useComboboxContext,
} from "@reach/combobox";
import {
  Listbox,
  ListboxInput,
  ListboxButton,
  ListboxArrow,
  ListboxPopover,
  ListboxList,
  ListboxOption,
  ListboxGroup,
  ListboxGroupLabel,
} from "@reach/listbox";
import { Component } from "@reach/component-component";
import { Dialog, DialogOverlay, DialogContent } from "@reach/dialog";
import {
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuPopover,
  MenuLink,
} from "@reach/menu-button";
import { Portal } from "@reach/portal";
import { useRect, Rect } from "@reach/rect";
import {
  Slider,
  SliderInput,
  SliderTrack,
  SliderRange,
  SliderHandle,
  SliderMarker,
} from "@reach/slider";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useTabsContext,
} from "@reach/tabs";
import { useTooltip, TooltipPopup, Tooltip } from "@reach/tooltip";
import { VisuallyHidden } from "@reach/visually-hidden";
import { useWindowSize, WindowSize } from "@reach/window-size";
import { Link as GatsbyLink } from "gatsby";
import { matchSorter } from "match-sorter";
import { useTransition, animated } from "@react-spring/web";
import { Phased } from "recondition";
import { useThrottle } from "use-throttle";
import Layout from "./Layout";
import { Table, Caption } from "./Table";
import { PreComponent } from "./MdxPre";
import "../styles/app.scss";

let firstLoad = true;

function MyPageLayout({ children }) {
  let contentFocusRef = React.useRef(null);
  React.useEffect(() => {
    if (firstLoad) {
      firstLoad = false;
    } else if (contentFocusRef.current) {
      /*
       * If it exists, focus the first H1 heading we find in the main content
       * area instead of the content area itself.
       * We could also consider injecting a "skip back" link component per the
       * suggestions in the Gatsby blog which could be a cool POC
       * https://www.gatsbyjs.org/blog/2019-07-11-user-testing-accessible-client-routing/
       */
      let sectionHeading = contentFocusRef.current.querySelector("h1");
      let focusNode = sectionHeading || contentFocusRef.current;
      focusNode.tabIndex = -1;
      focusNode.focus();
    }
    // I dunno, I just made it global on window, whatever...
    import("./cities.js");
  }, []);

  let {
    // blerg es modules
    default: defaultReactExport,
    ...allReactExports
  } = React;

  return (
    <Layout>
      <MDXProvider
        components={{
          pre: function (props) {
            return (
              <PreComponent
                {...props}
                theme={{ plain: {}, styles: [] }}
                scope={{
                  ...allReactExports,
                  React: defaultReactExport,
                  Accordion,
                  AccordionButton,
                  AccordionItem,
                  AccordionPanel,
                  Alert,
                  AlertDialog,
                  AlertDialogContent,
                  AlertDialogDescription,
                  AlertDialogLabel,
                  AlertDialogOverlay,
                  animated,
                  Combobox,
                  ComboboxInput,
                  ComboboxList,
                  ComboboxOption,
                  ComboboxOptionText,
                  ComboboxPopover,
                  Component,
                  CustomCheckbox,
                  CustomCheckboxContainer,
                  CustomCheckboxInput,
                  Dialog,
                  DialogContent,
                  DialogOverlay,
                  Disclosure,
                  DisclosureButton,
                  DisclosurePanel,
                  GatsbyLink,
                  Listbox,
                  ListboxInput,
                  ListboxButton,
                  ListboxArrow,
                  ListboxPopover,
                  ListboxList,
                  ListboxOption,
                  ListboxGroup,
                  ListboxGroupLabel,
                  matchSorter,
                  Menu,
                  MenuButton,
                  MenuItem,
                  MenuItems,
                  MenuLink,
                  MenuList,
                  MenuPopover,
                  MixedCheckbox,
                  Phased,
                  Portal,
                  Rect,
                  Slider,
                  SliderHandle,
                  SliderInput,
                  SliderMarker,
                  SliderTrack,
                  SliderRange,
                  Tab,
                  TabList,
                  TabPanel,
                  TabPanels,
                  Tabs,
                  Tooltip,
                  TooltipPopup,
                  useComboboxContext,
                  useId,
                  useMixedCheckbox,
                  useRect,
                  useTabsContext,
                  useThrottle,
                  useTooltip,
                  useTransition,
                  useWindowSize,
                  VisuallyHidden,
                  WindowSize,
                }}
              />
            );
          },
          table: Table,
          caption: Caption,
        }}
      >
        <main>
          <div ref={contentFocusRef}>{children}</div>
        </main>
      </MDXProvider>
    </Layout>
  );
}

export default MyPageLayout;
