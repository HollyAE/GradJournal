import React, { useEffect } from "react"
import { useNavigation } from '@react-navigation/native'
import { Spinner } from "@gluestack-ui/themed"
import { View } from 'react-native'
import { auth } from '../firebase'


export default function LoadingScreen(){

    // get access to navigation functions
    const navigation = useNavigation();

    // when user account is deleted and authorisation state has changed, send user to sign up screen
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            navigation.navigate(user ? 'Home' : 'SignUp');
        });

        return unsubscribe;
    }, [navigation]);

    return(
        <View>
            <Spinner size='large' />
        </View>
    )
}
