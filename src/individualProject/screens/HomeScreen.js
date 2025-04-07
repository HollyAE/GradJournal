import React from 'react';
import { useNavigation } from '@react-navigation/native'
import { View, StyleSheet } from 'react-native';
import CustomButton from '../components/CustomButton';
import Layout from '../components/Layout';



export default function HomeScreen() { 

  // get access to navigation functions
  const navigation = useNavigation();

    return ( 
      <View style={styles.container}>
        <Layout text='GradJournal'>
        <View>
          <CustomButton text='Write a note!' onPress={() => navigation.navigate('CreateTextNote')} pencilIcon={true}/>

          <CustomButton text='Record a note!' onPress={() => navigation.navigate('CreateAudioNote')} micIcon={true}/>

          <CustomButton text='Create a reminder!' onPress={() => navigation.navigate('CreateReminder')} bellIcon={true}/>
        </View>
        </Layout>
      </View> 
    );
  }

  const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E9EAEC',
    },
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    title: {
        textAlign: 'left',
        color: '#454545',
        margin: '5%',
        marginTop: '15%',
        fontSize: 24,
    }
  });