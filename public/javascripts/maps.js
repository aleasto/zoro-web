const defined = o => typeof o !== "undefined";

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
      `<h2>${new Date(feature.getProperty('fix_time')).toLocaleString()}</h2>`,
      `Reported at: ${new Date(feature.getProperty('report_time')).toLocaleString()}`,
      `Altitude: ${feature.getProperty('alt').toFixed(1)}m`,
      `Accuracy: ±${feature.getProperty('acc').toFixed(1)}m`,
      `Battery: ${feature.getProperty('bat')}%`,
      `<span>Network: ${feature.getProperty('net')}</span>${getSignalImage(feature)}`,
      `<a target="_blank" rel="noopener noreferrer"
        href="https://www.google.com/maps/search/?api=1&query=${geometry.lat()},${geometry.lng()}">View on Google Maps</a>`,
    ].reduce((out, el, i, arr) => out + '<div class="info-box">' + el + '</div>'));
    infoWindow.setPosition(feature.getGeometry().get());
    infoWindow.open(map);
    lastSelectedCircle = feature.circle;
  })
}

function loadTrackerData() {
  clearData();

  let from = parseDateTime("from_date", "from_time");
  let to = parseDateTime("to_date", "to_time");
  let acc = document.getElementById("acc").value;
  let query = `?geojson&after=${from}&before=${to}&acc=${acc}`;

  map.data.loadGeoJson(`/locations${query}`, null, () => {
    let bounds = new google.maps.LatLngBounds(); 
    let lastSeen;
    map.data.forEach(function(feature){
      if (!lastSeen || feature.getProperty('fix_time') > lastSeen.getProperty('fix_time'))
        lastSeen = feature;

      addCirlce(feature);
      bounds.extend(feature.circle.getBounds().getNorthEast());
      bounds.extend(feature.circle.getBounds().getSouthWest());
    });

    if (lastSeen) { // AKA: if we got any point
      lastSeen.circle.setOptions({
        fillColor: 'yellow',
        fillOpacity: 0.5,
        strokeWeight: 2,
      });

      map.fitBounds(bounds);
      map.setZoom(map.getZoom() - 1);
    }
  });
}

function clearData() {
  map.data.forEach(feature => {
    google.maps.event.clearListeners(feature.circle, 'click');
    feature.circle.setMap(null);
    map.data.remove(feature);
  });
}

function parseDateTime(dateElt, timeElt) {
    /**
   * @type {Date}
   */
  let from = document.getElementById(dateElt).valueAsDate;
  let from_time = document.getElementById(timeElt).value.split(":");
  from.setHours(from_time[0]);
  from.setMinutes(from_time[1]);
  from.setSeconds(from_time[2] || null);
  return from.getTime();
}

function getSignalImage(feature) {
  if (!defined(feature.getProperty('sig'))) return "";

  let type = feature.getProperty('net') == 'Wi-Fi' ? 'wifi' : 'gsm';
  return `<img class="signal-strength" src="/images/${type}/${feature.getProperty('sig')}.svg">`;
}
