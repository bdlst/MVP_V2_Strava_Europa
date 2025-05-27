import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import TransportSelector from './TransportSelector';
import WaypointList from './WaypointList';
import MapBuilder from './MapBuilder';
import { relabelWaypoints } from '../Utils/waypoints'; // ou déplace la fonction ici si c'est plus simple


const SCREEN_HEIGHT = Dimensions.get('window').height;
const MIN_HEIGHT = 80;
const MAX_HEIGHT = SCREEN_HEIGHT / 2;


console.log("RouteBuilderPanel load");

export default function RouteBuilderPanel({ waypoints, setWaypoints, transportMode, setTransportMode, gpsPosition }) {

  //const [transportMode, setTransportMode] = useState('bike'); // 👈 ajoute ceci
  /*const [waypoints, setWaypoints] = React.useState([
  { id: '1', role: 'start', label: 'Paris' },
  { id: '2', role: 'waypoint', label: 'Orléans' },
  { id: '3', role: 'end', label: 'Tours' },
  ]);*/
  //const [waypoints, setWaypoints] = useState([]);
  const translateY = useSharedValue(0);
  const [expanded, setExpanded] = useState(false);


  const handleDelete = (id) => {
    setWaypoints(prev => relabelWaypoints(prev.filter(p => p.id !== id)));
  };

  const dynamicHeight = MIN_HEIGHT + waypoints.length * 40; // base + hauteur par ligne
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    height: expanded ? dynamicHeight : MIN_HEIGHT,
  }));

  const onMapPointSelected = (role, coords) => {
  const label = `📍 ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;

  setWaypoints(prev => {
    let updated;

    if (role === 'start') {
      const others = prev.filter(p => p.role !== 'start');
      updated = [{ id: 'start', role: 'start', coords, label }, ...others];
    } else if (role === 'end') {
      const others = prev.filter(p => p.role !== 'end');
      updated = [...others, { id: 'end', role: 'end', coords, label }];
    } else if (role === 'waypoint') {
      const id = Date.now().toString();
      const newStep = { id, role: 'waypoint', coords, label };
      const start = prev.find(p => p.role === 'start');
      const end = prev.find(p => p.role === 'end');
      const middle = prev.filter(p => p.role === 'waypoint');
      updated = [start, ...middle, newStep, end].filter(Boolean);
    } else {
      updated = prev;
    }

    return relabelWaypoints(updated); // 🧠 cette ligne fait toute la magie
  });
};


const onDeletePointAt = (coords) => {
  const match = (p) =>
    Math.abs(p.coords.lat - coords.lat) < 0.0001 &&
    Math.abs(p.coords.lng - coords.lng) < 0.0001;

  setWaypoints((prev) => prev.filter(p => !match(p)));
};






  return (
    <View style={styles.panel}>
      <Text style={styles.text}>🎯 Route Builder Panel chargé</Text>
      <TransportSelector selected={transportMode} onSelect={setTransportMode} />
      <MapBuilder waypoints={waypoints} onMapPointSelected={onMapPointSelected} gpsPosition={gpsPosition} onDeletePointAt={onDeletePointAt}/>
      <WaypointList waypoints={waypoints} setWaypoints={setWaypoints} onDelete={handleDelete} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    elevation: 4,
    zIndex: 10,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
