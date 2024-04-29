import React, {useState} from 'react'
import { ScrollView, Text, View, StyleSheet, Switch } from 'react-native'
import { useTheme } from '../contexts/ThemeContext'
import MultiSlider from '@ptomasroos/react-native-multi-slider';



const Settings = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : '#f2f2f2' }]}>
      <Text style={[styles.title, {color: isDarkMode ? 'white' : 'black'}]}>Settings</Text>
      <ScrollView scrollEnabled={false}>
      <Text style={[styles.visibility, {color: isDarkMode ? '#bdbdbd': '#787878'}]}>VISIBILITY</Text>
      <View style = {[styles.listContainer, {backgroundColor: isDarkMode ? '#1a1a1a' : 'white'}]}>
        <View style = {styles.listItem}>
          <Text style = {[styles.listText, {color: isDarkMode ? 'white' : 'black'}]}>High Contrast Mode</Text>
          <View style={styles.highContrast}>
          <Switch
        trackColor={{false: '#767577', true: '#1abc9c'}}
        thumbColor={isDarkMode ? 'white' : 'white'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleTheme}
        value={isDarkMode}
      />
        </View>
        </View>
        <View style={[styles.divider, {backgroundColor: isDarkMode ? '#4a4a4a' : '#e8e8e8'}]}></View>
        <View style={styles.listItem}>
          <Text style={[styles.listText, {color: isDarkMode ? 'white' : 'black'}]}> Font Size </Text>
          <View style={{flex: 1, alignItems: 'flex-end'}}>
            <Text style={{color: '#787878', fontSize: 16}}>
              16
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.audio, {color: isDarkMode ? '#bdbdbd': '#787878'}]}>AUDIO</Text>
      <View style = {[styles.listContainer, {backgroundColor: isDarkMode ? '#1a1a1a' : 'white'}]}>
          <View style={styles.volumeText}>
            <Text style={[styles.listText, {color: isDarkMode ? 'white' : 'black'}]}>
              Volume
            </Text>
          </View>
            <View style={styles.volumeSliderContainer}>
              <MultiSlider
              selectedStyle={{backgroundColor: '#1abc9c'}}
                />
            </View>
    <View style={[styles.divider, {backgroundColor: isDarkMode ? '#4a4a4a' : '#e8e8e8'}]}></View>
            <View style={styles.listItem}>
              <Text style={[styles.listText, {color: isDarkMode ? 'white' : 'black'}]}>
                Voice Language
              </Text>
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                <Text style={styles.languageText}>
                  English
                </Text>
              </View>
            </View>
            
      </View>
      </ScrollView>
    </View>
  )
}

export default Settings

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //alignItems: 'flex-start'
  },
  title: {
    paddingTop: 80,
    fontSize: 30,
    fontWeight: '700',
    paddingLeft: 30,
    paddingBottom: 10
  },
  listContainer: {
    //flex: 1,
    backgroundColor: 'white', 
    marginHorizontal: 30,
    marginTop: 5,
    borderRadius: 15,
  },
  visibility: {
    marginTop: 10,
    color: '#787878',
    paddingHorizontal: 40
  },
  listItem: {
    //flex: 1,
    //backgroundColor: 'red',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    alignContent: 'center'
  },
  listText: {
    fontSize: 16,
    alignContent: 'center',
    fontWeight: '400',
  },
  highContrast: {
    flex: 1,
    alignItems: 'flex-end',
  },
  divider: {
    //flex: 1,
    //marginBottom: 527,
    height: 1,
    marginHorizontal: 10,
    backgroundColor: '#e8e8e8',
    
  },
  volumeText: {
        //flex: 1,
    //backgroundColor: 'red',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 15,
    alignItems: 'center',
    alignContent: 'center'
  },
  audio: {
    marginTop: 10,
    paddingHorizontal: 40
  },
  volumeSliderContainer: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    paddingTop: 5,
    paddingBottom: 15,
    alignItems: 'center',
    alignContent: 'center'
  },
  languageText: {
    color: "#787878",
    fontSize: 17,
  }


});