import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { relabelWaypoints } from '../Utils/waypoints';

export default function WaypointList({ waypoints, setWaypoints, onDelete }) {
  const start = waypoints.find(p => p.role === 'start');
  const end = waypoints.find(p => p.role === 'end');
  const intermediate = waypoints.filter(p => p.role === 'waypoint');
  const [expanded, setExpanded] = useState(false);
  const visibleWaypoints = expanded ? intermediate : intermediate.slice(0, 2);

  return (
    <View style={{ maxHeight: 220 }}>
      {/* Start */}
      {start && (
        <View style={[styles.item, { backgroundColor: '#4CAF50' }]}>
          <Text style={styles.index}>D</Text>
          <Text style={styles.label}>
            📍 {start.coords.lat.toFixed(4)}, {start.coords.lng.toFixed(4)}
          </Text>
        </View>
      )}

      {/* Waypoints visibles */}
      <DraggableFlatList
        data={visibleWaypoints.map((wp, idx) => ({
          ...wp,
          displayIndex: idx + 1,
          label: `📍 ${wp.coords.lat.toFixed(4)}, ${wp.coords.lng.toFixed(4)}`
        }))}
        onDragEnd={({ data }) => {
          const intermediate = data.map(({ displayIndex, label, ...rest }) => rest);
          const start = waypoints.find(p => p.role === 'start');
          const end = waypoints.find(p => p.role === 'end');
          const all = [start, ...intermediate, end].filter(Boolean);

          const updated = all.map((wp, idx) => {
            if (wp.role === 'start' || wp.role === 'end') {
              return {
                ...wp,
                label: `📍 ${wp.coords.lat.toFixed(4)}, ${wp.coords.lng.toFixed(4)}`
              };
            }
            const displayIndex = idx - (start ? 1 : 0);
            return {
              ...wp,
              displayIndex: displayIndex + 1,
              label: `📍 ${wp.coords.lat.toFixed(4)}, ${wp.coords.lng.toFixed(4)}`
            };
          });

          setWaypoints(updated);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item, drag }) => (
          <TouchableOpacity onPressIn={drag}>
            <View style={[styles.item, { backgroundColor: '#FF9800' }]}>
              <TouchableOpacity onPress={() => onDelete(item.id)}>
                <Ionicons name="trash" size={20} color="white" />
              </TouchableOpacity>
              <Text style={styles.index}>{item.displayIndex}</Text>
              <Text style={styles.label}>{item.label}</Text>
            </View>
          </TouchableOpacity>
        )}
        scrollEnabled
      />

      {/* Ligne "Afficher +X" si nécessaire */}
      {!expanded && intermediate.length > 2 && (
        <TouchableOpacity onPress={() => setExpanded(true)} style={styles.expandBtn}>
          <Text style={styles.expandText}>
            {`+${intermediate.length - 2} point${intermediate.length - 2 > 1 ? 's' : ''} de passage`}
          </Text>
        </TouchableOpacity>
      )}

      {/* End */}
      {end && (
        <View style={[styles.item, { backgroundColor: '#F44336' }]}>
          <Text style={styles.index}>A</Text>
          <Text style={styles.label}>
            📍 {end.coords.lat.toFixed(4)}, {end.coords.lng.toFixed(4)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    marginVertical: 4,
    borderRadius: 6,
  },
  index: {
    fontWeight: 'bold',
    width: 24,
    color: 'white',
    textAlign: 'center',
    marginRight: 8,
  },
  label: {
    color: 'white',
    flexShrink: 1,
  },
  expandBtn: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  expandText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
});
