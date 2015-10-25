import React from 'react'
import POIStore from '../stores/poi'

import { Map, Marker, Popup, TileLayer } from 'react-leaflet'

//
// Documentation for the react-leaflet wrapper can be found at
// http://react-components.com/component/react-leaflet
//

const MapComponent = React.createClass({

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

    var markers = state ? state.points.map((point, i) => {
      return <Marker key={i} position={point.location}>
        <Popup>
          <p>{point.adresse}</p>
        </Popup>
      </Marker>
    }) : null

    // center in germany
    return (<Map center={[ 51.165, 10.451 ]} zoom={6}>
        <TileLayer
          url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
        {markers}
      </Map>)
  }

})

export default MapComponent
