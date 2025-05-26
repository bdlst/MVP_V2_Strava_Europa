import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TrackingScreen from './screens/TrackingScreen';
import RouteBuilderScreen from './screens/RouteBuilderScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';



const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Tracking">
          <Stack.Screen name="Tracking" component={TrackingScreen} />
          <Stack.Screen name="Itineraire" component={RouteBuilderScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

