import React from 'react';
import { useState, useMemo } from 'react'
import * as Notifications from 'expo-notifications'
import RadioGroup from 'react-native-radio-buttons-group';
import { TextInput, Text, Pressable, View, StyleSheet, TouchableWithoutFeedback, Keyboard, TouchableOpacity, ScrollView, Platform } from 'react-native'
import { doc, setDoc, getFirestore, collection } from 'firebase/firestore'
import { useNavigation } from '@react-navigation/native'
import { Entypo } from '@expo/vector-icons'
import { auth } from "../firebase";
import RNDateTimePicker from '@react-native-community/datetimepicker'
import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';



export default function CreateReminderScreen() {

    //variables
    // reminder name, details content, reminder note type, date and time
    const [name, setName] = useState('');
    const [details, setDetails] = useState('');
    const [noteType, setNoteType] = useState();
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    // save alert 
    const [saveAlert, setSaveAlert] = useState(false);
    // focus state for details 
    const [detailsFocused, setDetailsFocused] = useState(false);
    // date and time pickers visibility
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);


    // get access to navigation functions, initialise Firestore, get current user
    const navigation = useNavigation();
    const db = getFirestore();
    const currentUser = auth.currentUser;


    // radiobuttons info
    const radioButtons = useMemo(() => ([
        {
            id: '1', 
            label: 'Text',
            value: 'text',
            labelStyle: {fontWeight: '500'}
        },
        {
            id: '2',
            label: 'Audio',
            value: 'audio',
            labelStyle: {fontWeight: '500'}
        }
    ]), []);

    // get permission to send notifications
    async function requestPermissions() {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    }

    // combine date time for storing the info in Firestore
    const combineDateTime = (date, time) => {
        if (!date || !time) return;
    
        let combinedDateTime = new Date(date);
        combinedDateTime.setHours(time.getHours(), time.getMinutes(), 0, 0); 
    
        return combinedDateTime;
    };
    


    // handle saving reminder
    const handleSaveReminder = async () => {
        try{
            if (!(await requestPermissions())) {
                alert("Notifications permission is required to set reminders.");
                return;
            }

            // combines date time for storing in Firestore
            const notificationTime = combineDateTime(date, time);
            if (!notificationTime) {
                alert("Please set both date and time.");
                return;
            }

            // schedules notification for date time
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: name,
                    body: details,
                    data: { screen: noteType === '1' ? 'CreateTextNote' : 'CreateAudioNote' },
                },
                trigger: notificationTime,
            });

            // uploading reminder data to Firestore
            const locationRef = collection(db, 'reminders', currentUser.email, 'userReminders');
            const reminderRef = doc(locationRef);
            const reminderDetails = {
                name: name,
                details: details,
                notificationDateTime: notificationTime,
                noteType: noteType,
            };
            await setDoc(reminderRef, reminderDetails);
            setSaveAlert(true); 
            console.log("Reminder saved successfully");
      
            setTimeout(() => {
              navigation.goBack();
            }, 2000);
        }
         catch (error) {
            console.error("Error saving reminder:", error);
        }
    }

    // handles date being changed
    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios'); 
        if (selectedDate) {
            setDate(selectedDate);
        } else {
            setShowDatePicker(false); 
        }
    };

    // handles times being changed
    const onTimeChange = (event, selectedTime) => {
        setShowTimePicker(Platform.OS === 'ios'); 
        if (selectedTime) {
            setTime(selectedTime);
        } else {
            setShowTimePicker(false); 
        }
    };

    // formatting date and time for readability 
    const formatDate = (date) => date ? format(date, 'PPP') : 'No date selected';
    const formatTime = (time) => time ? format(time, 'p') : 'No time selected';

    return(
        <TouchableWithoutFeedback  onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                { saveAlert && (
                    <View style={styles.alertContainer}>
                        <View style={styles.alert}>
                            <Feather name="check-circle" size={24} color="black" />
                            <Text style={{fontWeight: 'bold', marginLeft: 4}}>Reminder saved successfully!</Text>
                        </View>
                    </View>
                )
                }
                <View style={styles.titleContainer}>
                    <View>
                        <TextInput style={styles.title} onChangeText={setName} value={name}  multiline maxLength={75} placeholder="Name..."/>
                    </View>

                    <View>
                        <Pressable onPress={() => navigation.goBack()}>
                            <Entypo name="cross" size={32} color="black" />
                        </Pressable>
                    </View>  
                </View>

                <View>
                    <ScrollView>
                        <TextInput style={[styles.details, { height: detailsFocused ? 180 : 50 }]} onChangeText={setDetails} value={details} placeholder="Details..." multiline onFocus={() => setDetailsFocused(true)} onBlur={() => setDetailsFocused(false)}/>
                    </ScrollView>
                </View>
                

                <View style={styles.centreContainer}>
                    <View >
                        <TouchableOpacity style={styles.button} onPress={() => setShowDatePicker(true)}>
                            <AntDesign name="calendar" size={42} color="black" />
                            <Text style={{marginLeft: 10}}>{Platform.OS === 'android' ? formatDate(date) : ''}</Text>
                            {Platform.OS === 'ios' && (
                                <RNDateTimePicker
                                    mode="date"
                                    value={date}
                                    onChange={onDateChange}
                                />
                            )}
                            {showDatePicker && Platform.OS === 'android' && (
                            <RNDateTimePicker
                                mode="date"
                                value={date}
                                display="default"
                                onChange={onDateChange}
                            />
                            )}
                        </TouchableOpacity>
                        
                    </View>

                    <View >
                        <TouchableOpacity style={styles.button} onPress={() => setShowTimePicker(true)}>
                            <Feather name="clock" size={42} color="black" />
                            <Text>{Platform.OS === 'android' ? formatTime(time) : ''}</Text>
                            {Platform.OS === 'ios' && (
                                <RNDateTimePicker
                                    mode="time"
                                    value={time}
                                    onChange={onTimeChange}
                                />
                            )}
                            {showTimePicker && Platform.OS === 'android' && (
                            <RNDateTimePicker
                                mode="time"
                                value={time}
                                display="default"
                                onChange={onTimeChange}
                            />
                             )}
                        </TouchableOpacity>
                        
                    </View>

                    <View style={[styles.button, {flexDirection: 'column', alignItems: 'flex-start'}]}>
                        <Text style={styles.noteTypeText}>Type of note...</Text>
                        <RadioGroup radioButtons={radioButtons} onPress={setNoteType} selectedId={noteType} layout='row' />
                    </View>

                </View>


               <View style={styles.buttonsContainer}>
                {name && noteType && date && time &&
                    <TouchableOpacity style={styles.saveButton} onPress={() => [handleSaveReminder()]}>
                        <Text style={{fontSize: 16, fontWeight: '500'}}>Save</Text>
                    </TouchableOpacity>
                }
                
               </View>
               
            </View>
        </TouchableWithoutFeedback>
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
      fontSize: 28,
      width: 280,
      height: 60,
      borderBottomWidth: 1
    },
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      margin: '5%',
      marginTop: '17%',
    },
    details: {
        justifyContent: 'center',
        textAlignVertical: 'top',
        padding: '4%',
        margin: '3%',
        paddingTop: '3%',
        fontSize: 20,
        borderWidth: 1,
        borderRadius: 14,
        borderColor: 'gray',
    },
    button: {
        paddingHorizontal: 28,
        paddingVertical: 26,
        marginHorizontal: 75,
        marginVertical: 20,
        backgroundColor: '#8ABDE9',
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 225
    },
    saveButton: {
        justifyContent: 'space-between',
        paddingHorizontal: 28,
        paddingVertical: 24,
        backgroundColor: '#8ABDE9',
        borderRadius: 10,
    },
    buttonsContainer: {
        bottom: 60,
        position: 'absolute',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 10,
    },
    centreContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 170,
    },
    noteTypeText: {
        marginVertical: 3,
        fontSize: 16,
        marginBottom: 6,
        fontWeight: '500'
    },
    alert: {
        borderColor: 'black',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderWidth: 1,
        flexDirection: 'row',
        width: 220,
        height: 175,
        backgroundColor: '#FFFFFF',
        padding: 15
    },
    alertContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.7)', 
        zIndex: 1000,
      }
});