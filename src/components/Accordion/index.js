/*
The Accordion Class is a controller for any number of children palced within in.
It maintains the open or closed state of all immediated children via css classes.

Example usage:
<Accordion>
  <div>Hi</div>
  <div>There</div>
  <div>buddy</div>
  <div>One more</div>
</Accordion>

Example Output:

<div class="accordion">
  <div class="accordion-item">Hi</div>
  <div class="accordion-item">There</div>
  <div class="accordion-item">buddy</div>
  <div class="accordion-item accordion-open">One more</div>
</div>

You will need to apply the correct styles.

For Ex:
.accordion-item {
  border: 1px solid black;
  padding: 20px;

  &.accordion-open {
    height: 200px;
  }
}
*/

import Accordion from './Accordion'
export default Accordion
