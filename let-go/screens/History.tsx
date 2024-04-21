import React from 'react'
import { Text, View, StyleSheet } from 'react-native'

const History = () => {
  return (
    <View style={styles.container}>
      <Text>History</Text>
    </View>
  )
}

export default History

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});