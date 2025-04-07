import React, { useEffect } from 'react'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import * as Notifications from 'expo-notifications'
import HomeScreen from './screens/HomeScreen'
import DirectoriesScreen from './screens/DirectoriesScreen'
import RemindersListScreen from './screens/RemindersListScreen'
import EducationScreen from './screens/EducationScreen'
import ProfileScreen from './screens/ProfileScreen'
import CreateAudioNoteScreen from './screens/CreateAudioNoteScreen'
import CreateTextNoteScreen from './screens/CreateTextNoteScreen'
import SignUpScreen from './screens/SignUpScreen'
import LogInScreen from './screens/LogInScreen'
import LoadingScreen from './screens/LoadingScreen'
import TextNoteScreen from './screens/TextNoteScreen'
import AudioNoteScreen from './screens/AudioNoteScreen'
import CreateReminderScreen from './screens/CreateReminderScreen'
import ReminderScreen from './screens/ReminderScreen'
import ChangePasswordScreen from './screens/ChangePasswordScreen'
import ResourcesScreen from './screens/ResourcesScreen'


const Stack = createNativeStackNavigator()

export default function App() {
  return ( 
    <NavigationContainer> 
      <Stack.Navigator screenOptions={{headerShown: false}}> 
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="SignUp" component = {SignUpScreen} />
        <Stack.Screen name="LogIn" component = {LogInScreen} />
        <Stack.Screen name="Home" component = {HomeScreen} /> 
        <Stack.Screen name="Directories" component = {DirectoriesScreen} /> 
        <Stack.Screen name="Reminders" component = {RemindersListScreen} />
        <Stack.Screen name="Education" component = {EducationScreen} />
        <Stack.Screen name="Profile" component = {ProfileScreen} />
        <Stack.Screen name="CreateTextNote" component = {CreateTextNoteScreen} />
        <Stack.Screen name="CreateAudioNote" component = {CreateAudioNoteScreen} />
        <Stack.Screen name="TextNote" component = {TextNoteScreen} />
        <Stack.Screen name="AudioNote" component = {AudioNoteScreen} />
        <Stack.Screen name="CreateReminder" component = {CreateReminderScreen} />
        <Stack.Screen name="Reminder" component = {ReminderScreen} />
        <Stack.Screen name="ChangePassword" component = {ChangePasswordScreen} />
        <Stack.Screen name="Resources" component={ResourcesScreen} />
      </Stack.Navigator> 
      <NotificationListener />
    </NavigationContainer> 
  );
}

function NotificationListener() {
  const navigation = useNavigation();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data && data.screen) {
        navigation.navigate(data.screen);
      }
    });

    return () => subscription.remove();
  }, []);

  return null;
}