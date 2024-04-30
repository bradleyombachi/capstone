import React from 'react'
import { Text, View, StyleSheet, FlatList, Image } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext'

type ItemData = {
  id: string; 
  brickName: string;
  brickDescription: string;
  date: string;
}
const DATA: ItemData[] = [
  {
    id: '1',
    brickName: 'First Item',
    date: '4/22/2024',
    brickDescription: 'Brick Corner 2x2'
  },
  {
    id: '2',
    brickName: 'Second Item',
    date: '4/22/2024',
    brickDescription: 'Brick Corner 2x2'
  },
  {
    id: '3',
    brickName: 'Third Item',
    date: '4/22/2024',
    brickDescription: 'Brick Corner 1x2x2'
  },
];

type ItemProps = {
  brickName: string,
  date: string,
  brickDescription: string,
  isDarkMode: boolean
};


const Item = ({brickName, date, brickDescription, isDarkMode}: ItemProps) => (
  <View style={[styles.item, {backgroundColor: isDarkMode ? '#1a1a1a' : 'white'}]}>
    <View style={{flex: 1, flexDirection: 'row'}}>
      <Image source={require('../assets/legopic.jpg')} style={styles.brickImage} />
      <View>
        <Text style={[styles.brickName, {color: isDarkMode ? 'white' : 'black'}]}>{brickName}</Text>
        <Text style={[styles.brickDescription, {color: isDarkMode ? '#bfbdbd' : '#5c5b5b'}]}>{brickDescription}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-end'}}>
        <MaterialIcons name="navigate-next" size={24} color="#1abc9c" />
      </View>
    </View>

  </View>
);

const History = () => {
  const { isDarkMode } = useTheme();
  return (
    <View style = {[styles.container, { backgroundColor: isDarkMode ? 'black' : '#f2f2f2' }]}>
      <Text style={[styles.title, { color: isDarkMode ? 'white' : 'black' }]}>History</Text>
      <View style={styles.listItemsContainer}>
      <FlatList
        data={DATA}
        renderItem={({item}) => 
        <Item 
        brickName={item.brickName} 
        date={item.date}
        brickDescription={item.brickDescription}
        isDarkMode={isDarkMode}
        />}
        keyExtractor={item => item.id}
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
  brickName: {
    fontSize: 20,
    fontWeight: '600'
  },
  date: {
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