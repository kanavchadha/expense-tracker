import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../Screens/Home';
import Search from '../Screens/Search';
import UserInfoForm from '../Screens/UserInfoForm';
import ExpenseForm from '../Screens/ExpenseForm';
import Investment from '../Screens/Investment';
import InvestmentForm from '../Screens/InvestmentForm';
import ImportDataScreen from '../Screens/ImportData';

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
        <Stack.Screen name="InvestmentForm" component={InvestmentForm} />
        <Stack.Screen name="ImportData" component={ImportDataScreen} options={{animation: 'default'}} />
      </Stack.Group>
      <Stack.Screen name="Investment" component={Investment} />
    </Stack.Navigator>

  );
};

export default StackNavigator;
