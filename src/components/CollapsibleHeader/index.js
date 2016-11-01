import CollapsibleHeader from './CollapsibleHeader'
import './CollapsibleHeader.scss'
export default CollapsibleHeader

/*
CollapsibleHeader collapses horizontally and switches to a specialized
display mode. A customizable icon is always displayed, and, if open,
a header label and open/close caret are displayed. For more generality,
this could be refactored to accept the open and close modes as React
components and this component would merely switch between the two based
on a specific global state.
 */
