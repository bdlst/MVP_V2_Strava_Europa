import React, { useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';

console.log("MapBuilder chargé");

export default function MapBuilder({ onMapPointSelected, route, waypoints, gpsPosition }) {
  const webviewRef = useRef(null);

  useEffect(() => {
    if (route && route.length > 0) {
      webviewRef.current?.postMessage(JSON.stringify({ type: 'route', coords: route }));
    }
  }, [route]);

  useEffect(() => {
    if (!waypoints || waypoints.length === 0) return;

    const completeWaypoints = waypoints.map((wp, idx, arr) => {
      if (wp.role === 'waypoint') {
        const allWaypoints = arr.filter(p => p.role === 'waypoint');
        const position = allWaypoints.findIndex(p => p.id === wp.id);
        return {
          ...wp,
          displayIndex: wp.displayIndex ?? position + 1
        };
      }
      return wp;
    });


    webviewRef.current?.postMessage(
      JSON.stringify({
        type: 'waypoints',
        points: completeWaypoints,
      })
    );
  }, [waypoints]);

  console.log("WAYPOINTS SENT TO MAP:", JSON.stringify(waypoints, null, 2));



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
    .popup-btn {
      display: block;
      margin: 4px 0;
      padding: 4px;
      background: #007bff;
      color: white;
      text-align: center;
      border-radius: 4px;
      cursor: pointer;
    }
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

    const map = L.map('map').setView([48.8566, 2.3522], 13);
    const routeLine = L.polyline([], { color: 'blue', weight: 4 }).addTo(map);
    let routeArrows;
    const pointsLayer = L.layerGroup().addTo(map);
    let userMarker = null;
    const userTrace = L.polyline([], { color: 'purple' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OSM contributors',
    }).addTo(map);

    debug('Leaflet version: ' + L.version);
    debug('Decorator type: ' + typeof L.polylineDecorator);

    map.on('contextmenu', function(e) {
      const latlng = e.latlng;
      const content = \`
        <div>
          <div class="popup-btn" onclick="send('start', \${latlng.lat}, \${latlng.lng})">Start</div>
          <div class="popup-btn" onclick="send('end', \${latlng.lat}, \${latlng.lng})">End</div>
          <div class="popup-btn" onclick="send('waypoint', \${latlng.lat}, \${latlng.lng})">Step</div>
        </div>\`;

      L.popup()
        .setLatLng(latlng)
        .setContent(content)
        .openOn(map);
    });

    function send(role, lat, lng) {
      let marker;
      const latlng = [lat, lng];

      if (role === 'start') {
        marker = L.circleMarker(latlng, {
          radius: 8, color: 'limegreen', fillColor: 'limegreen', fillOpacity: 1
        });
      } else if (role === 'end') {
        marker = L.circleMarker(latlng, {
          radius: 8, color: 'red', fillColor: 'red', fillOpacity: 1
        });
      } else {
        marker = L.marker(latlng, {
          icon: L.divIcon({
            html: '<div style="color:white; font-size:11px; background:orange; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center;">?</div>',
            className: '',
            iconSize: [20, 20]
          })
        });
      }

      marker.addTo(pointsLayer);

      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'point',
          role,
          coords: [lat, lng]
        }));
      }

      map.closePopup();
    }

    function handleMessage(event) {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        debug('❌ JSON malformé');
        return;
      }

      if (data.type === 'waypoints') {
        debug('🔄 Mise à jour des waypoints reçue');
        pointsLayer.clearLayers();
        let count = 0;

        data.points.forEach((pt) => {
          if (!pt.coords || pt.coords.lat === undefined || pt.coords.lng === undefined) {
            debug('⚠️ Point sans coordonnées ignoré');
            return;
          }

          const latlng = [pt.coords.lat, pt.coords.lng];
          let marker;

          if (pt.role === 'start') {
            marker = L.circleMarker(latlng, {
              radius: 8, color: 'limegreen', fillColor: 'limegreen', fillOpacity: 1
            });
          } else if (pt.role === 'end') {
            marker = L.circleMarker(latlng, {
              radius: 8, color: 'red', fillColor: 'red', fillOpacity: 1
            });
          } else {
            marker = L.marker(latlng, {
              icon: L.divIcon({
                html: '<div style="color:white; font-size:10px; background:orange; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center;">' + (pt.displayIndex || '?') + '</div>',
                className: '',
                iconSize: [22, 22]
              })
            });
          }

          marker.addTo(pointsLayer);
          count++;
        });

        debug('✅ ' + count + ' point(s) redessinés');
      }

      if (data.type === 'route') {
        if (!data.coords || data.coords.length === 0) {
          debug('Aucune coordonnée reçue pour tracer la route');
          return;
        }

        routeLine.setLatLngs(data.coords);
        map.fitBounds(L.latLngBounds(data.coords));

        if (typeof L.polylineDecorator !== 'undefined') {
          if (routeArrows) map.removeLayer(routeArrows);

          routeArrows = L.polylineDecorator(routeLine, {
            patterns: [{
              offset: 0,
              repeat: 20,
              symbol: L.Symbol.arrowHead({
                pixelSize: 8,
                polygon: false,
                pathOptions: { color: 'blue', stroke: true }
              })
            }]
          }).addTo(map);

          debug('Flèches ajoutées');
        } else {
          debug('polylineDecorator est undefined');
        }
      }

      if (data.type === 'gps') {
        if (!userMarker) {
          userMarker = L.circleMarker(data.coords, {
            radius: 6, color: 'blue', fillColor: 'blue', fillOpacity: 1
          }).addTo(map);
        } else {
          userMarker.setLatLng(data.coords);
        }

        const currentTrace = userTrace.getLatLngs();
        currentTrace.push(data.coords);
        userTrace.setLatLngs(currentTrace);
      }
    }

    window.addEventListener("message", handleMessage);
    window.document.addEventListener("message", handleMessage);
  </script>
</body>
</html>
`;



 return (
    
  <WebView
    ref={webviewRef}
    source={{ html }}
    style={{ flex: 1 }}
    onMessage={(event) => {
    const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'point') {
        const role = data.role;
        const coords = { lat: data.coords[0], lng: data.coords[1] };
        onMapPointSelected(role, coords);
      } else if (data.type === 'remove') {
        const coords = { lat: data.coords[0], lng: data.coords[1] };
        onDeletePointAt(coords); // nouvelle fonction que tu vas créer
      } else if (data.type === 'debug') {
        console.log('[Map WebView]', data.msg);
      }
    }}
  />

  );
}
