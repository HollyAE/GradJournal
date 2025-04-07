import React, { useState } from "react"
import { useNavigation, useRoute } from '@react-navigation/native';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native'
import CustomButton from "../components/CustomButton"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase"


export default function LogInScreen() {
    // variables for user email, password and a firebase error message
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firebaseError, setFirebaseError] = useState('');

    // get access to navigation functions, initialise Firestore, get current user
    const navigation = useNavigation();
    const route = useRoute();
    const currentUser = auth.currentUser;



    // log in the user, checking for any errors with email, password etc
    const logIn = () => {
        signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            // if user is signing in to complete account deletion process then navigate back to profile once signed in
            if (route.params?.action === 'deleteAccount' && route.params?.from === 'Profile') {
                navigation.navigate('Profile', { recentLogin: true });
                // other wise navigate to home screen once signed in
            } else {
                navigation.navigate('Home');
            }
        })
        .catch(error => {
                let errorMessage = '';
                switch (error.code) {
                    case 'auth/invalid-email':
                    case 'auth/user-disabled':
                    case 'auth/user-not-found':
                        errorMessage = 'Invalid email or user not found.';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Incorrect password, please try again.';
                        break;
                    default:
                        errorMessage = 'An unexpected error occurred. Please try again.';
                        break;
                }
                setFirebaseError(errorMessage);
            });
    };

    return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <View style={styles.container}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Log in to GradJournal!</Text>
                </View>
      
                <TextInput
                  style={styles.input}
                  placeholder="Email address..."
                  placeholderTextColor="black"
                  onChangeText={setEmail}
                  value={email}
                />
      
                <TextInput
                  style={styles.input}
                  placeholder="Password..."
                  placeholderTextColor="black"
                  onChangeText={setPassword}
                  value={password}
                  secureTextEntry={true}
                />
      
                <CustomButton text="Log in" onPress={logIn} />
                {firebaseError ? (
                  <Text style={styles.errorText}>{firebaseError}</Text>
                ) : null}
      
                {currentUser === null && (
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={styles.signUpText}>
                            Don&apos;t have an account? Sign up here!
                        </Text>
                    </TouchableOpacity>)
                }

              </View>
            </TouchableWithoutFeedback>
      ); 
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E9EAEC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        margin: '5%',
    },
    title: {
        color: '#454545',
        fontSize: 24,
    },
    input: {
        height: 50,
        width: '80%',
        marginVertical: 10,
        borderWidth: 1,
        padding: 10,
        borderColor: 'gray',
        borderRadius: 5,
        backgroundColor: 'white',
    },
    errorText: {
        color: 'red',
    },
    signUpText: {
        color: '#0000FF',
        marginTop: 20,
        fontSize: 16
    }
});

