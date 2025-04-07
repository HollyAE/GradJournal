import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { auth } from "../firebase"
import { FontAwesome } from '@expo/vector-icons'
import Layout from '../components/Layout'


export default function TextNoteScreen() {

    // variables for note title and note content
    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    // if loading should be shown
    const [isLoading] = useState(false);

    // access route and get params from previous screen
    const route = useRoute();
    const { noteName, folderName, skillTags } = route.params;
    // initialise Firestore and get current user 
    const db = getFirestore();
    const currentUser = auth.currentUser;


    // fetch note from Firestore
    async function getNoteFromDocument() {
        const docRef = doc(db, 'files', currentUser.email, 'folders', folderName, 'writtenNotes', noteName); 
        const docSnap = await getDoc(docRef);
    
        if (docSnap.exists()) {
            const noteValue = docSnap.data().note; 
            const titleValue = docSnap.data().title;
            setNote(noteValue);
            setTitle(titleValue);
        } 
    }

    // on component mount fetch the note from Firestore
    useEffect(() => {
        getNoteFromDocument();
      }, []);


    return(
        <View style={styles.container}>
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                </View>
            )}

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


                <ScrollView>
                    <Text style={styles.note}>{note}</Text>
                </ScrollView>

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
    note: {
        justifyContent: 'center',
        margin: '5%',
        padding: '4%',
        paddingTop: '6%',
        fontSize: 20,
        borderWidth: 1,
        borderRadius: 14,
        borderColor: 'gray',
        height: 480
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
    skillTagText: {
        fontSize: 16
    }
})
