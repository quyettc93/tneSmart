import React from "react";
import { StyleSheet, View } from "react-native";
import BluetoothScreen from "./BluetoothScreen";

export default function App() {
  return (
    <View style={styles.container}>
      <BluetoothScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
