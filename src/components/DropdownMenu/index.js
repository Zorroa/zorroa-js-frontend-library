import './DropdownMenu.scss'
import DropdownMenu from './DropdownMenu'
export default DropdownMenu

/*
The DropdownMenu Class is a controller for any number of children placed within it.
It uses state to show and hide the unordered list.

You should pass a width via the style into the component or it will be as big as it can be

Params: {
  children: PropTypes.node,
  label: PropTypes.string,
  style: PropTypes.object
}

- children: the immediate nested html elements inside the dropdown tag
- label: the label for the button
- style: these are styles that need to be applied to the container, like width.  Any style passed here will over ride everything

Example usage:

<div>
  <DropdownMenu label="My Drop Down" style={{ width: 200 }}>
    <a>test 1</a>
    <a>test 2</a>
  </DropdownMenu>
  <DropdownMenu label="My Drop Down" style={{ width: 200 }}>
    <a>test 3</a>
    <a>test 4</a>
  </DropdownMenu>
</div>

Example output:

<div class="dropdown-menu" style="width: 200px;">
  <button type="button" role="button">
    My Drop Down <span class="dropdown-caret"></span>
  </button>
  <ul>
    <li><a>test 1</a></li>
    <li><a>test 2</a></li>
  </ul>
</div>
*/
