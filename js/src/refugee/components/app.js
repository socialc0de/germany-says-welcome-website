// https://facebook.github.io/react/
import React from 'react'
// https://github.com/asbjornenge/tiny-react-router
import Router from 'tiny-react-router'

// all pages are organized as separate components
// TODO add faq, sharing components and routes
import Dashboard from './dashboard'
import Map from './map'

var routes = {
  '/': Dashboard,
  '/map': Map
}

export default <Router routes={routes} />
