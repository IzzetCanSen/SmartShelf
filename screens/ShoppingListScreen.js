import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const ShoppingListScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>List Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
});

export default ShoppingListScreen;
