/* global $ */

//
// This is the starting module for the whole app running in refugee.html
// There were a couple of files in ./refugee that we removed finally:
//
// - faq.js
// - home.js
// - map.js
//
// They contained the isolated functionality of those pages before starting
// to move to react. You might find them useful to understand the program flow
// (we found so ;). If you're interested, check the git history.
//

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
  // mount React Main Component into content Container
  render(App, document.getElementById('content'))
})
