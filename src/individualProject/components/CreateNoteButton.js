import React, { useState } from 'react';
import { Text, View, StyleSheet, Pressable, Modal, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Octicons } from '@expo/vector-icons'

export default function CreateNoteButton( ){
    // variable for whether modal is visible or not
    const [isVisible, setVisible] = useState(false);

    // access navigation functions
    const navigation = useNavigation();

    
    return (
        <View>
            <Modal visible={isVisible} transparent={true} onRequestClose={() => {setVisible(false)}} presentationStyle='overFullScreen'>
                <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPressOut={() => setVisible(false)}>
                    <View style={styles.modal}>
                        <Pressable style={styles.textButton} onPress={() => {navigation.navigate('CreateTextNote'); setVisible(false)}}>
                            <Text style={styles.text}>Create text note</Text>
                        </Pressable>
                        <Pressable style={styles.audioButton} onPress={() => {navigation.navigate('CreateAudioNote'); setVisible(false)}}>
                            <Text style={styles.text}>Create audio note</Text>
                        </Pressable>
                    </View>
                </TouchableOpacity>  
            </Modal>
            
            
            <View>
                <Pressable style = {styles.modalButton} onPress={() => {setVisible(!isVisible)}} >
                    <Octicons name='plus' size={32} color='black' />
                </Pressable>
            </View> 
        </View>
    )
}

const styles = StyleSheet.create({
    modalButton: {
        backgroundColor: '#8CD790',
        borderWidth: 1.5,
        borderColor: '#000000',
        borderRadius: 10,
        height: 47,
        width: 60,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
      },
    modal: {
        borderWidth: 1.5,
        borderColor: '#000000',
        borderRadius: 10,
        position: 'absolute',
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                bottom:84,
                left: 130,
            },
            android: {
                left: 142,
                bottom:87,
            },
        }),
    },
    text: {
        margin: 10,
        textAlign: 'center',
        alignContent: 'center',
        fontWeight: '500'
    },
    audioButton: {
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        height: 45,
    },
    textButton: {
        borderBottomWidth: 1,
        borderColor: '#000000',
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        height: 45,
    }
  });