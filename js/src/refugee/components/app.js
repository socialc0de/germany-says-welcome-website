import React from 'react'
import { RouterMixin } from 'react-mini-router'

var App = React.createClass({

  mixins: [ RouterMixin ],

  routes: {
    '/': 'home',
    '/test': 'test'
  },

  home () {
    return <h1>Hello world</h1>
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
