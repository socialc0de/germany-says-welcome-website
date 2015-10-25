import React from 'react'
import Router from 'tiny-react-router'

// all pages are organized as separate components
import Dashboard from './dashboard'
import Map from './map'

var routes = {
  '/': Dashboard,
  '/map': Map
}

export default <Router routes={routes} />
