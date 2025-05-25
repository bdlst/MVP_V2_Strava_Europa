import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TrackingScreen from './screens/TrackingScreen';
import RouteBuilderScreen from './screens/RouteBuilderScreen';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Tracking">
        <Stack.Screen name="Tracking" component={TrackingScreen} />
        <Stack.Screen name="Itineraire" component={RouteBuilderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
