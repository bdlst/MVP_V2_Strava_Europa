import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { exportGeoJSON } from '../Utils/geo';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TrackingScreen() {
  const webviewRef = useRef(null);
  const watchRef = useRef(null);
  const navigation = useNavigation();

  const [tracking, setTracking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [track, setTrack] = useState([]);
  const [showStats, setShowStats] = useState(false);

  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState(0);
  const [heartRate, setHeartRate] = useState(120); // Valeur mockée

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    setTrack([]);
    setTracking(true);
    setPaused(false);
    setShowStats(false);
    setStartTime(Date.now());
    setElapsedTime(0);
    setDistance(0);
    setAvgSpeed(0);

    // Centrer immédiatement sur la position connue (si possible)
    const loc = await Location.getCurrentPositionAsync({});
    webviewRef.current?.postMessage(JSON.stringify([[loc.coords.latitude, loc.coords.longitude]]));

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

          if (newTrack.length >= 2) {
            const [prevLat, prevLon] = newTrack[newTrack.length - 2];
            const d = getDistanceFromLatLonInKm(prevLat, prevLon, latitude, longitude);
            setDistance((dist) => dist + d);
          }

          return newTrack;
        });
      }
    );
  };

  const pauseTracking = () => {
    watchRef.current?.remove();
    setPaused(true);
  };

  const resumeTracking = async () => {
    setPaused(false);

    const loc = await Location.getCurrentPositionAsync({});
    webviewRef.current?.postMessage(JSON.stringify([[loc.coords.latitude, loc.coords.longitude]]));


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

          if (newTrack.length >= 2) {
            const [prevLat, prevLon] = newTrack[newTrack.length - 2];
            const d = getDistanceFromLatLonInKm(prevLat, prevLon, latitude, longitude);
            setDistance((dist) => dist + d);
          }

          return newTrack;
        });
      }
    );
  };

  const stopTracking = () => {
    watchRef.current?.remove();
    setTracking(false);
    setPaused(false);
    const geojson = exportGeoJSON(track);
    console.log('Trace GeoJSON :', JSON.stringify(geojson, null, 2));
  };

  useEffect(() => {
    if (!tracking || paused) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const durationSec = Math.floor((now - startTime) / 1000);
      setElapsedTime(durationSec);
      setAvgSpeed(distance / (durationSec / 3600)); // km/h
    }, 1000);

    return () => clearInterval(interval);
  }, [tracking, paused, startTime, distance]);

  return (
    <View style={{ flex: 1 }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="close" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {/* CONTENU PRINCIPAL */}
      <View style={{ flex: 1 }}>
          <WebView
            ref={webviewRef}
            originWhitelist={['*']}
            source={{ html }}
            style={[styles.webview, { display: showStats ? 'none' : 'flex' }]}
          />

          {showStats && (
            <View style={styles.statsScreen}>
              <Text style={styles.sectionTitle}>TEMPS</Text>
              <Text style={styles.timeValue}>{formatTime(elapsedTime)}</Text>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>FRÉQUENCE CARDIAQUE</Text>
              <Text style={styles.heartRateValue}>{heartRate} bpm</Text>

              <View style={styles.divider} />

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>VITESSE</Text>
                  <Text style={styles.statNumber}>{avgSpeed.toFixed(1).replace('.', ',')}</Text>
                  <Text style={styles.statUnit}>KM/H</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>DISTANCE</Text>
                  <Text style={styles.statNumber}>{distance.toFixed(0)}</Text>
                  <Text style={styles.statUnit}>KM</Text>
                </View>
              </View>
            </View>
          )}
        </View>


      {/* CONTROLES FLOTTANTS */}
      <View style={styles.floatingControl}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {!tracking && !paused && (
            <TouchableOpacity style={styles.circleButton} onPress={startTracking}>
              <Ionicons name="play" size={32} color="white" />
            </TouchableOpacity>
          )}

          {tracking && !paused && (
            <TouchableOpacity style={styles.circleButton} onPress={pauseTracking}>
              <Ionicons name="pause" size={32} color="white" />
            </TouchableOpacity>
          )}

          {paused && (
            <>
              <TouchableOpacity style={styles.circleButton} onPress={resumeTracking}>
                <Ionicons name="play" size={28} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.circleButton} onPress={stopTracking}>
                <Ionicons name="stop" size={28} color="white" />
              </TouchableOpacity>
            </>
          )}

          {(tracking || paused) && (
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => setShowStats(!showStats)}
            >
              <Ionicons
                name={showStats ? 'map-outline' : 'stats-chart-outline'}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* BARRE BAS - visible uniquement si pas tracking */}
      {!tracking && !paused && (
        <SafeAreaView edges={['bottom']} style={styles.customBottomBar}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="map-outline" size={24} color="black" />
            <Text style={styles.iconLabel}>Itinéraire</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="heart-outline" size={24} color="black" />
            <Text style={styles.iconLabel}>HRM</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="bicycle-outline" size={24} color="black" />
            <Text style={styles.iconLabel}>Sport</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    paddingHorizontal: 16,
    paddingTop: 16,
    justifyContent: 'center',
  },
  customBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    zIndex: 10,
  },
  iconButton: {
    alignItems: 'center',
  },
  iconLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  floatingControl: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  circleButton: {
    backgroundColor: '#007bff',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  statsContainer: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  statText: {
    fontSize: 20,
    marginVertical: 10,
  },
  statsScreen: {
  flex: 1,
  backgroundColor: '#000',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  },
  sectionTitle: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  timeValue: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: '#333',
    marginVertical: 20,
  },
  heartRateValue: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  statUnit: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },
  backToMapButton: {
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backToMapText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
  },
  webview: {
  flex: 1,
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
      var map = L.map('map');
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

      let hasCentered = false;

      window.document.addEventListener("message", function(event) {
        const coords = JSON.parse(event.data);
        if (!Array.isArray(coords) || coords.length === 0) return;

        polyline.setLatLngs(coords);

        const last = coords[coords.length - 1];
        lastPosMarker.setLatLng(last);

        if (!hasCentered) {
          map.setView(last, 16);
          hasCentered = true;
        }
      });
    </script>
</body>
</html>`;
