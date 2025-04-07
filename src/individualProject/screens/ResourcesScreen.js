import React from 'react'
import { Text, View, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native'
import Layout from '../components/Layout'

export default function ResourcesScreen(){


  // open url of resource
    const openURL = (url) => {
        Linking.canOpenURL(url)
          .then((supported) => {
            if (supported) {
              return Linking.openURL(url);
            } else {
              Alert.alert("Can't handle URL: " + url);
            }
          })
          .catch((err) => console.error('An error occurred', err));
      };

    return (
        <View style={styles.container}> 
            <Layout text={'Meta-skills Resources'}>
        
                <View style={styles.resourcesContainer}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={() => openURL('https://www.skillsdevelopmentscotland.co.uk/what-we-do/scotlands-careers-services/education-team/meta-skills-toolkit')}>
                            <Text style={styles.text}>Skills Development Scotland: Meta-Skills Toolkit</Text>
                        </TouchableOpacity>
                        <Text style={styles.text}>A variety of meta-skills resources, including: self evaluation tools, flash cards and videos.</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={() => openURL('https://www.skillsdevelopmentscotland.co.uk/media/pgkgrzlf/skills-4-0_a-model-to-drive-scotlands-future.pdf')}>
                            <Text style={styles.text}>Skills Development Scotland: Meta-Skills PDF</Text>
                        </TouchableOpacity>
                        <Text style={styles.text}>Skills Development Scotland&apos;s PDF defining and exploring meta-skills.</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={() => openURL('https://www.cell.com/heliyon/pdf/S2405-8440(22)00075-5.pdf')}>
                            <Text style={styles.text}>Meta-skills development needs assessment among undergraduate students PDF</Text>
                        </TouchableOpacity>
                        <Text style={styles.text}>Research article by Prasittichok and Klaykaew (2022) investigating the meta-skills of undergraduate students.</Text>
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
    resourcesContainer: {
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    text: {
      textAlign: 'center',
      fontSize: 16,
      marginHorizontal: 4
    },
    button: {
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row', 
        width: 300,
        margin: 10,
        padding: 20,
        backgroundColor: '#8ABDE9',
    },
    buttonContainer: {
        alignItems: 'center',
        marginBottom: 25,
        padding: 8
    }
  });