const withProviders =
  (...providers) =>
  ({ children }) =>
    providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children
    );
export default withProviders;
