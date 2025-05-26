import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TransportSelector from './TransportSelector';
import WaypointList from './WaypointList';



console.log("RouteBuilderPanel load");

export default function RouteBuilderPanel({ waypoints, setWaypoints, transportMode, setTransportMode }) {

  //const [transportMode, setTransportMode] = useState('bike'); // 👈 ajoute ceci
  /*const [waypoints, setWaypoints] = React.useState([
  { id: '1', role: 'start', label: 'Paris' },
  { id: '2', role: 'waypoint', label: 'Orléans' },
  { id: '3', role: 'end', label: 'Tours' },
  ]);*/
  //const [waypoints, setWaypoints] = useState([]);

  const onMapPointSelected = (role, coords) => {
  const label = `📍 ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;

  if (role === 'start') {
    setWaypoints((prev) => {
      const others = prev.filter(p => p.role !== 'start');
      return [{ id: 'start', role: 'start', coords, label }, ...others];
    });
  } else if (role === 'end') {
    setWaypoints((prev) => {
      const others = prev.filter(p => p.role !== 'end');
      return [...others, { id: 'end', role: 'end', coords, label }];
    });
  } else if (role === 'waypoint') {
    setWaypoints((prev) => {
      const id = Date.now().toString();
      const newStep = { id, role: 'waypoint', coords, label };
      // insérer entre start et end si existants
      const start = prev.find(p => p.role === 'start');
      const end = prev.find(p => p.role === 'end');
      const middle = prev.filter(p => p.role === 'waypoint');
      return [start, ...middle, newStep, end].filter(Boolean);
    });
  }
};



  return (
    <View style={styles.panel}>
      <Text style={styles.text}>🎯 Route Builder Panel chargé</Text>
      <TransportSelector selected={transportMode} onSelect={setTransportMode} />
      <WaypointList waypoints={waypoints} setWaypoints={setWaypoints} />
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
