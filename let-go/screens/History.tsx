import React, { useContext } from 'react'
import { Text, View, StyleSheet, FlatList, Image, TouchableOpacity, Modal } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext'
import { useState, useRef, useEffect } from 'react';
import { HistoryContext } from '../contexts/HistoryContext';
import axios from 'axios';
import { useColor } from '../contexts/ColorContext'

type ItemProps = {
  brickColor: string,
  time: string,
  brickDescription: string,
  isDarkMode: boolean
  photo: string
  color: string
  onImagePress: () => void
};


const Item = ({brickColor, time, brickDescription, isDarkMode, photo, color, onImagePress}: ItemProps) => (
  <TouchableOpacity 
    style={[styles.item, {backgroundColor: isDarkMode ? '#1a1a1a' : 'white'}]}
    onPress={onImagePress}>
    <View style={{flex: 1, flexDirection: 'row'}}>
      <Image 
        source={{ uri: `data:image/jpeg;base64,${photo}` }} 
        style={styles.brickImage} 
      />
      <View>
        <Text style={[styles.brickColor, {color: isDarkMode ? 'white' : 'black'}]}>{brickColor}</Text>
        <Text style={[styles.brickDescription, {color: isDarkMode ? '#bfbdbd' : '#5c5b5b'}]}>{brickDescription}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-end'}}>
        <MaterialIcons name="navigate-next" size={24} color={color} />
      </View>
    </View>
  </TouchableOpacity>
);

const History = () => {
  const { isDarkMode } = useTheme();
  const { history } = useContext(HistoryContext)
  const { colorHex } = useColor()
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const handleImagePress = (photo: string) => {
    setSelectedImage(photo);
    setShowModal(true);
  };

  return (
    <View style = {[styles.container, { backgroundColor: isDarkMode ? 'black' : '#f2f2f2' }]}>
      <Text style={[styles.title, { color: isDarkMode ? 'white' : 'black' }]}>History</Text>
      <View style={styles.listItemsContainer}>
      <FlatList
        data={[...history].reverse()}
        renderItem={({item}) => 
        <Item 
        brickColor={item.color} 
        time={item.time}
        brickDescription={item.guess}
        isDarkMode={isDarkMode}
        photo={item.photo}
        color = {colorHex}
        onImagePress={() => handleImagePress(item.photo)}
        />}
        keyExtractor={(item, index) => index.toString()} // Unique key for each item
      />
      </View>

      <Modal
        visible={showModal}
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <Image 
            source={{ uri: `data:image/jpeg;base64,${selectedImage}` }} 
            style={styles.modalImage} 
          />
          <TouchableOpacity onPress={() => setShowModal(false)}>
            <Text style={{ color: 'white', fontSize: 18 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  )
}



export default History

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
    paddingLeft: 30

  },
  listItemsContainer: {
    flex: 1,
    //backgroundColor: 'white',
    marginHorizontal: 30,
    marginTop: 30,
    marginBottom: 0,
    justifyContent: 'center',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    marginVertical: 8,
    gap: 4,
    borderRadius: 15,
  },
  brickColor: {
    fontSize: 20,
    fontWeight: '600'
  },
  time: {
    fontSize: 13,
    color: '#7a7878'
  },
  brickImage: {
    width: 70,
    height: 70,
    marginRight: 10,
    borderRadius: 5,
    backgroundColor: 'black'
  },
  brickDescription: {
    color: '#5c5b5b',
    fontWeight: '500'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalImage: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderRadius: 20
  },
});