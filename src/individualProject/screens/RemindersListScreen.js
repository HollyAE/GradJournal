import React, { useState, useEffect, useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import { auth } from "../firebase"
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import Layout from '../components/Layout';
import { FontAwesome5 } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native';



export default function RemindersListScreen(){

  // variables for list of reminders from Firestore, and current reminder selected
  const [remindersList, setRemindersList] = useState([]);
  const [currentReminder ] = useState('');
  // sort variable to determine either ascending or descending
  const [sortDescending, setSortDescending] = useState(true);

  // get access to navigation functions, initialise Firestore, get current user
  const navigation = useNavigation();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  // fetch reminders from Firestore
  const fetchReminders = async () => {
    try {
      const filesRef = collection(db, 'reminders', currentUser.email, 'userReminders');
      const querySnapshot = await getDocs(filesRef);
      const reminders = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        const reminderTuple = [doc.id, docData.name, docData.notificationDateTime, docData.noteType, docData.details ]
        reminders.push(reminderTuple); 
      });
      reminders.sort((a, b) => a[1].localeCompare(b[1]));
      setRemindersList(reminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  // fetch reminders on component mount
  useEffect(() => {
    fetchReminders();
  }, []);

  // when user navigates back to screen fetch reminders again
  useFocusEffect(
    useCallback(() => {
      fetchReminders();
    }, [])
  );

  // sort the reminders, toggle between ascending and descending
  const sortReminders = () => {
    const sortedReminders = [...remindersList].sort((a, b) => {
      const dateA = a[2].seconds;
      const dateB = b[2].seconds;
      return sortDescending ? dateB - dateA : dateA - dateB; 
    });
    setRemindersList(sortedReminders);
    setSortDescending(!sortDescending); 
  };


  return (
      <View style={styles.container}> 
          <Layout text={'Reminders'} >
      

            <View style={styles.sortContainer}>
              <TouchableOpacity style={styles.customButton} onPress={sortReminders}>
                {sortDescending ? <FontAwesome5 name="sort-amount-down" size={24} color="black" /> :
                  <FontAwesome5 name="sort-amount-up" size={24} color="black" />
                }
                <Text style={{fontWeight: '500', marginLeft: 12}}>{sortDescending ? 'Sort Newest to Oldest' : 'Sort Oldest to Newest'}</Text>
                
              </TouchableOpacity>
            </View>

            {(remindersList.length !== 0) && (currentReminder === '') &&
              <ScrollView style={{maxHeight: 480}}>
                <View>
                  {remindersList.map((reminder, index) => (
                    <TouchableOpacity style={styles.button} key={index} onPress={() => {navigation.navigate('Reminder', {reminderID: reminder[0],  reminderName: reminder[1], reminderDate: reminder[2], reminderType: reminder[3], reminderDetails: reminder[4]})}} >
                      <View style={{maxWidth: 240}}>
                        <Text style={styles.text}>{reminder[1]}</Text>
                      </View>
                      <View style={{flexDirection: 'row'}}>
                        <FontAwesome5 name='bell' size={32} color='black' style={{marginHorizontal: 6}}/>
                        {reminder[3] == 1 ? 
                            <FontAwesome5 name="file-alt" size={32} color="black" style={{marginHorizontal: 6}}/> :
                            <FontAwesome5 name="file-audio" size={32} color="black" style={{marginHorizontal: 6}}/>
                        }
                      </View>
                      
                    </TouchableOpacity>)
                  )}
                </View>
              </ScrollView>
            }
          </Layout>
      </View> 
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#E9EAEC',
    },
    title: {
      textAlign: 'left',
      color: '#454545',
      margin: '5%',
      marginTop: '15%',
      fontSize: 24,
    },
    body: {
      alignItems: 'center',
      justifyContent: 'center',
      margin: '5%',
    },
    button: {
      marginHorizontal: 30,
      paddingVertical: 25,
      paddingHorizontal: 5,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    text: {
      fontSize: 24,
      marginLeft: 4
    },
    customButton: {
      paddingHorizontal: 18,
      marginVertical: 4,
      backgroundColor: '#8ABDE9',
      borderRadius: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: 170,
      height: 70,
      borderWidth: 1.5,
      borderColor: 'black',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginHorizontal: 30
  }
  });