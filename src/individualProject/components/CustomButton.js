import React from 'react'
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Feather } from '@expo/vector-icons'
import { FontAwesome5 } from '@expo/vector-icons'
import { AntDesign } from '@expo/vector-icons'
import { Foundation } from '@expo/vector-icons'
import PropTypes from 'prop-types'



export default function CustomButton({ onPress, text, pencilIcon, micIcon, bellIcon, deleteUserIcon, exportIcon, passwordIcon }) {
    // determines if no icons are included in the button
    const noIcons = !pencilIcon && !micIcon && !bellIcon && !deleteUserIcon && !exportIcon && !passwordIcon;

    return (
        <View> 
            <TouchableOpacity style={[styles.button, noIcons ? styles.centerContent : {}, deleteUserIcon ? {backgroundColor: '#E22525'} : {} ]} onPress={onPress}>
                <Text style={[noIcons ? styles.textCenter : styles.text, deleteUserIcon ? styles.deleteUserText : {}]}>{text}</Text>
                {deleteUserIcon && <AntDesign name="deleteuser" size={32} color="white" />}
                {exportIcon && <Foundation name="page-export-csv" size={32} color="black" />}
                {passwordIcon && <MaterialCommunityIcons name="shield-key-outline" size={32} color="black" />}
                {pencilIcon && <MaterialCommunityIcons name='pencil' size={32} color='black' />}
                {micIcon && <Feather name='mic' size={32} color='black' />}
                {bellIcon && <FontAwesome5 name='bell' size={32} color='black' />}
            </TouchableOpacity>
        </View>
    );
}

CustomButton.propTypes = {
    onPress: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired,
    pencilIcon: PropTypes.bool,
    micIcon: PropTypes.bool,
    bellIcon: PropTypes.bool,
    deleteUserIcon: PropTypes.bool,
    exportIcon: PropTypes.bool,
    passwordIcon: PropTypes.bool,
  }

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 28,
        paddingVertical: 24,
        marginHorizontal: 75,
        marginVertical: 40,
        backgroundColor: '#8ABDE9',
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    centerContent: {
        justifyContent: 'center',
    },
    textCenter: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500'
    },
    text: {
        fontSize: 16,
        fontWeight: '500',
        marginRight: 4,
        maxWidth: 160
    },
    deleteUserText: {
        color: 'white', 
        fontWeight: 'bold', 
        textDecorationLine: 'underline'
    }
});