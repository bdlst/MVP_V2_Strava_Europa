import React, { useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';

console.log("MapBuilder chargé");

export default function MapBuilder({ onMapPointSelected, route, gpsPosition }) {
  const webviewRef = useRef(null);

  useEffect(() => {
    if (route && route.length > 0) {
      webviewRef.current?.postMessage(JSON.stringify({ type: 'route', coords: route }));
    }
  }, [route]);

  useEffect(() => {
    if (gpsPosition) {
      webviewRef.current?.postMessage(JSON.stringify({ type: 'gps', coords: gpsPosition }));
    }
  }, [gpsPosition]);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet-polylinedecorator@1.7.0/dist/leaflet.polylineDecorator.min.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .popup-btn { display: block; margin: 4px 0; padding: 4px; background: #007bff; color: white; text-align: center; border-radius: 4px; cursor: pointer; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    function debug(msg) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'debug', msg }));
      }
    }

    var map = L.map('map').setView([48.8566, 2.3522], 13);
    var routeLine = L.polyline([], { color: 'blue', weight: 4 }).addTo(map);
    var routeArrows;
    var pointsLayer = L.layerGroup().addTo(map);
    var waypointIndex = 1;

    var userMarker = null;
    var userTrace = L.polyline([], { color: 'purple' }).addTo(map);


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OSM contributors',
    }).addTo(map);

    debug('Leaflet version: ' + L.version);
    debug('Decorator type: ' + typeof L.polylineDecorator);

    map.on('contextmenu', function(e) {
      var latlng = e.latlng;

      var content = \`
        <div>
          <div class="popup-btn" onclick="send('start', \${latlng.lat}, \${latlng.lng})">Départ</div>
          <div class="popup-btn" onclick="send('end', \${latlng.lat}, \${latlng.lng})">Arrivée</div>
          <div class="popup-btn" onclick="send('waypoint', \${latlng.lat}, \${latlng.lng})">Étape</div>
        </div>\`;

      L.popup()
        .setLatLng(latlng)
        .setContent(content)
        .openOn(map);
    });

    function send(role, lat, lng) {
      let marker;

      if (role === 'start') {
        marker = L.circleMarker([lat, lng], {
          radius: 8,
          color: 'limegreen',
          fillColor: 'limegreen',
          fillOpacity: 1,
        });
      } else if (role === 'end') {
        marker = L.circleMarker([lat, lng], {
          radius: 8,
          color: 'red',
          fillColor: 'red',
          fillOpacity: 1,
        });
      } else if (role === 'waypoint') {
        marker = L.marker([lat, lng], {
          icon: L.divIcon({
            html: '<div style="color:white; font-size:11px; background:orange; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center;">' + waypointIndex + '</div>',
            className: '',
            iconSize: [20, 20]
          })
        });
        waypointIndex += 1;
      }

      marker.addTo(pointsLayer);

      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'point',
        role,
        coords: [lat, lng]
      }));

      map.closePopup();
    }

    window.document.addEventListener("message", function(event) {
      const data = JSON.parse(event.data);
      if (data.type === 'route') {
        if (!data.coords || data.coords.length === 0) {
          debug('Aucune coordonnée reçue pour tracer la route');
          return;
        }

        routeLine.setLatLngs(data.coords);
        map.fitBounds(L.latLngBounds(data.coords));
        debug('Tracé reçu avec ' + data.coords.length + ' points');

        if (typeof L.polylineDecorator !== 'undefined') {
          if (routeArrows) map.removeLayer(routeArrows);

          routeArrows = L.polylineDecorator(routeLine, {
            patterns: [
              {
                offset: 0,
                repeat: 20,
                symbol: L.Symbol.arrowHead({
                  pixelSize: 8,
                  polygon: false,
                  pathOptions: { color: 'blue', stroke: true }
                })
              }
            ]
          }).addTo(map);

          debug('Flèches ajoutées sur le tracé');
        } else {
          debug('polylineDecorator est undefined');
        }
      }
    else if (data.type === 'gps') {
      if (!userMarker) {
        userMarker = L.circleMarker(data.coords, {
          radius: 6,
          color: 'blue',
          fillColor: 'blue',
          fillOpacity: 1,
        }).addTo(map);
      } else {
        userMarker.setLatLng(data.coords);
      }

      var currentTrace = userTrace.getLatLngs();
      currentTrace.push(data.coords);
      userTrace.setLatLngs(currentTrace);
    }
    });
  </script>
</body>
</html>
`;


  return (
    <WebView
      ref={webviewRef}
      originWhitelist={['*']}
      source={{ html }}
      style={{ flex: 1 }}
      onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'point') {
            onMapPointSelected(data.role, data.coords);
          } else if (data.type === 'debug') {
            console.log('[Map WebView]', data.msg);
          }
      }}
    />
  );
}
