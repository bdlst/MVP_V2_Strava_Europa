// navigation/EventsStackNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventsScreen from '../screens/EventsScreen';
import EventDetailScreen from '../screens/EventDetailScreen';

const Stack = createNativeStackNavigator();

export default function EventsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="EventsList"
        component={EventsScreen}
        options={{ title: 'Événements' }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: "Détail de l'événement" }}
      />
    </Stack.Navigator>
  );
}
