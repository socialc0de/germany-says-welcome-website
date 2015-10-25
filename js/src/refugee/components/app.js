import React from 'react'
import { RouterMixin } from 'react-mini-router'

// all pages are organized as separate components
import Dashboard from './dashboard'

var App = React.createClass({

  mixins: [ RouterMixin ],

  routes: {
    '/': 'home',
    '/test': 'test'
  },

  home () {
    return <Dashboard />
  },

  test () {
    return <h1>Testing</h1>
  },

  notFound (path) {
    return <div>Page Not Found: {path}</div>
  },

  render () {
    return <div>{this.renderCurrentRoute()}</div>
  }

})

export default App
