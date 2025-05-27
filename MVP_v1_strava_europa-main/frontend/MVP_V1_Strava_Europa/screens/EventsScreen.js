import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

// Exemple de données mock
const mockEvents = [
  {
    id: "1",
    name: "Gravel Challenge - Fagnes",
    date: "2025-07-12",
    location: "Stoumont",
    participants: 56,
  },
  {
    id: "2",
    name: "Trail des Hautes Ardennes",
    date: "2025-08-03",
    location: "Malmedy",
    participants: 102,
  },
  {
    id: "3",
    name: "Raid Vélo Canaries",
    date: "2025-11-20",
    location: "Tenerife",
    participants: 31,
  },
];

const EventCard = ({ event, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Text style={styles.title}>{event.name}</Text>
    <Text style={styles.meta}>
      📍 {event.location} — 📅 {event.date}
    </Text>
    <Text style={styles.meta}>👥 {event.participants} participants</Text>
  </TouchableOpacity>
);

export default function EventScreen() {
  const navigation = useNavigation();

  const handlePress = (event) => {
    navigation.navigate("EventDetail", { event });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Événements sportifs à venir</Text>
      <FlatList
        data={mockEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard event={item} onPress={() => handlePress(item)} />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  list: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  meta: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
});

