import Explorer from './Explorer'
import './Explorer.scss'
export default Explorer

/*
Explorer displays detailed information about the selected assets.
DisplayProperties are used to define which fields in the metadata
are visible, their order, and their editable widgets, if any.
Explorer is displayed using a recursive Collapsible outline view
that unfolds the JSON-structured document metadata.

The DisplayProperties that define the metadata layout can be
edited using a custom modal dialog. Default properties are provided
by the server based on the current user.
*/
