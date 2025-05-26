import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {Ionicons } from '@expo/vector-icons';
import DraggableFlatList from 'react-native-draggable-flatlist';

export default function WaypointList({ waypoints, setWaypoints, onDelete}) {
  const start = waypoints.find(p => p.role === 'start');
  const end = waypoints.find(p => p.role === 'end');
  const intermediate = waypoints.filter(p => p.role === 'waypoint');
  const [expanded, setExpanded] = useState(false);
  const visibleWaypoints = expanded
  ? intermediate
  : intermediate.slice(0, 2);


  const renderItem = ({ item, drag, index }) => {
    const label = item.label || 'Étape';
    //const prefix = (index !== undefined && !isNaN(index)) ? `${index + 1}` : '?';
    const prefix = `${item.index || '?'}`;


    return (
      <View style={[styles.item, { backgroundColor: '#FF9800' }]} onTouchStart={drag}>
        <TouchableOpacity onPress={() => onDelete(item.id)}>
          <Ionicons name="trash" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.index}>{prefix}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    );
  };

  return (
    <View style={{ maxHeight: 220 }}>
      {/* Start */}
      {start && (
        <View style={[styles.item, { backgroundColor: '#4CAF50' }]}>
          <Text style={styles.index}>D</Text>
          <Text style={styles.label}>{start.label}</Text>
        </View>
      )}

      {/* Waypoints visibles */}
      <DraggableFlatList
        data={visibleWaypoints.map((wp, idx) => ({ ...wp, index: idx + 1 }))}
        onDragEnd={({ data }) => {
          const cleanData = data.map(({ index, ...rest }) => rest);
          const newList = [start, ...cleanData, end].filter(Boolean);
          setWaypoints(newList);
        }}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
          <Text style={styles.label}>{end.label}</Text>
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
});
