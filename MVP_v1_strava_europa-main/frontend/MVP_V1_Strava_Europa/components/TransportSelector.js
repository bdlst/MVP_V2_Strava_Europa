import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const modes = [
  { label: '🚶‍♂️ Marche', value: 'foot' },
  { label: '🚴‍♀️ Vélo', value: 'bike' },
  { label: '🚗 Voiture', value: 'car' },
];

export default function TransportSelector({ selected, onSelect }) {
  return (
    <View style={styles.container}>
      {modes.map((mode) => (
        <TouchableOpacity
          key={mode.value}
          style={[styles.button, selected === mode.value && styles.selected]}
          onPress={() => onSelect(mode.value)}
        >
          <Text style={styles.label}>{mode.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  selected: {
    backgroundColor: '#007bff',
  },
  label: {
    color: '#000',
    fontWeight: 'bold',
  },
});
