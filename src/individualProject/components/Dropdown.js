import React, { useState } from 'react';
import { Text, View, StyleSheet, Pressable, Modal, TouchableOpacity, Platform, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Entypo } from '@expo/vector-icons'
import { auth } from '../firebase';
import AddFolderModal from './AddFolderModal';
import PropTypes from 'prop-types'


export default function Dropdown({addFolderFunction, onDeleteFolder, onExportFolder}){
    // variable for whether dropdown modal is visible or not
    const [isVisible, setVisible] = useState(false);
    // variable for whether add folder modal is visible or not
    const [isAddFolderModalVisible, setIsAddFolderModalVisible] = useState(false);

    // access navigation and route functions
    const navigation = useNavigation();
    const route = useRoute();



    //list of the main buttons (Home, Profile, Education screen), to allow for correct display
    const buttons = [
        route.name !== 'Education' && { screenName: 'Education', buttonText: 'Learn about Meta-skills' },
        route.name !== 'Profile' && { screenName: 'Profile', buttonText: 'Profile' },
        route.name !== 'Home' && { screenName: 'Home', buttonText: 'Home' }
    ].filter(Boolean); 

    //function for button to logout of account
    const logOut = async () => {
        try {
            await auth.signOut();
            navigation.navigate('LogIn'); 
        } catch (error) {
            console.error('Logout failed', error);
        }
    };
       
    // delete folder alert
    const deleteFolderAlert = () =>
    Alert.alert('Are you sure you want to delete this folder?', 'This will delete all of your notes in this selected folder.', [
      {
        text: 'Cancel',
        onPress: null,
        style: 'cancel',
      },
      {text: 'OK', onPress: onDeleteFolder}
    ]);



    return (
        <View>
            <Modal visible={isVisible} transparent={true} onRequestClose={() => {setVisible(false)}} presentationStyle='overFullScreen'>
                <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPressOut={() => setVisible(false)}>
                    <View style={styles.modal}>

                        {route.name === 'Directories' ? 
                            [<TouchableOpacity key='AddFolder' style={[styles.mainButtons, styles.borderBottom]} onPress={() => setIsAddFolderModalVisible(true)}>
                                <Text style={styles.text}>Add folder...</Text>
                            </TouchableOpacity>,
                            <TouchableOpacity key='DeleteFolder' style={[styles.mainButtons, styles.borderBottom]} onPress={() => deleteFolderAlert()}>
                                <Text style={styles.text}>Delete folder...</Text>
                            </TouchableOpacity>,
                            <TouchableOpacity key='ExportFolder' style={[styles.mainButtons, styles.borderBottom]} onPress={onExportFolder}>
                                <Text style={styles.text}>Export folder...</Text>
                            </TouchableOpacity>
                            ] : null
                        }

                        {route.name === 'Reminders' ? 
                            [<TouchableOpacity key='CreateReminder' style={[styles.mainButtons, styles.borderBottom]} onPress={() => { navigation.navigate('CreateReminder'); setVisible(false)}}>
                                <Text style={styles.text}>Create Reminder...</Text>
                            </TouchableOpacity>
                            ] : null
                        }
                        
                        

                        <AddFolderModal isVisible={isAddFolderModalVisible} onClose={() => setIsAddFolderModalVisible(false)} onFolderAdded={addFolderFunction} />

                        {buttons.map((button, index) => (
                            <Pressable key={index} style={[styles.mainButtons, styles.borderBottom]} onPress={() => { navigation.navigate(button.screenName); setVisible(false) }}>
                                <Text style={[styles.text, styles.italicButtonText]}>{button.buttonText}</Text>
                            </Pressable>))
                        }

                        <Pressable key='Logout' style={styles.mainButtons} onPress={() => {setVisible(false); logOut()}}>
                            <Text style={[styles.text, styles.logOutText]}>Logout</Text>
                        </Pressable>
                    </View>
                </TouchableOpacity>  
            </Modal>
            
            
            <View style = {styles.modalButton}>
                <Pressable onPress={() => {setVisible(!isVisible)}}>
                    <Entypo name='dots-three-vertical' size={32} color='black' />
                </Pressable>
            </View> 
        </View>
    )
}

Dropdown.propTypes = {
    addFolderFunction: PropTypes.func,
    onDeleteFolder: PropTypes.func,
    onExportFolder: PropTypes.func,
  }

const styles = StyleSheet.create({
    modalButton: {
        backgroundColor: '#8CD790',
        borderWidth: 1.5,
        borderColor: '#000000',
        borderRadius: 10,
        marginRight: 10,
        marginTop: '44%',
        margin: 40,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
    modal: {
        borderWidth: 1.5,
        borderColor: '#000000',
        borderRadius: 10,
        position: 'absolute', 
        right: 10,
        backgroundColor: '#FFFFFF',
        width: 170,
        ...Platform.select({
            ios: {
              top:108,
            },
            android: {
              top:57,
            },
        }),
    },
    text: {
        marginLeft: 2,
        flexWrap: 'wrap',
        textAlign: 'center',
    },
    mainButtons: {
        padding: 3,
        textAlign: 'center',
        justifyContent: 'center',
        height: 45,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderColor: '#000000',
    },
    logOutText: {
        fontWeight: 'bold',
        color: '#E22525',
    },
    deleteFolderText: {
        color: '#E22525'
    },
    italicButtonText: {
        fontStyle: 'italic',
        textDecorationLine: 'underline',
        textDecorationStyle: 'solid',
        textDecorationColor: 'black'
    },
    textInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        margin: 10,
        borderRadius: 5,
        padding: 10,
    },
  });