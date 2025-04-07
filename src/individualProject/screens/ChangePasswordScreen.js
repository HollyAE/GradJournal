import React, { useState } from "react";
import { useNavigation } from '@react-navigation/native'
import { View, StyleSheet, TextInput, Text, TouchableWithoutFeedback, Keyboard, Alert, TouchableOpacity } from 'react-native';
import CustomButton from "../components/CustomButton";
import { updatePassword } from "firebase/auth";
import { auth } from "../firebase";
import { Entypo } from '@expo/vector-icons'


export default function ChangePasswordScreen() {
    // variables for new password, confirming password, firebase error
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firebaseError, setFirebaseError] = useState('');

    // accessing navigation functions 
    const navigation = useNavigation();

    // change user password
    const changeUserPassword = (newPassword) => {
        const currentUser = auth.currentUser; 

        // update the password
        updatePassword(currentUser, newPassword).then(() => {
            Alert.alert("Password updated", "You have successfully updated your password.", [{
                text: "OK", onPress: () => navigation.goBack()
            }]);
        }).catch((error) => {
            setFirebaseError(error.message || 'Failed to update password. Please try again.');
        });
    };


    // handle submitting changing user password
    const handleSubmit = () => {
        if (newPassword !== confirmPassword) {
            setFirebaseError("Passwords do not match.");
            return;
        }
        changeUserPassword(newPassword);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.cross} onPress={() => {navigation.goBack()}}>
                    <Entypo name="cross" size={32} color="black" />
                </TouchableOpacity>

                <View style={styles.content}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Change Your Password</Text>
                    </View>

                    <TextInput style={styles.input} placeholder="New Password..." placeholderTextColor="black" onChangeText={setNewPassword} value={newPassword} secureTextEntry={true} />

                    <TextInput style={styles.input}  placeholder="Confirm New Password..."  placeholderTextColor="black"  onChangeText={setConfirmPassword}  value={confirmPassword} secureTextEntry={true} />

                    <CustomButton text="Update Password" onPress={handleSubmit} />
                    {firebaseError ? (
                        <Text style={styles.errorText}>{firebaseError}</Text>
                    ) : null}
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E9EAEC',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        marginVertical: 20,
    },
    title: {
        color: '#454545',
        fontSize: 24,
    },
    cross: {
        position: 'absolute',
        right: 10,
        top: '8%',
        zIndex: 1,
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
});