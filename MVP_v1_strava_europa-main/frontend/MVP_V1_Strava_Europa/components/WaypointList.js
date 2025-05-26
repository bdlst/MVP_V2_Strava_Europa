/*import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';

export default function WaypointList({ waypoints, setWaypoints }) {
  const renderItem = ({ item, drag, isActive }) => {
    const color = item.role === 'start'
      ? '#4CAF50'
      : item.role === 'end'
      ? '#F44336'
      : '#FF9800';

    return (
      <View
        style={[styles.item, { backgroundColor: color }]}
        onTouchStart={drag}
      >
        <Text style={styles.text}>
          {item.role.toUpperCase()} – {item.label}
        </Text>
      </View>
    );
  };

  return (
    <DraggableFlatList
      data={waypoints}
      onDragEnd={({ data }) => setWaypoints(data)}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 10,
    marginVertical: 6,
    borderRadius: 6,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});*/

/*import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';

export default function WaypointList({ waypoints, setWaypoints }) {
  // Séparer les rôles
  const start = waypoints.find(w => w.role === 'start');
  const end = waypoints.find(w => w.role === 'end');
  const intermediate = waypoints.filter(w => w.role === 'waypoint');

  const renderItem = ({ item, drag, isActive }) => (
    <View
      style={[
        styles.item,
        {
          backgroundColor:
            item.role === 'start'
              ? '#4CAF50'
              : item.role === 'end'
              ? '#F44336'
              : '#FF9800',
        },
      ]}
      onTouchStart={item.role === 'waypoint' ? drag : undefined}
    >
      <Text style={styles.text}>{item.role.toUpperCase()} – {item.label}</Text>
    </View>
  );

  return (
    <View>
      //{/* Départ }/*
      {start && (
        <View style={styles.itemWrapper}>
          {renderItem({ item: start })}
        </View>
      )}

      //{/* Étapes glissables }/*
      <DraggableFlatList
        data={intermediate}
        onDragEnd={({ data }) => {
          const newList = [start, ...data, end].filter(Boolean);
          setWaypoints(newList);
        }}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

     // {/* Arrivée }/*
      {end && (
        <View style={styles.itemWrapper}>
          {renderItem({ item: end })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  itemWrapper: {
    marginVertical: 6,
  },
  item: {
    padding: 10,
    marginVertical: 6,
    borderRadius: 6,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});*/

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';

export default function WaypointList({ waypoints, setWaypoints }) {
  const start = waypoints.find(p => p.role === 'start');
  const end = waypoints.find(p => p.role === 'end');
  const intermediate = waypoints.filter(p => p.role === 'waypoint');

  const renderItem = ({ item, drag, index }) => {
    const label = item.label || 'Étape';
    //const prefix = (index !== undefined && !isNaN(index)) ? `${index + 1}` : '?';
    const prefix = `${item.index || '?'}`;


    return (
      <View
        style={[styles.item, { backgroundColor: '#FF9800' }]}
        onTouchStart={drag}
      >
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

      {/* Waypoints */}
      <DraggableFlatList
        data={intermediate.map((wp, idx) => ({ ...wp, index: idx + 1 }))}
        onDragEnd={({ data }) => {
            const cleanData = data.map(({ index, ...rest }) => rest);
            const newList = [start, ...cleanData, end].filter(Boolean);
            setWaypoints(newList);
        }}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled
      />

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
