/* global $ */

import loginInit from './refugee/login-button'

import React from 'react'
import { render } from 'react-dom'
import App from './refugee/components/app'

// global callback for google signin
window.auth = function auth () {
  loginInit()
}

// mount the react app and render it as soon as our document is ready
$(document).ready(() => {
  render(App, document.getElementById('content'))
})
