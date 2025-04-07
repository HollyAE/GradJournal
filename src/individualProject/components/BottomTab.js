import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CreateNoteButton from '../components/CreateNoteButton';
import { FontAwesome5 } from '@expo/vector-icons'
import { AntDesign } from '@expo/vector-icons'



export default function BottomTab() {
    // access navigation functions
    const navigation = useNavigation();

    return (
        <View style={styles.tab}>

            <View>
                <Pressable style={styles.buttonStyle} onPress={() => navigation.navigate('Directories')}>
                    <AntDesign name='folderopen' size={40} color='black' />
                </Pressable>
            </View>

            <View>
                <CreateNoteButton></CreateNoteButton>
            </View>
            

           
            <View>
                <Pressable style={styles.buttonStyle} onPress={() => navigation.navigate('Reminders')}>
                    <FontAwesome5 name='bell' size={32} color='black' />
                </Pressable>
            </View>
            

        </View>
    )
}

const styles = StyleSheet.create({
    tab:{
        backgroundColor: '#8CD790',
        padding: '10%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0, 
        left: 0, 
        right: 0,
        width: '100%',
    },
    buttonStyle:{
        justifyContent: 'center',     
    },
    text:{
        textAlign: 'center',
    }
  });