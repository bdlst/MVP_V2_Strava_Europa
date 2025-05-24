import React, { useRef, useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { exportGeoJSON } from '../Utils/geo';
import { useNavigation } from '@react-navigation/native';

export default function TrackingScreen() {
  const webviewRef = useRef(null);
  const [tracking, setTracking] = useState(false);
  const [track, setTrack] = useState([]);
  const watchRef = useRef(null);
  const navigation = useNavigation();

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    setTrack([]);
    setTracking(true);

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5,
        timeInterval: 1000,
      },
      (loc) => {
        const { latitude, longitude } = loc.coords;
        setTrack((prev) => {
          const newTrack = [...prev, [latitude, longitude]];
          webviewRef.current?.postMessage(JSON.stringify(newTrack));
          return newTrack;
        });
      }
    );
  };

  const stopTracking = () => {
    watchRef.current?.remove();
    setTracking(false);
    const geojson = exportGeoJSON(track);
    console.log('Trace GeoJSON :', JSON.stringify(geojson, null, 2));
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html }}
        style={{ flex: 1 }}
      />
      <View style={styles.controls}>
        <View style={styles.button}>
          <Button
            title={tracking ? 'Stop' : 'Start'}
            onPress={tracking ? stopTracking : startTracking}
          />
        </View>
        <View style={styles.button}>
          <Button
            title="Créer un itinéraire"
            onPress={() => {
              console.log("Navigating to Itineraire");
              navigation.navigate("Itineraire");
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
  },
});

const html = `<!DOCTYPE html>
<html>
<head>
  <title>Carte avec Locate</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  <script>
    var map = L.map('map').setView([48.8566, 2.3522], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OSM contributors',
    }).addTo(map);

    var polyline = L.polyline([], { color: 'blue' }).addTo(map);
    var lastPosMarker = L.circleMarker([0, 0], {
      radius: 8,
      color: '#007bff',
      fillColor: '#007bff',
      fillOpacity: 1,
    }).addTo(map);

    window.document.addEventListener("message", function(event) {
      const coords = JSON.parse(event.data);
      polyline.setLatLngs(coords);
      if (coords.length > 0) {
        const last = coords[coords.length - 1];
        map.setView(last, 16);
        lastPosMarker.setLatLng(last);
      }
    });
  </script>
</body>
</html>`;
