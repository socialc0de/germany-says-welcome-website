import React from 'react'
import POIStore from '../stores/poi'

const Map = React.createClass({

  displayName: 'Map',

  unsubsribeFromStore: null,

  componentWillMount () {
    // POIStore.getState registers a callback that get's called every time the
    // store is called. It returns a function to unsubscribe from these events
    this.unsubscribeFromStore = POIStore.getState(this.setState.bind(this))

    // fetch initial data
    POIStore.fetch()
  },

  componenWillUnmount () {
    this.unsubscribeFromStore()
  },

  render () {
    var state = this.state
    // console.log('Received state update', state)

    return (<ul>
      {state ? state.points.map(function (point, i) {
        return (<li key={i}>{JSON.stringify(point)}</li>)
      }) : null}
    </ul>)
  }

})

export default Map
