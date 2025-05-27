import React from "react";
import { View, Text, StyleSheet, ScrollView, Button } from "react-native";
import { useRoute } from "@react-navigation/native";

export default function EventDetailScreen() {
  const route = useRoute();
  const { event } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{event.name}</Text>
      <Text style={styles.meta}>📍 {event.location}</Text>
      <Text style={styles.meta}>📅 {event.date}</Text>
      <Text style={styles.meta}>👥 {event.participants} participants</Text>

      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. 
        Praesent libero. Sed cursus ante dapibus diam.
      </Text>

      <Button title="S'inscrire" onPress={() => alert("Inscription à venir")} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  meta: {
    fontSize: 16,
    color: "#444",
    marginBottom: 4,
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    fontSize: 15,
    marginTop: 10,
    marginBottom: 20,
    color: "#666",
  },
});
