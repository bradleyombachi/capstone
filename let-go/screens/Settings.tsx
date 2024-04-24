import React from 'react'
import { Text, View, StyleSheet } from 'react-native'

const Settings = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
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
    paddingLeft: 30

  },
});