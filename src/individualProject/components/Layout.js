import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import Dropdown from './Dropdown'
import BottomTab from './BottomTab'
import PropTypes from 'prop-types'



export default function Layout({text, addFolderFunction, onDeleteFolder, onExportFolder, children}){
    return(
        <View style={styles.container}> 
            <View style={styles.titleContainer}>
                <View style={{maxWidth: 280}}>
                    <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{text}</Text> 
                </View>
                <Dropdown addFolderFunction={addFolderFunction} onDeleteFolder={onDeleteFolder} onExportFolder={onExportFolder} ></Dropdown>
            </View>

            <View style={styles.content}>{children}</View>
            

            
            <BottomTab />
            
        </View>
    )
}

Layout.propTypes = {
    text: PropTypes.string, 
    addFolderFunction: PropTypes.func, 
    onDeleteFolder: PropTypes.func,
    onExportFolder: PropTypes.func,
    children: PropTypes.node 
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
    },
    content: {
        flex: 1, 
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        textAlign: 'left',
        color: '#454545',
        marginTop: '15%',
        fontSize: 28,
        marginLeft: '15%',
    },
  });