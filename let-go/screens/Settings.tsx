import React, {useEffect, useState} from 'react'
import { ScrollView, Text, View, StyleSheet, Switch, TouchableOpacity, Modal, Button } from 'react-native'
import { useTheme } from '../contexts/ThemeContext'
import { useFontSize } from '../contexts/FontContext';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
// import { TouchableOpacity } from 'react-native-gesture-handler';
import { Entypo } from '@expo/vector-icons';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ColorPicker, { Panel3, Swatches, Preview, OpacitySlider, HueSlider } from 'reanimated-color-picker';
import { useColor } from '../contexts/ColorContext';


const fontSizes = {
  sm: 12,
  md: 16,
  lg: 20,
};

const Settings = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { customFontSize = 'md', setSmall, setMedium, setLarge } = useFontSize();
  const fontSizeLabel = customFontSize === 'sm' ? 'Small' : customFontSize === 'md' ? 'Medium' : 'Large';
  const [showModal, setShowModal] = useState(false);
  const [language, setLanguage] = useState('en')
  const languageLabel = language === 'en' ? 'English' : language === 'es' ? 'Spanish' : 'English';
  const {colorHex, setColorHex} = useColor();
  const [brightness, setBrightness] = useState(1);

    const getFontSize = (size: string) => fontSizes[size as keyof typeof fontSizes];



  const onSelectColor = ({ hex }: { hex: string }) => {
    setColorHex(hex);
  };
  
  useEffect(()=> {
    console.log(`HEX: ${colorHex}`)
  }, [colorHex])

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : '#f2f2f2'}]}>
      <Text style={[styles.title, {color: isDarkMode ? 'white' : 'black'}]}>Settings</Text>
      
      <ScrollView scrollEnabled={false}>
      <Text style={[styles.visibility, {color: isDarkMode ? '#bdbdbd': '#787878'}]}>VISIBILITY</Text>
      <View style = {[styles.listContainer, {backgroundColor: isDarkMode ? '#1a1a1a' : 'white'}]}>
        <View style = {styles.listItem}>
          <Text style = {[styles.listText, {color: isDarkMode ? 'white' : 'black', fontSize: getFontSize(customFontSize)}]}>High Contrast Mode</Text>
          <View style={styles.highContrast}>
          <Switch
        trackColor={{false: '#767577', true: colorHex}}
        thumbColor={isDarkMode ? 'white' : 'white'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleTheme}
        value={isDarkMode}
      />
        </View>
        </View>
        <View style={[styles.divider, {backgroundColor: isDarkMode ? '#4a4a4a' : '#e8e8e8'}]}></View>
        <View style={styles.listItem}>
          <Text style={[styles.listText, {color: isDarkMode ? 'white' : 'black', fontSize: getFontSize(customFontSize)}]}> Font Size </Text>
          <Menu style={{flex: 1, flexDirection:'row', justifyContent: 'flex-end', borderRadius: 50}}>
            <MenuTrigger 
            children={
              <Text style={{color: '#787878', fontSize: getFontSize(customFontSize)}}>
              {fontSizeLabel}
            </Text>
          }
            />
            <View style={{justifyContent: 'center'}}>
            <Entypo name="select-arrows" size={16} color="#787878" />
            </View>
            <MenuOptions   customStyles={{
                  optionWrapper: {
                    backgroundColor: isDarkMode ? 'black' : 'white',
                  },
                  optionText: {
                    color: '#787878',
                    fontSize: getFontSize(customFontSize)
                  },
                }}>
              <MenuOption onSelect={setSmall} >
                <Text style={{color: '#787878', fontSize: getFontSize(customFontSize)}}>Small</Text>
              </MenuOption>
              <MenuOption onSelect={setMedium} >
                <Text style={{color: '#787878', fontSize: getFontSize(customFontSize)}}>Medium</Text>
              </MenuOption>
              <MenuOption onSelect={setLarge} >
                <Text style={{color: '#787878', fontSize: getFontSize(customFontSize)}}>Large</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
          {/* <View style={{flex: 1, flexDirection:'row', justifyContent: 'flex-end'}}>
            <Text style={{color: '#787878', fontSize: 16}}>
              Medium
            </Text>
            <View style={{justifyContent: 'center'}}>
          <Entypo name="select-arrows" size={16} color="#787878" />
          </View>
          </View> */}
        </View>

        <View style={[styles.divider, {backgroundColor: isDarkMode ? '#4a4a4a' : '#e8e8e8'}]}></View>

        <View style={styles.listItem}>
        <Text style={[styles.listText, {color: isDarkMode ? 'white' : 'black', fontSize: getFontSize(customFontSize)}]}> Color Theme </Text>
        <View style={{flex: 1, alignItems: 'flex-end', marginLeft: 130, borderRadius: 10}}>
            <View style={styles.colorPicker}>
            <Modal 
              visible={showModal} 
              animationType='slide'
              transparent={true}
              onRequestClose={() => setShowModal(false)} 
              >
               <View style={styles.modalContainer}>
                  <ColorPicker style={{ width: '70%' }} value={colorHex} onComplete={onSelectColor}>
                    <Preview style={{marginBottom: 20, borderRadius: 50}} hideInitialColor/>
                    <Panel3 style={{marginBottom: 20}}/>
                  </ColorPicker>
                  <View style={{flexDirection: 'row'}}>
                  <Button title='Apply' onPress={() => {
                    setShowModal(false);
                  }} color="white"/>
                  </View>
              </View>

            </Modal>
          </View>
          <TouchableOpacity onPress={() => setShowModal(true)}>         
            <FontAwesome name="circle" size={30} color={colorHex} />
          </TouchableOpacity>
        </View>
      </View>
      </View>

      <Text style={[styles.audio, {color: isDarkMode ? '#bdbdbd': '#787878'}]}>AUDIO</Text>
      <View style = {[styles.listContainer, {backgroundColor: isDarkMode ? '#1a1a1a' : 'white'}]}>
          <View style={styles.volumeText}>
            <Text style={[styles.listText, {color: isDarkMode ? 'white' : 'black', fontSize: getFontSize(customFontSize)}]}>
              Volume
            </Text>
          </View>
            <View style={styles.volumeSliderContainer}>
              <MultiSlider
              selectedStyle={{backgroundColor: colorHex}}
                />
            </View>
    <View style={[styles.divider, {backgroundColor: isDarkMode ? '#4a4a4a' : '#e8e8e8'}]}></View>
            <View style={styles.listItem}>
              <Text style={[styles.listText, {color: isDarkMode ? 'white' : 'black', fontSize: getFontSize(customFontSize)}]}>
                Voice Language
              </Text>
              <Menu style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', borderRadius: 50 }}>
          <MenuTrigger>
            <Text style={{ color: '#787878', fontSize: getFontSize(customFontSize) }}>
              {languageLabel}
            </Text>
          </MenuTrigger>
          <View style={{ justifyContent: 'center' }}>
            <Entypo name="select-arrows" size={16} color="#787878" />
          </View>
          <MenuOptions customStyles={{
            optionWrapper: {
              backgroundColor: isDarkMode ? 'black' : 'white',
            },
            optionText: {
              color: '#787878',
              fontSize: getFontSize(customFontSize),
            },
          }}>
            <MenuOption onSelect={() => setLanguage('en')}>
              <Text style={{ color: '#787878', fontSize: getFontSize(customFontSize) }}>English</Text>
            </MenuOption>
            <MenuOption onSelect={() => setLanguage('es')}>
              <Text style={{ color: '#787878', fontSize: getFontSize(customFontSize) }}>Spanish</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
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
    fontSize: 16,
  },
  menuBox: 
  {
    backgroundColor: 'blue'
  },
  colorPicker: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)'
  },

});