(function () {
  // initial Leaflet map options
  const options = {
    zoomSnap: .1,
    // center: [40, -90], 
    // zoom: 4,
    zoomControl: false
  }

  // create Leaflet map and apply options
  const map = L.map('map', options);
  new L.control.zoom({
    position: "bottomright"
  }).addTo(map)

  L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  }).addTo(map);

  // mapped attribute, and normalizing attribute
  let attributeValue = "timeline"; //when rebellion took place 1-10

  // create object to hold legend titles
  const labels = {
    "modern_province": "Modern Province Name",
    "settlement_type": "Jurusdictional Type",
    "historic_name": "Historic Province Name",
    "year": "Year of Importance to Rebellion",
    "significance": "Significant Event(s)",
    "timeline": "Timeline",
    "description": "Detailed Description"
  }

  $.getJSON("data/taiping_rebellion.geojson", function (data) {
    // jQuery method uses AJAX request for the GeoJSON data
    drawMap(data);
  });

  function drawMap(data) {
    const provinces = L.geoJson(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            color: '#ffef00'
        });
    }}).addTo(map);
    // fit the map's bounds and zoom level using the counties extent
    map.fitBounds(provinces.getBounds(), {
      padding: [20, 20] // add padding around counties
    });
    updateMap(provinces);
    // circleWithText(provinces);
  }
  
  // function circleWithText(latLng, txt, circleOptions) {
  //   var icon = L.divIcon({
  //     html: '<div class="txt">' + txt + '</div>',
  //     className: 'circle-with-txt',
  //     iconSize: [40, 40]
  //   });
  //   var circle = L.circleMarker(latLng, circleOptions);
  //   var marker = L.marker(latLng, {
  //     icon: icon
  //   });
  //   var group = L.layerGroup([circle, marker]);
  //   return(group);
  // }

  function updateMap(provinces) {
    // you could log counties to console here to 
    // verify the Leaflet layers object is not accessible
    // and scoped within this function
    console.log(provinces);

    // loop through each county layer to update the color and tooltip info
    provinces.eachLayer(function (layer) {

      const props = layer.feature.properties;

      // layer.setStyle({
      //   color: '#005daa',
      //   fillColor: '#ffef00'
      // });


      let tooltipInfo = `<b>${props["historic_name"]}</b></br>` +
            `<b>Modern Province:</b> ${props["modern_province"]}</br>` +
            `<b>Significant Events:</b> ${props["significance"]}`

      // bind a tooltip to layer with county-specific information
      layer.bindTooltip(tooltipInfo, {
        // sticky property so tooltip follows the mouse
        sticky: true
      });

    });
  }

  // Add legend to map
  function addLegend(legend) {

    // create a new Leaflet control object, and position it top left
    const legendControl = L.control({
      position: 'topleft'
    });

    // when the legend is added to the map
    legendControl.onAdd = function () {

      // select a div element with an id attribute of legend
      const legend = L.DomUtil.get('legend');

      // disable scroll and click/touch on map when on legend
      L.DomEvent.disableScrollPropagation(legend);
      L.DomEvent.disableClickPropagation(legend);

      // return the selection to the method
      return legend;

    };

    // add the empty legend div to the map
    legendControl.addTo(map);

    // select the legend, add a title, begin an unordered list and assign to a variable
  }
})();