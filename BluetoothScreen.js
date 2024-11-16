import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  PermissionsAndroid,
  Platform,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import RNBluetoothClassic from "react-native-bluetooth-classic";

// Log the RNBluetoothClassic module to see its available functions
console.log("ok1");
console.log(RNBluetoothClassic);

const requestBluetoothPermissions = async () => {
  if (Platform.OS === "android" && Platform.Version >= 31) {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return (
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    return true;
  }
};

const initializeBluetooth = async () => {
  const hasPermissions = await requestBluetoothPermissions();
  if (!hasPermissions) {
    Alert.alert(
      "Permissions required",
      "Please grant Bluetooth permissions to use this feature."
    );
    return false;
  }
  return true;
};

const BluetoothScreen = () => {
  const [devices, setDevices] = useState([]);
  const [connected, setConnected] = useState(false);
  const [data, setData] = useState("");
  const [connectedDevice, setConnectedDevice] = useState(null);

  useEffect(() => {
    const init = async () => {
      const initialized = await initializeBluetooth();
      if (initialized) {
        // Add your initialization logic here
      }
    };
    init();
  }, []);

  const scanForDevices = async () => {
    try {
      // Cancel any ongoing discovery process
      await RNBluetoothClassic.cancelDiscovery();

      const discoveredDevices = await RNBluetoothClassic.startDiscovery();
      console.log("Devices:", discoveredDevices);
      setDevices(discoveredDevices);
      if (discoveredDevices.length === 0) {
        Alert.alert("No devices found", "No Bluetooth devices found");
      }
    } catch (error) {
      console.error("Scan Error:", error);
      Alert.alert("Error", "An error occurred while scanning for devices");
    }
  };

  const connectToDevice = async (device) => {
    try {
      const connected = await RNBluetoothClassic.connectToDevice(device.id);
      setConnected(connected);
      setConnectedDevice(device);
      if (connected) {
        Alert.alert("Connected", `Connected to ${device.name}`);
      } else {
        Alert.alert("Connection failed", `Failed to connect to ${device.name}`);
      }
    } catch (error) {
      console.error("Connection Error:", error);
      Alert.alert("Error", "An error occurred while connecting to the device");
    }
  };

  const sendData = async () => {
    if (connectedDevice) {
      try {
        const dataWithLineBreak = data + "\n"; // Append a newline character
        await RNBluetoothClassic.writeToDevice(
          connectedDevice.id,
          dataWithLineBreak
        );
        Alert.alert("Data Sent", `Data sent to ${connectedDevice.name}`);
      } catch (error) {
        console.error("Send Error:", error);
        Alert.alert("Error", "An error occurred while sending data");
      }
    } else {
      Alert.alert("No Device Connected", "Please connect to a device first");
    }
  };

  const renderDeviceItem = ({ item }) => (
    <TouchableOpacity
      style={{
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
      }}
      onPress={() => connectToDevice(item)}
    >
      <Text>{item.name}</Text>
      <Text>{item.address}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Search and Connect to Bluetooth Devices</Text>
      <Button title="Scan for Devices" onPress={scanForDevices} />
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDeviceItem}
        style={{ width: "100%" }}
      />
      {connected && (
        <View style={{ marginTop: 20, width: "80%" }}>
          <TextInput
            placeholder="Enter data to send"
            value={data}
            onChangeText={setData}
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              marginBottom: 10,
              paddingHorizontal: 10,
            }}
          />
          <Button title="Send" onPress={sendData} />
        </View>
      )}
    </View>
  );
};

export default BluetoothScreen;
