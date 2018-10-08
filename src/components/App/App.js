import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import PageHome from '../../pages/Home'
import PageForm from '../../pages/Form'
import PageParagraph from '../../pages/Paragraph'
import Sidebar from '../Sidebar'

export default class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <div className="App__sidebar">
            <Sidebar />
          </div>
          <div className="App__body">
            <Switch>
              <Route path="/form" component={PageForm} />
              <Route path="/paragraph" component={PageParagraph} />
              <Route component={PageHome} />
            </Switch>
          </div>
        </div>
      </Router>
    )
  }
}
