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
    position: "bottomleft"
  }).addTo(map)


  // request a basemap tile layer and add to the map
  L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  }).addTo(map);

  // set global variables for map layer,
  // mapped attribute, and normalizing attribute
  let attributeValue = "HC01_VC04"; //Population 16 years and over - In labor force
  const normValue = "HC01_VC03"; //EMPLOYMENT STATUS - Population 16 years and over

  // create object to hold legend titles
  const labels = {
    "LEV1_PY": "Modern Province Name",
    "TYPE_PY": "Jurusdictional Type",
    "NAME_PY": "Historic Province Name",
  }

  $.getJSON("data/china_provinces_1820.geojson", function (data) {
    // jQuery method uses AJAX request for the GeoJSON data
    drawMap(data);
  });

  function drawMap(data) {
    const provinces = L.geoJson(data, {
      // style counties with initial default path options
      style: function (feature) {
        return {
          color: '#20282e',
          weight: 2,
          fillOpacity: .6,
          fillColor: '#1f78b4'
        };
      },
      // add hover/touch functionality to each feature layer
      onEachFeature: function (feature, layer) {

        // when mousing over a layer
        layer.on('mouseover', function () {

          // change the stroke color and bring that element to the front
          layer.setStyle({
            color: '#a4c639'
          }).bringToFront();
        });

        // on mousing off layer
        layer.on('mouseout', function () {

          // reset the layer style to its original stroke color
          layer.setStyle({
            color: '#20282e'
          });
        });
      }
    }).addTo(map);
    // fit the map's bounds and zoom level using the counties extent
    map.fitBounds(provinces.getBounds(), {
      padding: [18, 18] // add padding around counties
    });
    updateMap(provinces);
    addUi(provinces); // add the UI controls
  }

  function updateMap(provinces) {
    // you could log counties to console here to 
    // verify the Leaflet layers object is not accessible
    // and scoped within this function
    console.log(provinces);

    // get the class breaks for the current data attribute
    const breaks = getClassBreaks(provinces);

    // loop through each county layer to update the color and tooltip info
    counties.eachLayer(function (layer) {

      const props = layer.feature.properties;

      // set the fill color of layer based on its normalized data value
      layer.setStyle({
        color: '#20282e'
      });

      // assemble string sequence of info for tooltip (end line break with + operator)
      let tooltipInfo = `<b>${props["NAME_PY"]}</b></br>
            Modern Province: ${props["LEV1_PY"]}`

      // bind a tooltip to layer with county-specific information
      layer.bindTooltip(tooltipInfo, {
        // sticky property so tooltip follows the mouse
        sticky: true
      });

    });

    // update the legend with the current data attribute information
    addLegend(breaks);
    updateLegend(breaks);
  }

  function getClassBreaks(provinces) {

    // create empty Array for storing values
    const values = [];

    // loop through all the counties
    counties.eachLayer(function (layer) {
      let value = layer.feature.properties[attributeValue] / layer.feature.properties[normValue];
      values.push(value); // push the normalized value for each layer into the Array
    });

    // determine similar clusters
    const clusters = ss.ckmeans(values, 5);

    // create an array of the lowest value within each cluster
    const breaks = clusters.map(function (cluster) {
      return [cluster[0], cluster.pop()];
    });

    //return array of arrays, e.g., [[0.24,0.25], [0.26, 0.37], etc]
    return breaks;
  }

  function getColor(d, breaks) {
    // function accepts a single normalized data attribute value
    // and uses a series of conditional statements to determine which
    // which color value to return to return to the function caller

    if (d <= breaks[0][1]) {
      return '#f3ddc7';
    } else if (d <= breaks[1][1]) {
      return '#e1ac77';
    } else if (d <= breaks[2][1]) {
      return '#d68e47';
    } else if (d <= breaks[3][1]) {
      return '#c97b2d'
    } else if (d <= breaks[4][1]) {
      return '#995d22'
    }
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

  function updateLegend(breaks) {
    const legend = $('#legend').html(`<h5>${labels[attributeValue]}</h5>`);

    // loop through the Array of classification break values
    for (let i = 0; i <= breaks.length - 1; i++) {

      let color = getColor(breaks[i][0], breaks);

      legend.append(
        `<span style="background:${color}"></span>
		<label>${(breaks[i][0] * 100).toLocaleString()} &mdash;
		${(breaks[i][1] * 100).toLocaleString()}%</label>`);
    }
  }

  function addUi(provinces) {
    $('#dropdown-ui select').change(function () {
      // code executed here when change event occurs
      attributeValue = this.value;
      // call updateMap function
      updateMap(provinces);
    });
    // create the slider control
    var selectControl = L.control({
      position: "topright"
    });

    // when control is added
    selectControl.onAdd = function () {
      // get the element with id attribute of ui-controls
      return L.DomUtil.get("dropdown-ui");
    };
    // add the control to the map
    selectControl.addTo(map);
  }
})();