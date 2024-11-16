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
import buttonData from "./buttonData.json"; // Import the custom button data

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
  const [buttonCount, setButtonCount] = useState(0);
  const [sentData, setSentData] = useState(""); // State to store the sent data

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
        setDevices([device]); // Hide all devices except the connected one
      } else {
        Alert.alert("Connection failed", `Failed to connect to ${device.name}`);
      }
    } catch (error) {
      console.error("Connection Error:", error);
      Alert.alert("Error", "An error occurred while connecting to the device");
    }
  };

  const sendData = async (buttonKey) => {
    if (connectedDevice) {
      try {
        const dataToSend = buttonData[buttonKey] + "\n"; // Append a newline character
        await RNBluetoothClassic.writeToDevice(connectedDevice.id, dataToSend);
        setSentData(dataToSend); // Update the sent data state
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
        backgroundColor: item.id === connectedDevice?.id ? "green" : "white",
      }}
      onPress={() => connectToDevice(item)}
    >
      <Text>{item.name}</Text>
      <Text>{item.address}</Text>
    </TouchableOpacity>
  );

  const renderButtons = () => {
    const buttons = [];
    for (let i = 1; i <= buttonCount && i <= 8; i++) {
      const buttonKey = `button${i}`;
      buttons.push(
        <Button
          key={i}
          title={`Button ${i}`}
          onPress={() => sendData(buttonKey)}
        />
      );
    }
    return buttons;
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Search and Connect to Bluetooth Devices</Text>
      {!connected && (
        <Button title="Scan for Devices" onPress={scanForDevices} />
      )}
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDeviceItem}
        style={{ width: "100%" }}
      />
      {connected && (
        <View style={{ marginTop: 20, width: "80%" }}>
          <TextInput
            placeholder="Enter number of buttons (max 8)"
            keyboardType="numeric"
            value={buttonCount.toString()}
            onChangeText={(text) =>
              setButtonCount(Math.min(parseInt(text) || 0, 8))
            }
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              marginBottom: 10,
              paddingHorizontal: 10,
            }}
          />
          {renderButtons()}
          {sentData && (
            <View
              style={{
                marginTop: 20,
                padding: 10,
                backgroundColor: "#e0e0e0",
                borderRadius: 5,
              }}
            >
              <Text>Data Sent: {sentData}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default BluetoothScreen;
