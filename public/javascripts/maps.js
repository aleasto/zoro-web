let map;
let infoWindow;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 41.9028, lng: 12.4964 },
    zoom: 6
  });

  map.data.setStyle(feature => {
    return {
      visible: false
    };
  });
  
  infoWindow = new google.maps.InfoWindow();
  loadTrackerData();
}

let lastSelectedCircle;
function addCirlce(feature) {
  feature.circle = new google.maps.Circle({
    map,
    center: feature.getGeometry().get(),
    radius: feature.getProperty('acc'),
    fillColor: 'red',
    fillOpacity: .1,
    strokeColor: 'white',
    strokeWeight: .5,
    zIndex: feature.getProperty('fix_time')
  });
  
  feature.clickListener = google.maps.event.addListener(feature.circle, 'click', () => {
    if (lastSelectedCircle) {
      lastSelectedCircle.setOptions({
        strokeColor: 'white',
      });
    }
    feature.circle.setOptions({
      strokeColor: 'black',
    });
    let geometry = feature.getGeometry().get();
    infoWindow.setContent([
      "<h2>" + new Date(feature.getProperty('fix_time')).toLocaleString() + "</h2>",
      "Reported at: " + new Date(feature.getProperty('report_time')).toLocaleString(),
      "Altitude: " + feature.getProperty('alt').toFixed(1),
      "Accuracy: " + '±' + feature.getProperty('acc').toFixed(1) + 'm',
      "Battery: " + feature.getProperty('bat') + '%',
      "Network: " + feature.getProperty('net'),
      `<a target="_blank" rel="noopener noreferrer"
        href="https://www.google.com/maps/search/?api=1&query=${geometry.lat()},${geometry.lng()}">View on Google Maps</a>`,
    ].join('<div>'));
    infoWindow.setPosition(feature.getGeometry().get());
    infoWindow.open(map);
    lastSelectedCircle = feature.circle;
  })
}

function loadTrackerData() {
  clearData();
  map.data.loadGeoJson("/locations?acc=16&geojson", null, () => {
    let bounds = new google.maps.LatLngBounds(); 
    let lastSeen;
    map.data.forEach(function(feature){
      if (!lastSeen || feature.getProperty('fix_time') > lastSeen.getProperty('fix_time'))
        lastSeen = feature;

      addCirlce(feature);
      feature.getGeometry().forEachLatLng(function(latlng){
        bounds.extend(latlng);
      });
    });

    lastSeen.circle.setOptions({
      fillColor: 'yellow',
      fillOpacity: 0.5,
      strokeWeight: 2,
    });

    map.fitBounds(bounds);
    map.setZoom(map.getZoom() - 4);
  });
}

function clearData() {
  map.data.forEach(feature => {
    google.maps.event.clearListeners(feature.circle, 'click');
    feature.circle.setMap(null);
    map.data.remove(feature);
  });
}
