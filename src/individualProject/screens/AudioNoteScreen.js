import React, { useState, useEffect } from 'react'
import { Text, TouchableOpacity,  View, StyleSheet } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { auth } from "../firebase"
import { Audio } from 'expo-av'
import { Feather } from '@expo/vector-icons'
import Layout from '../components/Layout'
import { FontAwesome } from '@expo/vector-icons'


export default function AudioNoteScreen() {

    //variables for title of note, note content, audio playback and UI animation
    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [sound, setSound] = useState();
    const [playing, setPlaying] = useState(false);
    const [playingText, setPlayingText] = useState("Playing");


    
    // access use route functions, define parameters passed from previous screen
    const route = useRoute();
    const { noteName, folderName, skillTags } = route.params;

    // initialise firebase, and get current user
    const db = getFirestore();
    const currentUser = auth.currentUser;


    // get audio file from Firestore
    async function getUriFromDocument() {
        try {
            // document reference
            const docRef = doc(db, 'files', currentUser.email, 'folders', folderName, 'audioNotes', noteName); 
            const docSnap = await getDoc(docRef);
        
            // setting note data if doc exists
            if (docSnap.exists()) {
                const noteValue = docSnap.data().uri; 
                const titleValue = docSnap.data().title;
                setNote(noteValue);
                setTitle(titleValue);
            } 
        }
        catch (error) {
            console.error("Error retrieving sound:", error);
        }

    }

    // fetching note data
    useEffect(() => {
        getUriFromDocument();
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);


    // handle audio playback
    async function playSound() {
        if (sound) {
            await sound.unloadAsync();
            setSound(null);
        }
    
        try {
            // creating and playing sound
            const { sound: newSound } = await Audio.Sound.createAsync({ uri: note });
            setSound(newSound);
            setPlaying(true);
            await newSound.playAsync();
    
            // starting 'Playing' animation
            newSound.setOnPlaybackStatusUpdate(async (status) => {
                if (!status.isLoaded) {
                    setPlaying(false);
                } else if (status.didJustFinish) {
                    setPlaying(false);
                }
            });
        } catch (error) {
            console.error("Error playing sound:", error);
            setPlaying(false); 
        }
    }
    
    
    // unload sound when it changes 
    useEffect(() => {
    return sound
        ? () => {
            sound.unloadAsync(); 
        }
        : undefined;
    }, [sound]);

    // Playing animation
    const updatePlayingText = () => {
        setPlayingText(prev => {
          switch (prev) {
            case "Playing":
              return "Playing.";
            case "Playing.":
              return "Playing..";
            case "Playing..":
              return "Playing...";
            case "PLaying...":
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

    return(
        <View style={styles.container}>
            <Layout text={title} onDeleteNote={null}>

                {skillTags &&
                    <View style={styles.skillTagContainer}>
                        {skillTags['SelfManagement'] === true && 
                            <View style={styles.skillTag}>
                            <FontAwesome name="circle" size={32} color="#36627b" style={{marginRight: 4}} />
                            <Text style={styles.skillTagText}>Self Management</Text>
                            </View>
                        }
                        {skillTags['SocialIntelligence'] === true && 
                            <View style={styles.skillTag}>
                            <FontAwesome name="circle" size={32} color="#827390" style={{marginRight: 4}}/>
                            <Text style={styles.skillTagText}>Social Intelligence</Text>
                            </View>
                        }
                        {skillTags['Innovation'] === true && 
                            <View style={styles.skillTag}>
                            <FontAwesome name="circle" size={32} color="#83855c" style={{marginRight: 4}}/>
                            <Text style={styles.skillTagText}>Innovation</Text>
                            </View>
                        }
                    </View>
                }

                <View style={styles.playButtonContainer}>
                    <TouchableOpacity style={styles.playButton} onPress={() => {playSound(); setPlaying(true)}}>
                        <Feather name="play-circle" size={100} color="black" />
                    </TouchableOpacity>
                    {playing && <Text style={styles.playingText}>{playingText}</Text>}
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
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: '5%',
        marginTop: '17%',
    },
    skillTagContainer: {
        left: 2,
        height: 50,
        maxWidth: 350,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    skillTag: {
        flexDirection: 'row',
        marginLeft: 10,
        alignItems: 'center'
    },
    playButtonContainer: {
        flex: 1,
        alignItems: 'center',
        marginTop: 140
    },
    playingText: {
        fontSize: 24,
        color: 'olivedrab',
        fontStyle: 'italic',
        padding: 20
    },
    skillTagText: {
        fontSize: 16
    }
})
