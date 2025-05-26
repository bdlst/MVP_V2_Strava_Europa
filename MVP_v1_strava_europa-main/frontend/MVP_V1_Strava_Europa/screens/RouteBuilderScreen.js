import * as Location from 'expo-location';
import React, { useState, useRef } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import MapBuilder from '../components/MapBuilder';
import { getRoute } from '../Utils/routing';
import RouteBuilderPanel from '../components/RouteBuilderPanel';


export default function RouteBuilderScreen() {
  //const [points, setPoints] = useState({ start: null, end: null, waypoints: [] });
  const [waypoints, setWaypoints] = useState([]);
  const [transportMode, setTransportMode] = useState('foot');
  const [route, setRoute] = useState([]);
  const [gpsPos, setGpsPos] = useState(null);


const onMapPointSelected = (role, coords) => {
  const label = `📍 ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;

  setWaypoints((prev) => {
    if (role === 'start') {
      const others = prev.filter(p => p.role !== 'start');
      return [{ id: 'start', role: 'start', coords, label }, ...others];
    }

    if (role === 'end') {
      const others = prev.filter(p => p.role !== 'end');
      return [...others, { id: 'end', role: 'end', coords, label }];
    }

    if (role === 'waypoint') {
      const id = Date.now().toString();
      const newWaypoint = { id, role, coords, label };
      return [...prev, newWaypoint]; // ✅ on empile sans supprimer
    }

    return prev;
  });
};


  const computeRoute = async () => {
    if (!points.start || !points.end) return;
    const result = await getRoute({
      start: points.start,
      end: points.end,
      waypoints: points.waypoints,
      mode: 'foot'
    });
    setRoute(result);
  };

  const [tracking, setTracking] = useState(false);
const [userTrack, setUserTrack] = useState([]);
const watchRef = useRef(null);

const startNavigation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return;

  setUserTrack([]);
  setTracking(true);

  watchRef.current = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      distanceInterval: 5,
      timeInterval: 1000,
    },
    (loc) => {
      const coords = {
        lat: loc.coords.latitude,
        lng: loc.coords.longitude
      };

      setUserTrack((prev) => [...prev, coords]);
      setGpsPos(coords);
      /*webviewRef.current?.postMessage(JSON.stringify({ type: 'gps', coords }));*/
    }
  );
};

const stopNavigation = () => {
  watchRef.current?.remove();
  setTracking(false);
  console.log('Parcours réel :', userTrack);
};


  return (
    <View style={{ flex: 1 }}>
      <MapBuilder onMapPointSelected={onMapPointSelected} route={route} gpsPosition={gpsPos} />
      <RouteBuilderPanel
        waypoints={waypoints}
        setWaypoints={setWaypoints}
        transportMode={transportMode}
        setTransportMode={setTransportMode}
      />
      <View style={styles.buttonRow}>
        <Button title="Calculer itinéraire" onPress={computeRoute} />
      <Button title="Suivre l’itinéraire" onPress={startNavigation} disabled={tracking} />
      <Button title="Stop" onPress={stopNavigation} disabled={!tracking} />
      </View>
    </View>
    
  );
}

const styles = StyleSheet.create({
  buttonRow: {
  position: 'absolute',
  bottom: 100,
  alignSelf: 'center',
  flexDirection: 'row',
  gap: 10,
},
});

