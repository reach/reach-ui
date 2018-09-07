declare module "@reach/window-size" {
  interface IWindowSizeProps {
    children: (
      size: { width: number; height: number }
    ) => React.ReactElement<any>;
  }
  class WindowSize extends React.Component<IWindowSizeProps, {}> {}
}
