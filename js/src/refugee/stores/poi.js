/* global $ */

import Hoverboard from 'hoverboard'

// Stores encapsulate all logic that operate on data; they provide means to
// refetch and eventually also to add new data. This architecture is similar to
// MVC, but it's not the same. It's called Flux and was introduced by facebook.
//
// Info for flux: https://facebook.github.io/flux/docs/overview.html
//
// You don't *need* Flux to build apps with react.js, but it makes it a lot
// easier in the long term.
//
// The flux implmentation we use is called Hoverboard. The docs can be found at
// npmjs.com/package/hoverboard
const POIStore = Hoverboard({

  getInitialState () {
    // the store is just an empty array before any data is fetched
    return { points: [] }
  },

  getState (state) {
    // for immutability we create a deep copy of the state before returning it
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
