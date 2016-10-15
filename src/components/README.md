# Components

Rect Component classes and stateless functions that display elements.
Components which do not require or modify state and Containers, 
which do require and may modify state are grouped in the same folder.
We are grouping Components and Containers in a single folder during
development until the application stabilizes or reaches a level of
complexity where we need additional modularization.

Groups of related components can be placed in a common subdirectory.

Components may include local Saas files for styling, and may use
global styling as needed.

Components do not require unit tests. However we plan to incorporate
integration testing via Selenium or Karma to test components.
