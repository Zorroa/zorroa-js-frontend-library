import DisplayOptions from './DisplayOptions'
import './DisplayOptions.scss'
export default DisplayOptions

/*

A Modal dialog for selecting from asset fields.

The visible state and response callbacks are handled by
the component that instantiates this class. Typically a
visible boolean that is enabled on display and disabled in
onDismiss controls the generation of this class in JSX.
The onUpdate callback is passed the set of checked fields,
fully qualified, e.g. some.big.field. If the singleSelection
prop is set, only a single field, or none, can be selected
and returned to onUpdate.

 */
