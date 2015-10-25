import React from 'react'
import { RouterMixin } from 'react-mini-router'

// all pages are organized as separate components
import Dashboard from './dashboard'
import Map from './map'

var App = React.createClass({

  mixins: [ RouterMixin ],

  routes: {
    '/': 'home',
    '/map': 'map'
  },

  home () {
    return <Dashboard />
  },

  map () {
    return <Map />
  },

  notFound (path) {
    return <p>Page Not Found: {path}</p>
  },

  render () {
    return <div>{this.renderCurrentRoute()}</div>
  }

})

export default App
