import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { auth, storage } from "../firebase"
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert, Platform } from 'react-native'
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { deleteObject, ref } from "firebase/storage";
import Layout from '../components/Layout'
import { AntDesign } from '@expo/vector-icons'
import { FontAwesome5 } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { CheckBox } from '@rneui/themed'
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';


export default function DirectoriesScreen() { 

  // variables
  // current selected folder
  const [currentFolder, setCurrentFolder] = useState('');
  // storing folder, audionotes, and writtennotes from the Firestore
  const [folders, setFolders] = useState([]);
  const [audioNotes, setAudioNotes] = useState([]);
  const [writtenNotes, setWrittenNotes] = useState([]);
  // storing the written and audio notes when a filter has been applied
  const [filteredWrittenNotes, setFilteredWrittenNotes] = useState([]);
  const [filteredAudioNotes, setFilteredAudioNotes] = useState([]);
  // modal visibility
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  // for if screen is loading
  const [isLoading, setIsLoading] = useState(false);
  // for when a new folder is added and folders need to be fetched again
  const [folderUpdateTrigger, setFolderUpdateTrigger] = useState(0);
  // when filtered skills have been applied
  const [selectedSkillTags, setSelectedSkillTags] = useState({
    SelfManagement: false,
    SocialIntelligence: false,
    Innovation: false
  });

  // get access to navigation functions, initialise Firestore, get current user
  const navigation = useNavigation();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  
  // fetch folders from Firestore
  const fetchFolders = async () => {
    try {
      const filesRef = collection(db, 'files', currentUser.email, 'folders');
      const querySnapshot = await getDocs(filesRef);
      const folders = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        const folderTuple = [doc.id, docData.title]
        folders.push(folderTuple); 
      });
      folders.sort((a, b) => a[1].localeCompare(b[1]));
      setFolders(folders);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  // fetch folders on when folderupdate variable is triggered
  useEffect(() => {
    fetchFolders();
  }, [folderUpdateTrigger]);

  // fetch notes from Firestore
  const fetchNotes = async (folder, fileType) => {
    setIsLoading(true);
    const notes = [];
    try {
      // fetch audio notes first then written notes, to display in order and avoid confusion with notes of same name
      const filesRef = collection(db, 'files', currentUser.email, 'folders', folder, fileType );
      const querySnapshot = await getDocs(filesRef);
      const audioNotes = [];
      const writtenNotes = [];
      if (fileType === 'audioNotes'){
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          const noteTuple = [doc.id, docData.title, docData.skillTag]
          audioNotes.push(noteTuple); 
        });
        audioNotes.sort((a, b) => a[1].localeCompare(b[1]));
        notes.push(audioNotes);
        setAudioNotes(audioNotes);
      }
      else {
        querySnapshot.forEach((doc) => {
          const docData = doc.data(); 
          const noteTuple = [doc.id, docData.title, docData.skillTag]
          writtenNotes.push(noteTuple); 
        });
        writtenNotes.sort((a, b) => a[1].localeCompare(b[1]));
        notes.push(writtenNotes);
        setWrittenNotes(writtenNotes);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
    setIsLoading(false);
    return notes;
  };

  // show notes with the selected skill tag filter
  const applyFilter = () => {
    const filterNotes = (notes) => {
      return notes.filter(note =>
        Object.keys(selectedSkillTags).some(skill => selectedSkillTags[skill] && note[2][skill])
      );
    };
  
    const filteredAudioNotes = filterNotes(audioNotes);
    const filteredWrittenNotes = filterNotes(writtenNotes);
  
    setFilteredAudioNotes(filteredAudioNotes);
    setFilteredWrittenNotes(filteredWrittenNotes);
  
    setIsFilterModalVisible(false);
  };
  

  // toggle buttons selected filtered notes
  const toggleSkillTag = (skill) => {
    setSelectedSkillTags(prevState => ({ ...prevState, [skill]: !prevState[skill] }));
  };

  // deleting a folder from the Firestore
  const deleteFolder = async () => {
    setIsLoading(true);
    try{
          // delete all audio notes then all written notes from the Firestore
          const writtenNotesRef = collection(db, 'files', currentUser.email, 'folders', currentFolder, 'writtenNotes');
          const writtenNotesSnapshot = await getDocs(writtenNotesRef);
          for (const noteDoc of writtenNotesSnapshot.docs) {
            await deleteDoc(doc(db, 'files', currentUser.email, 'folders', currentFolder, 'writtenNotes', noteDoc.id));
          }
  
          const audioNotesRef = collection(db, 'files', currentUser.email, 'folders', currentFolder, 'audioNotes');
          const audioNotesSnapshot = await getDocs(audioNotesRef);
          for (const noteDoc of audioNotesSnapshot.docs) {
            const audioNoteData = noteDoc.data();
            if (audioNoteData.uri) {
              const fileRef = ref(storage, audioNoteData.uri);
              await deleteObject(fileRef).catch((error) => {
                console.error("Error deleting audio file from storage:", error);
              });
            }
            await deleteDoc(doc(db, 'files', currentUser.email, 'folders', currentFolder, 'audioNotes', noteDoc.id));
          }
  
          await deleteDoc(doc(db, 'files', currentUser.email, 'folders', currentFolder));
    } catch (error) {
        console.error("Error handling folder deletion:", error);
    }
    setIsLoading(false);
}

  // when delete folder button is pressed
  const onDeleteFolder = async () => {
    // if not in folder set alert
    if (!currentFolder) {
      console.log("No folder selected");
      Alert.alert('You are not currently in a folder', 'You can only delete a folder from within the selected folder.', [
        {text: 'OK', onPress: null}
      ])
      return;
    }
  
    try {
      // otherwise delete the folder and reset current folder to empty string and fetch the folders again
      await deleteFolder(currentFolder); 
      setCurrentFolder(''); 
      fetchFolders();
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  // fetch the notes for the folder which will be exported
  const fetchNotesForCSV = async (currentFolder) => {
    setIsLoading(true);
    try {
      const notes = [];
      const folderName = currentFolder
      
      const writtenFilesRef = collection(db, 'files', currentUser.email, 'folders', folderName, 'writtenNotes');
      const writtenQuerySnapshot = await getDocs(writtenFilesRef);
      writtenQuerySnapshot.forEach((doc) => {
        const docData = doc.data();
        const noteArray = ['Text', doc.id, docData.title, docData.note, docData.skillTag];
        notes.push(noteArray);
      });

      const audioFilesRef = collection(db, 'files', currentUser.email, 'folders', folderName, 'audioNotes');
      const audioQuerySnapshot = await getDocs(audioFilesRef);
      audioQuerySnapshot.forEach((doc) => {
        const docData = doc.data();
        const noteArray = ['Audio', doc.id, docData.title, '', docData.skillTag]; 
        notes.push(noteArray);
      });

      setIsLoading(false);
      return notes;
      
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  // convert the notes to csv string
  const convertToCSV = (notes) => {
    let csv = 'Type,ID,Title,Content,Innovation,Self-Management,Social-Intelligence\n';
  
    notes.forEach(note => {
      let [type, id, title, content, skillTag] = note;
    
      const orderedSkills = ['Innovation', 'SelfManagement', 'SocialIntelligence'];
      let skillTagsCSV = orderedSkills.map(skill => {
        const value = skillTag && skillTag[skill] === true ? 'Yes' : 'No';
        return value; 
      }).join(','); 
  
      csv += `"${type}","${id}","${title}","${content}",${skillTagsCSV}\n`; 
    });
  
    return csv;
  };
  
  

  // export csv string to csv file and bring up sharing mechanism
  const exportCSV = async (csvString) => {
    const folderTuple = folders.find(folder => folder[0] === currentFolder);
    const folderTitle = folderTuple ? folderTuple[1] : 'UnknownFolder';
    const fileName = `${FileSystem.documentDirectory}${folderTitle}_Notes.csv`;
    await FileSystem.writeAsStringAsync(fileName, csvString, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(fileName);
  };

  // handle export folder button being pressed
  const handleExportFolder = async () => {
    if (!currentFolder) {
      Alert.alert('You are not currently in a folder', 'You can only export a folder from within the selected folder.', [
        {text: 'OK', onPress: null}
      ])
      return;
    }
    else { 
      const notes = await fetchNotesForCSV(currentFolder); 
      const csvString = convertToCSV(notes); 
      await exportCSV(csvString); 
    }
  };

  // update folderupdate variable to trigger fetching folders again when new folder is added
  const handleFolderAdded = async () => {
    setFolderUpdateTrigger(prev => prev + 1);
  };

  return ( 
    <View style={styles.container}> 
      {isLoading && (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
          </View>
      )}

      <Layout text={'Folders'} addFolderFunction={handleFolderAdded} onDeleteFolder={onDeleteFolder} onExportFolder={handleExportFolder}>
        {(folders.length !== 0) && (currentFolder === '') &&
            <ScrollView style={{maxHeight: 550}}>
              <View>
                {folders.map((folderName) => (
                  <TouchableOpacity style={styles.button} key={folderName[0]} onPress={() => {setCurrentFolder(folderName[0]); fetchNotes(folderName[0], 'audioNotes'); fetchNotes(folderName[0], 'writtenNotes')}} >
                    <View style={{maxWidth: 240}}>
                      <Text style={styles.text}>{folderName[1]}</Text>
                    </View>
                    <AntDesign name='folderopen' size={28} color='black' />
                  </TouchableOpacity>)
                )}
              </View>
            </ScrollView>
        }

        {(currentFolder !== '') &&
          <View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View>
                <TouchableOpacity style={styles.backButton} onPress={() => {setCurrentFolder('')}}>
                  <AntDesign name="back" size={32} color="black" />
                </TouchableOpacity>
              </View>

              <View>
                <TouchableOpacity style={[styles.filterButton, {marginRight: '5%'}]} onPress={() => setIsFilterModalVisible(true)}>
                  <Text style={{fontWeight: '500'}}> Filter Notes</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            
            <Modal visible={isFilterModalVisible} transparent={true} onRequestClose={() => setIsFilterModalVisible(false)} presentationStyle='overFullScreen' >
              <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPressOut={() => setIsFilterModalVisible(false)}>
                <View style={[styles.filterModal, { top: Platform.OS === 'android' ? '19%' : '24%' }]}>
                  <CheckBox center title="Self Management" titleProps={{ style: { color: '#36627b', fontWeight: 800 } }} checkedIcon="dot-circle-o" uncheckedIcon="circle-o" checked={selectedSkillTags.SelfManagement} onPress={() => toggleSkillTag('SelfManagement')} />
                  <CheckBox center title="Social Intelligence" titleProps={{ style: { color: '#827390', fontWeight: 800 } }} checkedIcon="dot-circle-o" uncheckedIcon="circle-o" checked={selectedSkillTags.SocialIntelligence} onPress={() => toggleSkillTag('SocialIntelligence')} />
                  <CheckBox center title="Innovation" titleProps={{ style: { color: '#83855c', fontWeight: 800 } }} checkedIcon="dot-circle-o" uncheckedIcon="circle-o" checked={selectedSkillTags.Innovation} onPress={() => toggleSkillTag('Innovation')} />
                  <TouchableOpacity  style={[styles.filterButton, {height: 40, width: 110, bottom: 4, alignSelf: 'center', borderWidth: 0}]} onPress={applyFilter}>
                    <Text>Apply Filter</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>

            <ScrollView style={{maxHeight:490}}>
              <View>
                {Object.values(selectedSkillTags).some(value => value) ?
                <>
                  {filteredAudioNotes.map((note, index) => (
                    <TouchableOpacity style={styles.button} key={index} onPress={() => {navigation.navigate('AudioNote', {noteName: note[0], folderName: currentFolder, skillTags: note[2]})}} >
                      <View style={{maxWidth: 240}}>
                        <Text style={styles.text}>{note[1]}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          {
                            note[2]['SelfManagement'] === true && 
                            <FontAwesome name="circle" size={24} color="#36627b" style={{marginRight: 4}} />
                          }
                          {
                            note[2]['SocialIntelligence'] === true && 
                            <FontAwesome name="circle" size={24} color="#827390" style={{marginRight: 4}}/>
                          }
                          {
                            note[2]['Innovation'] === true && 
                            <FontAwesome name="circle" size={24} color="#83855c" style={{marginRight: 4}}/>
                          }
                          <FontAwesome5 name="file-audio" size={32} color="black" />                  
                        </View>
                    </TouchableOpacity>)
                  )} 
                  {filteredWrittenNotes.map((note, index) => (
                    <TouchableOpacity style={styles.button} key={index} onPress={() => {navigation.navigate('TextNote', {noteName: note[0], folderName: currentFolder, skillTags: note[2]})}} >
                      <View style={{maxWidth: 240}}>
                        <Text style={styles.text}>{note[1]}</Text>
                      </View>
  
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          {
                            note[2]['SelfManagement'] === true && 
                            <FontAwesome name="circle" size={24} color="#36627b" style={{marginRight: 4}} />
                          }
                          {
                            note[2]['SocialIntelligence'] === true && 
                            <FontAwesome name="circle" size={24} color="#827390" style={{marginRight: 4}}/>
                          }
                          {
                            note[2]['Innovation'] === true && 
                            <FontAwesome name="circle" size={24} color="#83855c" style={{marginRight: 4}}/>
                          }
                          <FontAwesome5 name="file-alt" size={32} color="black" />
                        </View>
                      
                    </TouchableOpacity>)
                  )}
                  </>
                  :
                  <>
                  {audioNotes.map((note, index) => (
                  <TouchableOpacity style={styles.button} key={index} onPress={() => {navigation.navigate('AudioNote', {noteName: note[0], folderName: currentFolder, skillTags: note[2]})}} >
                    <View style={{maxWidth: 240}}>
                      <Text style={styles.text}>{note[1]}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {
                          note[2]['SelfManagement'] === true && 
                          <FontAwesome name="circle" size={24} color="#36627b" style={{marginRight: 4}} />
                        }
                        {
                          note[2]['SocialIntelligence'] === true && 
                          <FontAwesome name="circle" size={24} color="#827390" style={{marginRight: 4}}/>
                        }
                        {
                          note[2]['Innovation'] === true && 
                          <FontAwesome name="circle" size={24} color="#83855c" style={{marginRight: 4}}/>
                        }
                        <FontAwesome5 name="file-audio" size={32} color="black" />                  
                      </View>
                  </TouchableOpacity>)
                )}
                {writtenNotes.map((note, index) => (
                  <TouchableOpacity style={styles.button} key={index} onPress={() => {navigation.navigate('TextNote', {noteName: note[0], folderName: currentFolder, skillTags: note[2]})}} >
                    <View style={{maxWidth: 240}}>
                      <Text style={styles.text}>{note[1]}</Text>
                    </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {
                          note[2]['SelfManagement'] === true && 
                          <FontAwesome name="circle" size={24} color="#36627b" style={{marginRight: 4}} />
                        }
                        {
                          note[2]['SocialIntelligence'] === true && 
                          <FontAwesome name="circle" size={24} color="#827390" style={{marginRight: 4}}/>
                        }
                        {
                          note[2]['Innovation'] === true && 
                          <FontAwesome name="circle" size={24} color="#83855c" style={{marginRight: 4}}/>
                        }
                        <FontAwesome5 name="file-alt" size={32} color="black" />
                      </View>
                    
                  </TouchableOpacity>)
                )}
                </>
                }
                
              </View>
            </ScrollView>
          </View>
        }
      </Layout>
    </View> 
  );
}

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#E9EAEC',
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
    backButton: {
      left: 12
    },
    text: {
      fontSize: 24,
      marginLeft: 4
    },
    filterModal: {
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
    filterButton: {
      borderWidth: 1.5,
      borderColor: 'black',
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#8ABDE9',
      flexDirection: 'row', 
      width: 120,
      height: 60,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.7)', 
      zIndex: 1000,
  },
  });