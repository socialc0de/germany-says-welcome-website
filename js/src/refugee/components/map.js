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

  // componentWillMount and componentWillUnmount are so-called lifecycle-methods;
  // they are called automatically by react at certain times. this for example
  // is called before the component gets appended to the DOM
  componentWillMount () {
    // POIStore.getState registers a callback that get's called every time the
    // store's data changes. It returns a function to unsubscribe from these
    // changes.
    //
    // What we do is change this *component's* state to the one passed
    // in from the *store*. This way we have cleanly separated the data from
    // its represtandation. This component's render()-function gets called
    // every time the state changes and all we need to do is look at this.state
    // and render our HTML accordingly.
    this.unsubscribeFromStore = POIStore.getState(this.setState.bind(this))

    // fetch initial data
    POIStore.fetch()
  },

  // this one gets called before the component gets removed from the DOM, that
  // means when we change the currently viewed page.
  componenWillUnmount () {
    this.unsubscribeFromStore()
  },

  // the render method gets called automatically when the component is mounted
  // and each time the state changes. It returns the component's representation,
  // which in this case is a map with some markers
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
