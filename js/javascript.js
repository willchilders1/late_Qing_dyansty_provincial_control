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

  L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
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
        // var mapIcon = L.Icon({
        //   iconUrl: 'Taiping_Heavenly_Kingdom_Banner.svg'
        // });
        return L.circleMarker(latlng, {
          color: '#ffef00',
          radius: 12
          // icon: 'svgs/Taiping_Heavenly_Kingdom_Banner.svg',
          // icon: mapIcon
        });
      }
    }).addTo(map);
    // fit the map's bounds and zoom level using the counties extent
    map.fitBounds(provinces.getBounds(), {
      padding: [20, 20] // add padding around counties
    });
    updateMap(provinces);
    // circleWithText(provinces);
    
  }

  const slider = document.querySelector('#year')
  const forward = document.querySelector('#forward')
  const backward = document.querySelector('#backward')
  let currentState = 0
  const yearLabel = document.querySelector('#yearLabel')
  const descriptionLabel = document.querySelector('#description')

  function zoomToFeature(provinces, step) {
    provinces.eachLayer(function (layer) { 
    const f = layer.feature
    const t = f.properties.timeline
    const g = f.geometry.coordinates[0]
    if (t == step) {
      map.flyTo([g[1],g[0]], 10)
      yearLabel.innerHTML = f.properties.year
      descriptionLabel.innerHTML = f.properties.description
      layer.openPopup()
    }
  })
}

  function updateMap(provinces) {
    // you could log counties to console here to 
    // verify the Leaflet layers object is not accessible
    // and scoped within this function
    console.log(provinces);

    slider.addEventListener('change', function(event){
      const step = event.target.value
      zoomToFeature(provinces, step)
     
    })

    forward.addEventListener('click', function(event){
     if(currentState < 10){
      zoomToFeature(provinces, ++currentState)
     }
    })

    backward.addEventListener('click', function(event){
     if(currentState > 1){
      zoomToFeature(provinces, --currentState)
     }
    })

    // loop through each county layer to update the color and tooltip info
    provinces.eachLayer(function (layer) {

      const props = layer.feature.properties;

      // layer.setStyle({
      //   color: '#005daa',
      //   fillColor: '#ffef00'
      // });


      let tooltipInfo = `<h3><b>${props["historic_name"]}</b></br></h3>` +
        `<b>Modern Province:</b> ${props["modern_province"]}</br>` +
        `${props["image"]}</br>` +
        `<b>Significant Events:</b> ${props["significance"]}`

      // bind a tooltip to layer with county-specific information
      layer.bindPopup(tooltipInfo, {
        // sticky property so tooltip follows the mouse
        sticky: true
      });

    });
  }
})();