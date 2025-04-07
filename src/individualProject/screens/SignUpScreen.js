import React, { useState, useCallback} from "react"
import { useNavigation } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native'
import CustomButton from "../components/CustomButton"
import { Text, View, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native'
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth, firestore } from "../firebase"
import { doc, setDoc } from "firebase/firestore"



export default function SignUpScreen() {
    // variables
    // username, user email, user password, confirmed user password, password error message
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    // firebase error message 
    const [firebaseError, setFirebaseError] = useState('');
    const [formKey, setFormKey] = useState(Date.now());

    // access navigation functions
    const navigation = useNavigation();


    // check password is valid
    const validatePassword = (password) => {
        let error = '';
        if (password.length < 6) {
            error = 'Password must be at least 6 characters long.';
        } else if (!/[A-Z]/.test(password)) {
            error = 'Password must contain at least one uppercase letter.';
        } else if (!/\d/.test(password)) {
            error = 'Password must contain at least one number.';
        }
        return error;
    };

    // sign up user with info provided
    const signUp = () => {
        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match.');
            return;
        }
        setConfirmPasswordError('');

        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                await updateProfile(userCredential.user, {
                    displayName: username
                });
                return setDoc(doc(firestore, "users", userCredential.user.email), {
                    name: username,
                    email: email,
                });
            })
            .then(() => {
                navigation.navigate('Home');
            })
            .catch((error) => {
                let errorMessage = '';
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email format.';
                        break;
                    case 'auth/email-already-in-use':
                        errorMessage = 'Email already in use, try logging in.';
                        break;
                    default:
                        errorMessage = 'An unexpected error occurred. Please try again.';
                        break;
                }
                setFirebaseError(errorMessage);
            });
    };
    
    // reset fields when screen is navigated to 
    useFocusEffect(
        useCallback(() => {
            setUsername('');
            setEmail('');
            setPassword('');
            setPasswordError('');
            setFirebaseError('');
            setFormKey(Date.now())
        }, [])
    );

    // handle password changing, to display correct error message
    const handlePasswordChange = (password) => {
        setPassword(password);
        setPasswordError(validatePassword(password));
        if (confirmPasswordError) setConfirmPasswordError('');
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
           <View key ={formKey} style={styles.container}>
                <View style={styles.titleContainer}>
                    <View style={styles.titleBoxes}>
                        <Text style={[styles.title, {fontSize: 32, marginBottom: 4}]}>Welcome to GradJournal!</Text>
                        <Text style={styles.infoText}>GradJournal is a note taking app designed to help students with reflecting on their meta-skills development.</Text>
                    </View>
                    <View style={styles.titleBoxes}>
                        <Text style={styles.title}>Sign up to start taking notes!</Text>
                    </View>
                </View>
                
                <TextInput testID="nameInput" style={styles.input} placeholder="Name..." placeholderTextColor="black" onChangeText={setUsername} />

                <TextInput style={styles.input} placeholder="Email address..." placeholderTextColor="black" onChangeText={setEmail}  />

                <TextInput style={styles.input} placeholder="Password..." placeholderTextColor="black" onChangeText={handlePasswordChange} onFocus={() => confirmPasswordError && setConfirmPasswordError('')} secureTextEntry={true}/>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                <TextInput style={styles.input} placeholder="Confirm Password..." placeholderTextColor="black" onChangeText={setConfirmPassword} onFocus={() => confirmPasswordError && setConfirmPasswordError('')} secureTextEntry={true}/>                
                {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}


                <CustomButton text='Sign up' onPress={signUp} disabled={!!passwordError} />
                {firebaseError ? <Text style={styles.errorText}>{firebaseError}</Text> : null}
            
            
                <TouchableOpacity onPress={() => navigation.navigate('LogIn')}>
                    <Text style={styles.logInText}>Already have an account? Login here!</Text>
                </TouchableOpacity>
                
            </View>
        </TouchableWithoutFeedback>
        
    )
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
        alignItems: 'center',
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
    logInText: {
        color: '#0000FF',
        marginTop: 20,
        fontSize: 16
    },
    infoText: {
        textAlign: 'center',
        fontSize: 15
    },
    titleBoxes: {
        alignItems: 'center',
        paddingVertical: 12
    }
  });

