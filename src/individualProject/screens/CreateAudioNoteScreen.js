import React from 'react';
import { useState, useEffect } from 'react'
import { Text, View, StyleSheet, TextInput, Pressable, TouchableWithoutFeedback, Keyboard, Modal, TouchableOpacity, Platform } from 'react-native'
import { CheckBox } from '@rneui/themed'
import { doc, setDoc, getFirestore, collection, getDocs } from 'firebase/firestore'
import { Entypo } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { auth } from "../firebase"
import { Audio } from 'expo-av'
import AddFolderModal from '../components/AddFolderModal'
import { AntDesign } from '@expo/vector-icons'
import { Feather } from '@expo/vector-icons'
import { Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { MaterialCommunityIcons } from '@expo/vector-icons';




export default function CreateAudioNoteScreen(){

  // variables
  const [title, setTitle] = useState('');
  // recording and playing status
  const [recording, setRecording] = useState();
  const [playing, setPlaying] = useState(false);
  // user firebase info
  const [collections, setCollections] = useState([]);
  const [folderID, setFolderID] = useState('');
  // modal visibility
  const [isChooseFolderModalVisible, setIsChooseFolderModalVisible] = useState(false);
  const [isAddFolderModalVisible, setIsAddFolderModalVisible] = useState(false);
  const [isSkillTagModalVisible, setIsSkillTagModalVisible] = useState(false);
  // recording and playing text
  const [recordingText, setRecordingText] = useState("Recording");
  const [playingText, setPlayingText] = useState("Playing");
  // audio URI and sound object
  const [audioURI, setAudioURI] = useState(null);
  const [sound, setSound] = useState();
  // save note alert
  const [saveAlert, setSaveAlert] = useState(false)
  // skill tags
  const [selfManagement, setSelfManagement] = useState(false);
  const [socialIntelligence, setSocialIntelligence] = useState(false);
  const [innovation, setInnovation] = useState(false);
  // animation state
  const [scaleAnim] = useState(new Animated.Value(1));

  // access navigation functions, initialise Firestore, get current user
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

  // start recording audio 
  async function startRecording() {
    try {
      // get permission to record with mic
      await Audio.requestPermissionsAsync(); 
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      }); 
      // set quality of recording
      const { recording } = await Audio.Recording.createAsync(
         Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      // start recording
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  // stop recording 
  async function stopRecording() {
    // reset recording state
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI(); 
    setAudioURI(uri);
  }

  // play sound
  async function playSound() {
    if (sound) {
        await sound.unloadAsync();
        setSound(null);
    }

    try {
        // load sound from URI 
        const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioURI });
        setSound(newSound);
        setPlaying(true);
        // play sound
        await newSound.playAsync();

        // update playing state
        newSound.setOnPlaybackStatusUpdate((status) => {
            if (!status.isLoaded) {
                setPlaying(false);
            } else if (status.didJustFinish) {
                // stop when audio stops
                setPlaying(false);
            }
        });
    } catch (error) {
        console.error("Error playing sound:", error);
        setPlaying(false);
    }
  }

  // cleanup effect for sound object
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync(); 
        }
      : undefined;
  }, [sound]);


  // upload audio to Firebase storage
  const uploadAudioToStorage = async (audioURI) => {
    const storage = getStorage();
    const storageRef = ref(storage, `audioNotes/${currentUser.email}/${folderID}/${title}`);
  
    // fetch audio convert to blob for uploading
    const response = await fetch(audioURI);
    const blob = await response.blob();
  
    const metadata = {
      contentType: 'audio/mpeg', 
    };
  
    // upload to firebase storage
    const snapshot = await uploadBytes(storageRef, blob, metadata);

    // return URL to firebase storage location
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };
  

  // save note to Firestore
  const saveNoteToFolder = async (folderID, noteTitle, audioURL, skillTag) => {
    try {
      const locationRef = collection(db, 'files', currentUser.email, 'folders', folderID, 'audioNotes');
      const audioNoteRef = doc(locationRef);
      // note data
      const audioNoteData = {
        title: noteTitle,
        uri: audioURL,
        skillTag: skillTag,
      };
      // save note
      await setDoc(audioNoteRef, audioNoteData);
      setSaveAlert(true); 
      console.log("Note saved successfully");

      setTimeout(() => {
        navigation.goBack();
      }, 2000);
  
    } catch (error) {
      console.error("Error saving audio note:", error);
    }
  };

  // handle note saving
  const handleSaveNote = async () => {
      try {
        const audioURL = await uploadAudioToStorage(audioURI, title);
        
        await saveNoteToFolder(folderID, title, audioURL, {'SelfManagement': selfManagement, 'SocialIntelligence': socialIntelligence, 'Innovation': innovation});
      } catch (error) {
        console.error("Error in saving audio note:", error);
      }
  };
  


  // animation for pressing microphone button and play button
  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
  }

  // text for animation for recording feedback
  const updateRecordingText = () => {
    setRecordingText(prev => {
      switch (prev) {
        case "Recording":
          return "Recording.";
        case "Recording.":
          return "Recording..";
        case "Recording..":
          return "Recording...";
        case "Recording...":
        default:
          return "Recording";
      }
    });
  };
  
  // create an interval when playing 'Recording' animation
  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(updateRecordingText, 500); 
    }
    return () => clearInterval(interval);
  }, [recording]);
  

  // text for animation for playing feedback
  const updatePlayingText = () => {
    setPlayingText(prev => {
      switch (prev) {
        case "Playing":
          return "Playing.";
        case "Playing.":
          return "Playing..";
        case "Playing..":
          return "Playing...";
        case "Playing...":
        default:
          return "Playing";
      }
    });
  };
  
  // create an interval when playing 'Playing' animation
  useEffect(() => {
    let interval;
    if (playing) {
      interval = setInterval(updatePlayingText, 500); 
    }
    return () => clearInterval(interval);
  }, [playing]);
  

  return (
    <TouchableWithoutFeedback  onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}> 

          { saveAlert && (
              <View style={styles.alertContainer}>
                <View style={styles.alert}>
                  <Feather name="check-circle" size={24} color="black" />
                  <Text style={{fontWeight: 'bold', marginLeft: 4}}>Note saved successfully!</Text>
                </View>
              </View>
              )
            }

          {!recording && 
            <View style={styles.titleContainer}>
              <View>
                <TextInput style={styles.title} onChangeText={setTitle} value={title}  multiline maxLength={75} placeholder="Title..."/>
              </View>

              <View>
                <Pressable onPress={() => navigation.goBack()}>
                  <Entypo name="cross" size={32} color="black" />
                </Pressable>
              </View>
            </View>
          }

          {!recording && 
            <View>
              <View style={{  alignItems: 'flex-end', right: '5%' }}>
                <TouchableOpacity onPress={() => setIsSkillTagModalVisible(true)} style={[styles.skillTagButton]}>
                  <MaterialCommunityIcons name="head-cog-outline" size={28} color="black" />
                  <Text style={{fontWeight: '500', marginLeft: 4}}>Tag skill...</Text>
                </TouchableOpacity>
              </View>


              <Modal visible={isSkillTagModalVisible} transparent={true} onRequestClose={() => setIsSkillTagModalVisible(false)} presentationStyle='overFullScreen'>
                <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPressOut={() => setIsSkillTagModalVisible(false)}>
                  <View style={[styles.skillTagModal, { top: Platform.OS === 'android' ? '20%' : '25%' }]}>
                    <CheckBox center title="Self Management" titleProps={{ style: { color: '#36627b', fontWeight: 'bold' } }} checkedIcon="dot-circle-o" uncheckedIcon="circle-o" checked={selfManagement} onPress={() => setSelfManagement(!selfManagement)} />
                    <CheckBox center title="Social Intelligence" titleProps={{ style: { color: '#827390', fontWeight: 'bold' } }} checkedIcon="dot-circle-o" uncheckedIcon="circle-o" checked={socialIntelligence} onPress={() => setSocialIntelligence(!socialIntelligence)} />
                    <CheckBox center title="Innovation" titleProps={{ style: { color: '#83855c', fontWeight: 'bold' } }} checkedIcon="dot-circle-o" uncheckedIcon="circle-o" checked={innovation} onPress={() => setInnovation(!innovation)} />
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>
          }

          

          <View style={styles.micContainer}>
            <Pressable style={styles.micButton} onPress={() => { recording ? stopRecording() : startRecording(); animatePress(); }}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons name="mic-circle" size={230} color="red" />
              </Animated.View>
            </Pressable>

            {recording && <Text style={styles.recordingText}>{recordingText}</Text>}


            {audioURI && !recording && (
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <TouchableOpacity style={styles.playButton} onPress={() => {playSound(); setPlaying(true)}}>
                  <Feather name="play-circle" size={100} color="black" />
                </TouchableOpacity>
                {playing && <Text style={styles.playingText}>{playingText}</Text>}
              </View>
            )}
          </View>
          


          {!recording && 
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
                      <TouchableOpacity key={index} style={[styles.mainButtons, styles.borderBottom]} onPress={() => {setFolderID(collectionName[0]), setIsChooseFolderModalVisible(false)}}>
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


            {audioURI && title && folderID &&
              <TouchableOpacity style={styles.button} onPress={handleSaveNote}>
                <Text style={{fontWeight: '500'}}>Save</Text>
              </TouchableOpacity>
            }
            
          </View>
          }
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
      height: 70,
      borderBottomWidth: 1
    },
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      margin: '5%',
      marginTop: '17%',
    },
    micContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 180
    },
    buttonsContainer: {
      bottom: 60,
      position: 'absolute',
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 10,
    },
    button: {
      justifyContent: 'space-between',
      paddingHorizontal: 28,
      paddingVertical: 24,
      backgroundColor: '#8ABDE9',
      borderRadius: 10,
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
    micButton: {
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 19
    },
    recordingText: {
      fontSize: 24,
      color: 'red',
      fontStyle: 'italic',
      padding: 20
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
      top: '25%',
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
    },
    playingText: {
      fontSize: 24,
      color: 'olivedrab',
      fontStyle: 'italic',
      padding: 20
  },
  });