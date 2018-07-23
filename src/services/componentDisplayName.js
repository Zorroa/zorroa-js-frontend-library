export default function getDisplayName(WrappedComponent, wrapperName) {
  const wrappedName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  return `${wrapperName}(${wrappedName})`
}
