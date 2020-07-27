let map;

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
  
  loadTrackerData();
}

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
}

function loadTrackerData() {
  map.data.forEach(feature => map.data.remove(feature));
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
      strokeColor: 'black',
      strokeWeight: 2,
    });

    map.fitBounds(bounds);
    map.setZoom(18);
  });
}
