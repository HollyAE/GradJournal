import React, { useState, useEffect} from 'react';
import { useNavigation, useRoute } from '@react-navigation/native'
import { Text, View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Layout from '../components/Layout';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { getStorage, deleteObject, ref } from "firebase/storage";
import { deleteUser } from "firebase/auth";
import { auth } from "../firebase"
import CustomButton from '../components/CustomButton';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';


export default function ProfileScreen(){

  // variable for is screen is loading
  const [isLoading, setIsLoading] = useState(false);

  // get access to navigation functions, initialise Firestore, get current user, get route and initialise storage
  const navigation = useNavigation();
  const db = getFirestore();
  const currentUser = auth.currentUser;
  const route = useRoute();
  const storage = getStorage();


  // fetch notes from Firestore
  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      // fetch written notes then audio notes
      const notes = [];
      const foldersRef = collection(db, 'files', currentUser.email, 'folders');
      const foldersSnapshot = await getDocs(foldersRef);
  
      for (const folderDoc of foldersSnapshot.docs) {
        const folderName = folderDoc.id; 
        
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
      }
      setIsLoading(false);
  
      return notes;
      
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
    setIsLoading(false);
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
    const fileName = `${FileSystem.documentDirectory}Compiled_Notes.csv`;
    await FileSystem.writeAsStringAsync(fileName, csvString, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(fileName);
  };

  // handle exporting notes button being pressed
  const handleExportNotes = async () => {
    const notes = await fetchNotes(); 
    const csvString = convertToCSV(notes); 
    await exportCSV(csvString); 
  };

  // alert for deleting account
  const deleteAccountAlert = () =>
  Alert.alert('Are you sure you want to delete your account?', 'This will delete all of your notes, folders and reminders. If you wish to continue, for security reasons, you may have to log in again.', [
    {
      text: 'Cancel',
      onPress: null,
      style: 'cancel',
    },
    {text: 'OK', onPress: () => navigation.navigate('LogIn', { action: 'deleteAccount', from: 'Profile' })}
  ]);

  // delete the users account
  const deleteUserAccount = async () => {  
    setIsLoading(true);
    try {
      // delete all their notes 
      const foldersRef = collection(db, 'files', currentUser.email, 'folders');
      const foldersSnapshot = await getDocs(foldersRef);

      for (const folderDoc of foldersSnapshot.docs) {
        const folderId = folderDoc.id;

        const writtenNotesRef = collection(db, 'files', currentUser.email, 'folders', folderId, 'writtenNotes');
        const writtenNotesSnapshot = await getDocs(writtenNotesRef);
        for (const noteDoc of writtenNotesSnapshot.docs) {
          await deleteDoc(doc(db, 'files', currentUser.email, 'folders', folderId, 'writtenNotes', noteDoc.id));
        }

        const audioNotesRef = collection(db, 'files', currentUser.email, 'folders', folderId, 'audioNotes');
        const audioNotesSnapshot = await getDocs(audioNotesRef);
        for (const noteDoc of audioNotesSnapshot.docs) {
          const audioNoteData = noteDoc.data();
          if (audioNoteData.uri) {
            const fileRef = ref(storage, audioNoteData.uri);
            await deleteObject(fileRef).catch((error) => {
              console.error("Error deleting audio file from storage:", error);
            });
          }
          await deleteDoc(doc(db, 'files', currentUser.email, 'folders', folderId, 'audioNotes', noteDoc.id));
        }

        await deleteDoc(doc(db, 'files', currentUser.email, 'folders', folderId));
      }


      // delete their reminders
      const userRemindersRef = collection(db, 'reminders', currentUser.email, 'userReminders');
      const remindersSnapshot = await getDocs(userRemindersRef);
      for (const reminderDoc of remindersSnapshot.docs) {
        const reminderId = reminderDoc.id;
        await deleteDoc(doc(db, 'reminders', currentUser.email, 'userReminders', reminderId));
      }

      // delete their user info in Firestore
      const userRef = doc(db, 'users', currentUser.email);
      await deleteDoc(userRef);
      setIsLoading(false);




      // delete their user authentication with Firebase Authentication
      await deleteUser(currentUser).then(() => {
        console.log("User account deleted successfully.");
        Alert.alert("Account Deleted", "Your account has been successfully deleted.", [{
          text: "OK", onPress: () => navigation.navigate('SignUp')
        }]);
      }).catch((error) => { 
        console.error("Error deleting user account:", error);
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Error handling user data deletion:", error);
      setIsLoading(false);
    }
  };
  
  // check if user needs to login again before deleting account
  useEffect(() => {
    if (route.params?.recentLogin) {
        deleteUserAccount();
    }
  }, [route.params?.recentLogin]);

  return (
      <View style={styles.container}> 
          {isLoading && (
              <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" />
              </View>
          )}
          <Layout text={'Profile'}>
          
              <View>
                <Text style={styles.welcomeText}>Hi {currentUser.displayName}!</Text>

                <CustomButton passwordIcon={true} text='Change Your Password' onPress={() => {navigation.navigate('ChangePassword')}}/>

                <CustomButton exportIcon={true} text='Export Notes'onPress={() => {handleExportNotes()}}/>

                <CustomButton deleteUserIcon={true} text='Delete Account' onPress={() => {deleteAccountAlert()}}/>
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
    welcomeText: {
      fontSize: 20,
      alignSelf: 'center'
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