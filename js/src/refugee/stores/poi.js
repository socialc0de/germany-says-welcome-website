/* global $ */

import Hoverboard from 'hoverboard'

// current docs for Hoverboard are found at npmjs.com/package/hoverboard
const POIStore = Hoverboard({

  getInitialState () {
    // the store is just an empty array before any data is fetched
    return { points: [] }
  },

  getState (state) {
    // for immutability:
    return JSON.parse(JSON.stringify(state))
  },

  // fetch Points of Interest from the Api
  onFetch () {
    // Hoverboard generates an action for every onSomething,
    // so we can call .fetch() on the POIStore later

    $.getJSON('http://pajowu.de:8080/poi/all')
      .then(data => {
        this.setState({ points: data.items })
      })
      .fail(console.error.bind(console)) // log all errors to console
  }

})

export default POIStore
