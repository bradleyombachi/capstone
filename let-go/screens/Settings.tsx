import React, {useState} from 'react'
import { ScrollView, Text, View, StyleSheet, Switch } from 'react-native'
import MultiSlider from '@ptomasroos/react-native-multi-slider';



const Settings = () => {

  const [isEnabled, setIsEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#f2f2f2")

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <ScrollView scrollEnabled={false}>
      <Text style={styles.visibility}>VISIBILITY</Text>
      <View style = {styles.listContainer}>
        <View style = {styles.listItem}>
          <Text style={styles.listText}>High Contrast Mode</Text>
          <View style={styles.highContrast}>
          <Switch
        trackColor={{false: '#767577', true: '#81b0ff'}}
        thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
        </View>
        </View>
        <View style={styles.divider}></View>
        <View style={styles.listItem}>
          <Text style={styles.listText}> Font Size </Text>
        </View>
        <View style={styles.divider}></View>
      </View>

      <Text style={styles.audio}>AUDIO</Text>
      <View style={styles.listContainer}>
          <View style={styles.volumeText}>
            <Text style={styles.listText}>
              Volume
            </Text>
          </View>
            <View style={styles.volumeSliderContainer}>
              <MultiSlider 
                />
            </View>
    <View style={styles.divider}></View>
            <View style={styles.listItem}>
              <Text style={styles.listText}>
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
    backgroundColor: '#f2f2f2',
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
    fontSize: 17,
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
    color: '#787878',
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
    color: "#787878"
  }


});