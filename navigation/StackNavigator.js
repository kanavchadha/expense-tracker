import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../Screens/Home';
import Search from '../Screens/Search';
import UserInfoForm from '../Screens/UserInfoForm';
import ExpenseForm from '../Screens/ExpenseForm';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
      initialRouteName={'Home'}
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Search" component={Search} options={{ animation: 'slide_from_right' }} />
      <Stack.Group screenOptions={{
        presentation: 'containedTransparentModal',
        animation: 'fade_from_bottom',
        headerTitleAlign: 'center',
        gestureEnabled: true,
        headerShown: false
      }}>
        <Stack.Screen name="UserInfoForm" component={UserInfoForm} />
        <Stack.Screen name="ExpenseForm" component={ExpenseForm} />
      </Stack.Group>
    </Stack.Navigator>

  );
};

export default StackNavigator;
