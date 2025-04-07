import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Text, View, StyleSheet, TouchableOpacity, Modal } from 'react-native'
import Layout from '../components/Layout'

export default function EducationScreen(){

  // modal visbility
  const [isSMModalVisible, setIsSMModalVisible] = useState(false)
  const [isSIModalVisible, setIsSIModalVisible] = useState(false)
  const [isIModalVisible, setIsIModalVisible] = useState(false)

  // get access to navigation functions
  const navigation = useNavigation();


    return (
        <View style={styles.container}> 


          { isSMModalVisible && (
            <Modal visible={isSMModalVisible} transparent={true} onRequestClose={() => setIsSMModalVisible(false)} presentationStyle='overFullScreen' >
            <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPressOut={() => setIsSMModalVisible(false)}>
              <View style={styles.modal}>
                <Text style={[styles.skillsTitle,{color: '#36627b'}]}>Self Management skills include:</Text>
                  <View style={styles.bulletPointsContainer}>
                    <Text style={[styles.skillBullet,{color: '#36627b'}]}>• Focusing</Text>
                    <Text style={[styles.skillBullet,{color: '#36627b'}]}>• Integrity</Text>
                    <Text style={[styles.skillBullet,{color: '#36627b'}]}>• Adapting</Text>
                    <Text style={[styles.skillBullet,{color: '#36627b'}]}>• Initiative</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Modal>
            )
          }

          { isSIModalVisible && (
            <Modal visible={isSIModalVisible} transparent={true} onRequestClose={() => setIsSIModalVisible(false)} presentationStyle='overFullScreen' >
            <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPressOut={() => setIsSIModalVisible(false)}>
              <View style={styles.modal}>
                <Text style={[styles.skillsTitle,{color: '#827390'}]}>Social Intelligence skills include:</Text>
                <View style={styles.bulletPointsContainer}>
                  <Text style={[styles.skillBullet,{color: '#827390'}]}>• Communicating</Text>
                  <Text style={[styles.skillBullet,{color: '#827390'}]}>• Feeling</Text>
                  <Text style={[styles.skillBullet,{color: '#827390'}]}>• Collaborating</Text>
                  <Text style={[styles.skillBullet,{color: '#827390'}]}>• Leading</Text>
                </View>
                </View>
              </TouchableOpacity>
            </Modal>
            )
          }

          { isIModalVisible && (
            <Modal visible={isIModalVisible} transparent={true} onRequestClose={() => setIsIModalVisible(false)} presentationStyle='overFullScreen' >
            <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPressOut={() => setIsIModalVisible(false)}>
              <View style={styles.modal}>
                <Text style={[styles.skillsTitle,{color: '#83855c'}]}>Innovation skills include:</Text>
                <View style={styles.bulletPointsContainer}>
                  <Text style={[styles.skillBullet,{color: '#83855c'}]}>• Curiosity</Text>
                  <Text style={[styles.skillBullet,{color: '#83855c'}]}>• Creativity</Text>
                  <Text style={[styles.skillBullet,{color: '#83855c'}]}>• Sense-Making</Text>
                  <Text style={[styles.skillBullet,{color: '#83855c'}]}>• Critical Thinking</Text>
                </View>
              </View> 
              </TouchableOpacity>
            </Modal>
            )
          }


          <Layout text={'Learn about Meta-skills!'}>
        
            <View style={styles.body}>
              <View style={{margin: 4}}>
                <Text style={styles.text}> 
                  Skills Development Scotland describes meta-skills as &quot;higher-order&quot; skills.
                  There are 3 overarching meta-skills categories from which more specific meta-skills can be formed. 
                </Text> 
                <Text style={[styles.text, {marginVertical: '3%' }]}>
                  Click on the categories below to find out which skills they include!
                </Text>
            </View>
                
            <View style={{justifyContent:'center', alignItems: 'center'}}>
                <View>
                  <TouchableOpacity style={[styles.button, {backgroundColor: '#36627b'}]} onPress={() => {setIsSMModalVisible(true)}}>
                    <Text style={styles.metaSkillText}>Self Management</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.button, {backgroundColor: '#827390'}]} onPress={() => {setIsSIModalVisible(true)}}>
                    <Text style={styles.metaSkillText}>Social Intelligence</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.button, {backgroundColor: '#83855c'}]} onPress={() => {setIsIModalVisible(true)}}>
                    <Text style={styles.metaSkillText}>Innovation</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.additionalButton} onPress={() => navigation.navigate('Resources')}>
                  <Text style={{textAlign: 'center', fontWeight: '500'}}>Additional Meta-Skills Resources...</Text>
                </TouchableOpacity>
                </View>  
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
      margin: '5%',
      marginTop: '15%',
      fontSize: 24,
    },
    body: {
      alignItems: 'center',
      justifyContent: 'center',
      margin: '5%',
    },
    text: {
      textAlign: 'center',
      fontSize: 16
    },
    button: {
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row', 
      width: 192,
      height: 70,
      margin: 10
    },
    metaSkillText: {
      color: 'white',
      fontWeight: '500'
    },
    modalContainer: {
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
    modal: {
      borderColor: 'black',
      borderRadius: 4,
      borderWidth: 1,
      flexDirection: 'column',
      width: 290,
      height: 300,
      backgroundColor: '#FFFFFF',
      padding: 20
    },
    bulletPointsContainer: {
      flex: 1,
      justifyContent: 'space-evenly',
    },
    skillsTitle: {
      fontSize: 20,
      fontWeight: 800
    },
    skillBullet: {
      fontWeight: 'bold',
      fontSize: 18
    },
    additionalButton:{
      paddingHorizontal: 28,
      paddingVertical: 24,
      marginHorizontal: 75,
      marginVertical: 40,
      backgroundColor: '#8ABDE9',
      borderRadius: 10,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: 250
    }
  });