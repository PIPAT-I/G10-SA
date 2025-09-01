// Utility to suppress findDOMNode warnings during development
// This is a temporary solution until all Ant Design components are updated

if (process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("findDOMNode is deprecated")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
}

export const suppressFindDOMNodeWarning = () => {
  // This function can be called to explicitly suppress warnings
  // It's already done automatically in development mode
};
