import React from 'react';
import { useState, useEffect } from 'react'
import { TextInput, Text, View, StyleSheet, TouchableWithoutFeedback, Keyboard, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native'
import { CheckBox } from '@rneui/themed'
import { doc, setDoc, getFirestore, collection, getDocs } from 'firebase/firestore'
import { useNavigation } from '@react-navigation/native'
import { Entypo } from '@expo/vector-icons'
import { auth } from "../firebase";
import { AntDesign } from '@expo/vector-icons'
import { Feather } from '@expo/vector-icons';
import AddFolderModal from '../components/AddFolderModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';


export default function CreateTextNoteScreen(){

  // variables
  // note title, note content
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  // user firebase info
  const [folderID, setFolderID] = useState(null);
  const [collections, setCollections] = useState([]);
  // modal visibility
  const [isChooseFolderModalVisible, setIsChooseFolderModalVisible] = useState(false);
  const [isAddFolderModalVisible, setIsAddFolderModalVisible] = useState(false);
  const [isSkillTagModalVisible, setIsSkillTagModalVisible] = useState(false);
  // keyboard visibility
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  // save alert
  const [saveAlert, setSaveAlert] = useState(false);
  // skill tags
  const [selfManagement, setSelfManagement] = useState(false);
  const [socialIntelligence, setSocialIntelligence] = useState(false);
  const [innovation, setInnovation] = useState(false);


  // get access to navigation functions, initialise Firestore, get current user
  const navigation = useNavigation();
  const db = getFirestore();
  const currentUser = auth.currentUser;


  // fetch folders from Firestore
  const fetchCollections = async () => {
    try {
      const filesRef = collection(db, 'files', currentUser.email, 'folders');
      const querySnapshot = await getDocs(filesRef);
      const folders = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        const folderTuple = [doc.id, docData.title]
        folders.push(folderTuple); 
      });
      setCollections(folders);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  // fetch folders on component mount
  useEffect(() => {
    fetchCollections();
  }, []);

  // set up listeners for keyboard visibility, for resizing of note content box
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);


  // save note to Firestore
  const saveNoteToFolder = async (folderID, noteTitle, noteContent, skillTag) => {
    try {
      // uploading note to Firestore
      const locationRef = collection(db, 'files', currentUser.email, 'folders', folderID, 'writtenNotes');
      const noteRef = doc(locationRef);
      const noteMessage = {
        title: noteTitle,
        note: noteContent,
        skillTag: skillTag,
      };
      await setDoc(noteRef, noteMessage);
      setSaveAlert(true); 
      console.log("Note saved successfully");

      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error("Error saving note:", error);
    }
};

// adjust height of note content box based on keyboard visibility and platform
const noteInputStyle = [
  styles.note,
  {
    height: keyboardVisible ? (Platform.OS === 'android' ? 300 : 280) : (Platform.OS === 'android' ? 460 : 460),
  },
];


  return (
  <TouchableWithoutFeedback  onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}>
    {
        saveAlert && (
          <View style={styles.alertContainer}>
            <View style={styles.alert}>
              <Feather name="check-circle" size={24} color="black" />
              <Text style={{fontWeight: 'bold', marginLeft: 4}}>Note saved successfully!</Text>
            </View> 
          </View>
        )
      }

      <View style={styles.titleContainer}>
        <View>
          <TextInput style={styles.title} onChangeText={setTitle} value={title}  multiline maxLength={75} placeholder="Title..."/>
        </View>

        <View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Entypo name="cross" size={32} color="black" />
          </TouchableOpacity>
        </View>
        
      </View>

      <View style={{  alignItems: 'flex-end', right: '5%' }}>
        <TouchableOpacity onPress={() => setIsSkillTagModalVisible(true)} style={[styles.skillTagButton]}>
          <MaterialCommunityIcons name="head-cog-outline" size={28} color="black" />
          <Text style={{fontWeight: '500', marginLeft: 4}}>Tag skill...</Text>
        </TouchableOpacity>
      </View>


      <Modal visible={isSkillTagModalVisible} transparent={true} onRequestClose={() => setIsSkillTagModalVisible(false)} presentationStyle='overFullScreen'>
        <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPressOut={() => setIsSkillTagModalVisible(false)}>
          <View style={[styles.skillTagModal, { top: Platform.OS === 'android' ? '19%' : '24%' }]}>
            <CheckBox center title="Self Management" titleProps={{ style: { color: '#36627b', fontWeight: 'bold' } }} checkedIcon="dot-circle-o" uncheckedIcon="circle-o" checked={selfManagement} onPress={() => setSelfManagement(!selfManagement)} />
            <CheckBox center title="Social Intelligence" titleProps={{ style: { color: '#827390', fontWeight: 'bold' } }} checkedIcon="dot-circle-o" uncheckedIcon="circle-o" checked={socialIntelligence} onPress={() => setSocialIntelligence(!socialIntelligence)} />
            <CheckBox center title="Innovation" titleProps={{ style: { color: '#83855c', fontWeight: 'bold' } }} checkedIcon="dot-circle-o" uncheckedIcon="circle-o" checked={innovation} onPress={() => setInnovation(!innovation)} />
          </View>
        </TouchableOpacity>
      </Modal>

      
        
      <ScrollView>
        <TextInput style={[styles.note, noteInputStyle]} onChangeText={setNote} value={note} placeholder="Write a note..." multiline />
      </ScrollView>


      <View style={styles.buttonsContainer}> 
        <View style = {styles.modalButton}>
          <TouchableOpacity style={styles.chooseFolderButton} onPress={() => {setIsChooseFolderModalVisible(!isChooseFolderModalVisible)}}>
            <AntDesign name='folderopen' size={40} color='black' />
            <Text style={{fontWeight: '500', marginLeft: 4}}> Choose a folder</Text>
          </TouchableOpacity>
        </View> 

        <Modal visible={isChooseFolderModalVisible} transparent={true} onRequestClose={() => setIsChooseFolderModalVisible(false)} presentationStyle='overFullScreen'>
            <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPressOut={() => setIsChooseFolderModalVisible(false)}>
                <View style={styles.chooseFolderModal}>
                {collections.map((collectionName, index) => (
                  <TouchableOpacity key={index} style={[styles.mainButtons, styles.borderBottom,]} onPress={() => {setFolderID(collectionName[0]), setIsChooseFolderModalVisible(false)}}>
                    <Text style={styles.text}>{collectionName[1]}</Text>
                  </TouchableOpacity>)
                )}
                  <TouchableOpacity key='AddFolder' style={styles.mainButtons} onPress={() => setIsAddFolderModalVisible(true)}>
                    <Text style={styles.text}>Add Folder...</Text>
                  </TouchableOpacity>
                </View>
            </TouchableOpacity>
            <AddFolderModal isVisible={isAddFolderModalVisible} onClose={() => [setIsAddFolderModalVisible(false), fetchCollections()]} />
        </Modal>

 
        {folderID && title && note &&
          <TouchableOpacity style={styles.button} onPress={() => [saveNoteToFolder(folderID, title, note, { 'SelfManagement': selfManagement, 'SocialIntelligence': socialIntelligence, 'Innovation': innovation})]}>
            <Text style={{fontWeight: '500'}}>Save</Text>
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
    note: {
      justifyContent: 'center',
      textAlignVertical: 'top',
      margin: '5%',
      padding: '4%',
      paddingTop: '6%',
      fontSize: 20,
      borderWidth: 1,
      borderRadius: 14,
      borderColor: 'gray',
    },
    button: {
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
      justifyContent: 'space-between',
      padding: 10,
    },
    modalButton: {
      backgroundColor: '#8CD790',
      borderWidth: 1.5,
      borderColor: 'black',
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    chooseFolderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 5,
      padding: 6
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    chooseFolderModal: {
      borderWidth: 1.5,
      borderColor: '#000000',
      borderRadius: 10,
      backgroundColor: '#FFFFFF',
      width: 'auto', 
      height: 'auto', 
      position: 'absolute',
      bottom: '16%',
      left: '3%',
      maxWidth: 340
    },
    mainButtons: {
      padding: 10,
      textAlign: 'center',
      justifyContent: 'center',
      height: 45,
    },
    borderBottom: {
      borderBottomWidth: 1,
      borderColor: '#000000',
  },
    text: {
      marginLeft: 2,
      flexWrap: 'wrap',
      textAlign: 'center',
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
  skillTagModal: {
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    width: 'auto', 
    height: 'auto',
    position: 'absolute',
    right: '5%',
    alignItems: 'flex-start'
  },
  skillTagButton: {
    borderWidth: 1.5,
    borderColor: 'black',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8ABDE9',
    flexDirection: 'row', 
    width: 120,
    height: 60 
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