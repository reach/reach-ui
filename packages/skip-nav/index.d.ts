declare module "@reach/skip-nav" {
  interface ISkipNavProps {
    children: string | JSX.Element;
  }
  class SkipNavLink extends React.Component<ISkipNavProps, {}> {}
  class SkipNavContent extends React.Component<ISkipNavProps, {}> {}
}
