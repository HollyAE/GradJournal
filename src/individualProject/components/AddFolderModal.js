import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import PropTypes from 'prop-types'



export default function AddFolderModal({ isVisible, onClose, onFolderAdded }){
    //new folder name variable
    const [newFolder, setNewFolder] = useState('');

    //get current user and initialise Firestore
    const currentUser = auth.currentUser
    const db = getFirestore()


    // adding a folder function
    const addFolder = async () => {
        // give alert if no folder name is provided
        if (newFolder.trim() === '') {
            alert('Please enter a folder name');
            return;
        }
    
        try {
            //path to add folder, folder name to add to firestore, add the document
            const userFoldersRef = collection(db, 'files', currentUser.email, 'folders');
            const folderNameRef = doc(userFoldersRef);
            await setDoc(folderNameRef, { title: newFolder });
            // reset the new folder name variable
            setNewFolder('');
            if (onFolderAdded) onFolderAdded(); 
            onClose(); 
        } catch (error) {
            console.error('Error adding folder:', error);
            alert('Error adding folder');
        }
    };

    return (
        <Modal visible={isVisible} transparent={true} onRequestClose={onClose} presentationStyle='overFullScreen'>
            <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPressOut={onClose}>
                <View style={styles.addFolderModal}>
                    <TextInput style={styles.textInput} placeholder="Folder Name..." onChangeText={setNewFolder} value={newFolder} />
                    <Pressable style={styles.addButton} onPress={addFolder}>
                        <Text style={styles.text}>Add Folder</Text>
                    </Pressable>
                </View>
            </TouchableOpacity>
        </Modal>
    )
}

AddFolderModal.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onFolderAdded: PropTypes.func
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addFolderModal: {
        borderWidth: 1.5,
        borderColor: '#000000',
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        width: 270, 
        height: 'auto', 
        position: 'absolute',
        margin: 'auto',
        padding: 20,
    },
    textInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        margin: 10,
        borderRadius: 5,
        padding: 10,
    },
    addButton: {
        backgroundColor: '#8ABDE9',
        padding: 10,
        margin: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    text: {
        marginLeft: 2,
        flexWrap: 'wrap',
        textAlign: 'center',
    }
});
