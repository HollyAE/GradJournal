import React from 'react'
import { Text, View, StyleSheet, ScrollView } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import Layout from '../components/Layout'
import { FontAwesome5 } from '@expo/vector-icons'


export default function ReminderScreen() {
    

    // access use route functions, define parameters passed from previous screen
    const route = useRoute();
    const { reminderName, reminderDate, reminderType, reminderDetails } = route.params;

    // convert firestore timestamp to javascript date object
    const reminderDateTime = reminderDate && reminderDate.seconds ? new Date(reminderDate.seconds * 1000) : null;

    // format date for styling purposes
    const formattedDate = reminderDateTime ? reminderDateTime.toLocaleDateString() : '';

    // format time for styling purposes
    const formattedTime = reminderDateTime ? reminderDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    

    return(
        <View style={styles.container}>
            <Layout text={reminderName}>

                <View>
                    <View style={{ marginHorizontal: 30}}>
                        <View style={styles.noteTypeContainer}>
                            {reminderType == 1 ? 
                                <FontAwesome5 name="file-alt" size={32} color="black" style={{marginHorizontal: 6}}/> :
                                <FontAwesome5 name="file-audio" size={32} color="black" style={{marginHorizontal: 6}}/>
                            }
                            <Text>{reminderType == 1 ? 'Text note' : 'Audio note'}</Text>
                        </View>
                    </View>
                    
                    

                    <View style={styles.button}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <AntDesign name="calendar" size={42} color="black" style={{marginHorizontal: 6}}/>
                                <Text>{formattedDate}</Text>
                            </View>
                            
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Feather name="clock" size={42} color="black" style={{marginHorizontal: 6}}/>
                                <Text>{formattedTime}</Text>
                            </View>
                            
                    </View>
                </View>

                <View>
                    <ScrollView>
                        <Text style={styles.note}>{reminderDetails}</Text>
                    </ScrollView>
                </View>
                

                
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
        fontSize: 28,
        width: 280,
        height: 60,
    },
    note: {
        justifyContent: 'center',
        margin: '5%',
        padding: '4%',
        paddingTop: '6%',
        fontSize: 20,
        borderWidth: 1,
        borderRadius: 14,
        borderColor: 'gray',
        height: 275
    },
    button: {
        paddingHorizontal: 20, 
        paddingVertical: 12, 
        marginHorizontal: 30, 
        marginVertical: 20, 
        backgroundColor: '#8ABDE9',
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-around', 
        alignItems: 'center',
        height: 90
    },
    noteTypeContainer: {
        flexDirection: 'row', 
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#8ABDE9',
        borderRadius: 10,
        padding: 20,
        width: 140
    },
})
