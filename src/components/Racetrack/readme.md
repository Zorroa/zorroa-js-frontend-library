# Filtering Searches

The Racetrack enables the user to create search filters along a variety of
dimensions. Each Racetrack is responsible for a *sliver*, which is essentially a
part of a search filter that can be merged into other search filters.

## ./WidgetInfo.js

The WidgetInfo defines common configuration options for a Racetrack widget such
as its name, color and what React Component it is associated with. This React
Component is what creates a Racetrack Widget.

## ../Models/Widget.js

The Widget model exists to correctly mutate state and to manage the generation
of AssetSearch objects. The AssetSearch object is composed on to the Widget
object. In this manner, it is possible to merge together all the slivers to
create a final filter query.

## ../reducers/racetrackReducer

There are Redux actions that can trigger a racetrack widget to be created or
removed. For example isolating a parent asset will cause the multipage Racetrack
Widget to be created. The Racetrack is an array of Widget models. Since these
Widget models includes the `type` of the widget, they can be used to reference
the WidgetInfo.js definitions.

## ./Racetrack.js

This React Component gets all the Widget models from the Racetrack store. It
looks up the Widget's WidgetInfo options. Since WidgetInfo contains a reference
to an instantiated React Component it creates a clone of that instance, and then
applies certain properties (e.g. `id` and `isEnabled`) from the Widget model and
sends them to this cloned instance as React props.

## Racetrack Widgets (e.g. Filetype.js, Color.js)

These widgets each implement their own custom UI that easily allows a user to
create search filters, and otherwise manage their search query. They have the
concept of a `title`, which is the generic name of the widget. There's also the
concept of a `field`, which is a more concrete summary name for the widget.
Let's say the user has added the Color widget, and set it to only show images
with a "purple" pixel. The widget field would then change to be "Purple." This
helps to provide the user with more context on what filters they have applied.

## Removing Widgets

When a widget is removed it needs to perform some cleanup sometimes. The
./Widget.js file provides a function called removeFilter that orchestrates this
behavior based on Redux actions and the widget names.
