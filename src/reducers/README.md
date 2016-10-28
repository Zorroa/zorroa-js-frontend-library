# Redux: Reducers

Reducers update the global application state.

Application state is divided into separate categories:

* **app**: Global application UI state, e.g. modal dialogs, layout info, etc.
* **auth**: Authentication information, including authenticated user name, id.
* **folders**: Current folders, including collections, browsing, and so forth.
* **assets**: Current assets, including the results of the latest search, selected items, isolated asset id.
* **slivers**: Search components which are combined to produce a new search.

The Curator is structured around a single primary search. The assets
for the search are displayed in the main body as thumbnails and table
rows, and the search itself is expressed in the selected folders and
racetrack search widgets in the sidebars.

The results of the last search are stored in state.assets, and include a
list of **all** the Assets in an ordered list, the set of **selectedIds**
that identify which thumbnails are selected, and an optional **isolatedId**
which identifies the specific asset shown in the Lightbox.

The last-returned AssetSearch result is stored in state.assets.query.
It should be used during component rendering to decide what information
to display for the current search.

The Searcher is responsible for submitting all search requests to the
Archivist server. Racetrack widgets and selected folder items update
a list of search **slivers** which are combined by the Searcher.
Slivers are stored in an object with an arbitrary key used to map
between folders/widgets to their generated AssetSearch sliver.

A centralized search manager enables optimization of search requests,
and avoids having separate parts of the application steal control.
The Searcher is a singleton render-less react component which monitors
the slivers, combines them together using AssetSearch.merge and submits
any new searches to the Archivist. Comparison of the new combined query
against the last generated query avoids infinite looping.

The folder.state section stores a flat object with id:Folder mapping for
fast indexing. Each Folder has an optional **children** list which contains
the list of child folder ids, generated on-demand as folders are displayed
in the sidebar.
