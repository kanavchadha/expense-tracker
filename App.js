import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppState } from "react-native";
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import StackNavigator from './navigation/StackNavigator';
import { enableScreens } from 'react-native-screens';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import UserContextProvider from './Context/user';
import { initDB, getUnpaidNotificationData } from './helpers';

enableScreens();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    border: "transparent",
  },
};

initDB().then(() => {
  console.log('connected to DB Successfully');
}).catch((err) => {
  console.log('Initializing DB failed!', err.message);
})

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true
  })
});

export default function App() {

  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if(nextAppState === 'active') return;
      Notifications.cancelAllScheduledNotificationsAsync().then(async res => {
        const { notificationContent, trigger } = await getUnpaidNotificationData();
        // console.log('trigger: ',trigger, notificationContent);
        if (!trigger) return;
        await Notifications.scheduleNotificationAsync({
          content: notificationContent,
          trigger: trigger,
        });
      }).catch(err => {
        console.log('Notifications Error: ', err.message);
      })
    });
    return () => {
      subscription?.remove();
    };
  }, []);

  const [loaded] = useFonts({
    'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Black': require('./assets/fonts/Roboto-Black.ttf'),
    'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
  });
  if (!loaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="auto" />
      <UserContextProvider>
        <NavigationContainer theme={theme}>
          <StackNavigator />
        </NavigationContainer>
      </UserContextProvider>
    </>
  );
}