import React, { PropTypes } from 'react'
import ModalHeader from '../ModalHeader'

const TableLayoutHelp = ({ dismissFp }) => (
  <div className="TableLayoutHelp">
    <ModalHeader closeFn={dismissFp}>
      <div className="flexRow">
        <div className="TableLayoutHelp-icon icon-question"/>
        <div>Working with Tables</div>
      </div>
    </ModalHeader>
    <div className="TableLayoutHelp-sections">
      <div className="TableLayoutHelp-section">
        <div className="TableLayoutHelp-title">Add a Column</div>
        <div className="TableLayoutHelp-body">
          <div>There are two ways to add a column:</div>
          <ol className="TableLayoutsHelp-list">
            <li>Click the gear icon and look up a column you want to add.
            <br/><i>Columns are the same as metadata fields.</i></li>
            <li>Drag and drop a field name from the Explore Metadata panel.</li>
          </ol>
        </div>
      </div>
      <div className="TableLayoutHelp-section">
        <div className="TableLayoutHelp-title">Delete a Column</div>
        <div className="TableLayoutHelp-body">
          <div>Right-click on a column name and select Delete from menu</div>
        </div>
      </div>
      <div className="TableLayoutHelp-section">
        <div className="TableLayoutHelp-title">Reorder Columns</div>
        <div className="TableLayoutHelp-body">
          <div>Right-click on a column name and select one of the order items</div>
        </div>
      </div>
      <div className="TableLayoutHelp-section">
        <div className="TableLayoutHelp-title">Resize Columns</div>
        <div className="TableLayoutHelp-body">
          <div>Click and drag the bar between two columns in the header to resize columns</div>
        </div>
      </div>
      <div className="TableLayoutHelp-section">
        <div className="TableLayoutHelp-title">Editing Layouts</div>
        <div className="TableLayoutHelp-body">
          <div>Layouts with the locked icon cannot be edited, but you can duplicate them and then edit a copy.</div>
        </div>
      </div>
      <div className="TableLayoutHelp-section">
        <div className="TableLayoutHelp-title">Rename a Layout</div>
        <div className="TableLayoutHelp-body">
          <div>Click on the pencil to the right of each layout.</div>
        </div>
      </div>
    </div>
    <div className="TableLayoutHelp-footer">
      <div className="TableLayoutHelp-button" onClick={dismissFp}>Got It!</div>
    </div>
  </div>
)

TableLayoutHelp.propTypes = {
  dismissFp: PropTypes.func
}

export default TableLayoutHelp
