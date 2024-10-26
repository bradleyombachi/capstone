import React, { useContext } from 'react'
import { Text, View, StyleSheet, FlatList, Image } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext'
import { useState, useRef, useEffect } from 'react';
import { HistoryContext } from '../contexts/HistoryContext';
import axios from 'axios';

type ItemProps = {
  brickColor: string,
  time: string,
  brickDescription: string,
  isDarkMode: boolean
  photo: string
};


const Item = ({brickColor, time, brickDescription, isDarkMode, photo}: ItemProps) => (
  <View style={[styles.item, {backgroundColor: isDarkMode ? '#1a1a1a' : 'white'}]}>
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
        <MaterialIcons name="navigate-next" size={24} color="#1abc9c" />
      </View>
    </View>
  </View>
);

const History = () => {
  const { isDarkMode } = useTheme();
  const { history } = useContext(HistoryContext)
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
        />}
        keyExtractor={(item, index) => index.toString()} // Unique key for each item
      />
      </View>
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
  }

  

});