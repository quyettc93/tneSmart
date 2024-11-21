import React, { useState, useEffect } from "react";
import {
  Button,
  View,
  Text,
  Alert,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from "react-native";
import RNBluetoothClassic from "react-native-bluetooth-classic";
import { CameraView, useCameraPermissions } from "expo-camera";
import buttonData from "./buttonData.json"; // Import the custom button data

// QR scanner and Bluetooth handler
export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [idDeviceAddPass, setIdDeviceAddPass] = useState(null);
  const [isConnected, setIsConnected] = useState(false); // Correctly managing connection state
  const [buttonCount, setButtonCount] = useState(0);
  const [macAddress, setMacAddress] = useState(""); // MAC address of the Bluetooth device
  const [sentData, setSentData] = useState(""); // New state to store the sent data
  const [show, setShow] = useState([]); // New state to store the sent data

  console.log(show);
  console.log(sentData);

  // Bluetooth connection logic
  const requestBluetoothPermissions = async () => {
    const { PermissionsAndroid, Platform } = require("react-native");
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

  // Removed the scanForDevices function
  const connectToDevice = async (macAddress) => {
    try {
      console.log(macAddress);
      const connected = await RNBluetoothClassic.connectToDevice(macAddress);
      if (connected) {
        // Alert.alert(
        //   "Connected",
        //   `Connected to device with MAC address: ${macAddress}`
        // );
        setIsConnected(true); // Properly using setIsConnected
      } else {
        Alert.alert(
          "Connection failed",
          `Failed to connect to device with MAC address: ${macAddress}`
        );
      }
    } catch (error) {
      console.error("Connection Error:", error);
      Alert.alert("Error", "An error occurred while connecting to the device");
    }
  };

  const handlePermissionRequest = () => {
    requestPermission().then(() => {
      if (permission.granted) {
        setCameraEnabled(true);
      }
    });
  };

  const handleBarcodeScanned = ({ type, data }) => {
    setScanned(true);
    try {
      console.log(data);
      const parsedData = JSON.parse(data);
      setIdDeviceAddPass(parsedData); // Save QR data
      setCameraEnabled(false); // Turn off camera after scan
      setMacAddress(parsedData.name); // Assuming QR data contains mac address
      connectToDevice(parsedData.name); // Connect directly using MAC address from QR code
      setButtonCount(parsedData.count);
      setShow(parsedData.show);
      console.log(show);
    } catch (error) {
      Alert.alert("Error", "Invalid QR Code data");
    }
  };

  const handleButtonPress = (buttonNumber) => {
    if (isConnected) {
      const buttonKey = `button${buttonNumber}`; // Example: button1, button2, ...
      const dataToSend = buttonData[buttonKey] + "\n"; // Retrieve the corresponding data from buttonData.json

      RNBluetoothClassic.writeToDevice(macAddress, dataToSend)
        .then(() => {
          setSentData(dataToSend); // Store the sent data in the state
        })
        .catch((error) => {
          console.error("Send Error:", error);
          Alert.alert("Error", "Failed to send data");
        });
    } else {
      Alert.alert(
        "Bluetooth not connected",
        "Please connect to a Bluetooth device first."
      );
    }
  };

  if (!cameraEnabled) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ImageBackground
          source={require("./assets/Image/bacg.jpg")} // Đường dẫn tới hình nền của bạn
          style={{
            flex: 1, // Đảm bảo ảnh nền phủ toàn bộ không gian
            justifyContent: "center", // Căn giữa các phần tử con trong toàn bộ ứng dụng
            alignItems: "center", // Căn giữa các phần tử con trong toàn bộ ứng dụng
          }}
        >
          <View style={styles.container}>
            {idDeviceAddPass ? (
              <View style={styles.resultContainer}>
                {/* <Text style={styles.resultText}>Name: {idDeviceAddPass.name}</Text>
            <Text style={styles.resultText}>
              Password: {idDeviceAddPass.pass}
            </Text>
            <Text style={styles.resultText}>
              Count: {idDeviceAddPass.count}
            </Text> */}
                {/* <Text style={styles.resultText}>Show: {idDeviceAddPass.show}</Text> */}
                {isConnected ? (
                  <View style={styles.container}>
                    {/* <Text style={styles.smarttne}>SmartTNE</Text> */}
                    {/* <TextInput
                  style={styles.input}
                  placeholder="NHẬP SỐ TẦNG"
                  keyboardType="numeric"
                  onChangeText={(text) => setButtonCount(Number(text))}
                  value={buttonCount > 0 ? buttonCount.toString() : ""}
                /> */}
                    <View style={styles.buttonContainer}>
                      {Array.from({ length: buttonCount }, (_, i) => (
                        <View style={styles.buttonCallContainer} key={i}>
                          <TouchableOpacity
                            style={styles.buttonCall}
                            key={i}
                            onPress={() => handleButtonPress(i + 1)}
                          >
                            <Text style={styles.buttonText}>{show[i]}</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                    <View style={{ marginTop: 30 }}>
                      <TouchableOpacity
                        style={styles.buttonFunction}
                        key={"buttonhold"}
                        onPress={() => handleButtonPress(11)}
                      >
                        <Text style={styles.buttonTextFunction}>HOLD</Text>
                      </TouchableOpacity>
                      {/* <Button
                    key={"buttonclose"}
                    title={"HOLD"}
                    onPress={() => handleButtonPress(11)}
                  /> */}
                    </View>
                    <View style={styles.containerRow}>
                      <View style={styles.buttonDoor}>
                        <TouchableOpacity
                          style={styles.buttonFunction}
                          key={"buttonclose"}
                          onPress={() => handleButtonPress(9)}
                        >
                          <Text style={styles.buttonTextFunction}>CLOSE</Text>
                        </TouchableOpacity>
                        {/* <Button
                      key={"buttonclose"}
                      title={"CLOSE"}
                      onPress={() => handleButtonPress(9)}
                    /> */}
                      </View>
                      <View style={styles.buttonDoor}>
                        <TouchableOpacity
                          style={styles.buttonFunction}
                          key={"buttonopen"}
                          onPress={() => handleButtonPress(10)}
                        >
                          <Text style={styles.buttonTextFunction}>OPEN</Text>
                        </TouchableOpacity>
                        {/* <Button
                      key={"buttonOpen"}
                      title={"OPEN"}
                      onPress={() => handleButtonPress(10)}
                    /> */}
                      </View>
                    </View>
                    {/* Display sent data */}
                    {/* {sentData && (
                    <View style={styles.sentDataContainer}>
                      <Text style={styles.sentDataText}>
                        Sent Data: {sentData}
                      </Text>
                    </View>
                  )} */}
                  </View>
                ) : (
                  <Text style={styles.smarttne}>ĐANG KẾT NỐI</Text>
                )}
              </View>
            ) : (
              <View>
                <Text style={styles.message}>
                  We need your permission to show the camera
                </Text>
                <Button
                  onPress={handlePermissionRequest}
                  title="Grant Camera Permission"
                />
              </View>
            )}
          </View>
        </ImageBackground>
      </>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />
      {scanned && (
        <Button title="Scan Again" onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  containerRow: {
    marginTop: 10,
    flexDirection: "row",
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  message: { textAlign: "center", paddingBottom: 10 },
  camera: { flex: 1, width: "100%" },
  resultContainer: { alignItems: "center", marginTop: 20 },
  resultText: { fontSize: 18, fontWeight: "bold", margin: 10 },
  input: {
    width: 200,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    textAlign: "center",
  },
  sentDataContainer: { marginTop: 20 },
  sentDataText: { fontSize: 16, fontWeight: "normal", color: "green" },
  buttonCall: {
    width: 120, // Tăng kích thước để nút cân đối hơn
    height: 70,
    backgroundColor: "#007BFF", // Màu nền xanh lam đậm
    borderColor: "#0056b3", // Màu viền xanh đậm hơn
    borderWidth: 1,
    borderRadius: 8, // Bo góc mềm mại
    justifyContent: "center", // Căn giữa nội dung theo chiều dọc
    alignItems: "center", // Căn giữa nội dung theo chiều ngang
    marginBottom: 15, // Tăng khoảng cách để dễ nhìn hơn
    shadowColor: "#000", // Hiệu ứng đổ bóng
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4, // Bóng cho Android
  },
  buttonFunction: {
    width: 120, // Tăng kích thước để nút cân đối hơn
    height: 70,
    backgroundColor: "#11b119", // Màu nền xanh lam đậm
    borderColor: "#056b1f", // Màu viền xanh đậm hơn
    borderWidth: 1,
    borderRadius: 8, // Bo góc mềm mại
    justifyContent: "center", // Căn giữa nội dung theo chiều dọc
    alignItems: "center", // Căn giữa nội dung theo chiều ngang
    marginBottom: 15, // Tăng khoảng cách để dễ nhìn hơn
    shadowColor: "#000", // Hiệu ứng đổ bóng
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4, // Bóng cho Android
  },
  buttonDoor: {
    marginHorizontal: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "bold",
  },
  buttonTextFunction: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row", // Sắp xếp từ trái sang phải
    flexWrap: "wrap-reverse", // Dòng mới xuất hiện từ dưới lên trên
    justifyContent: "flex-start", // Căn phần tử theo hướng ngang
    alignItems: "flex-start", // Căn phần tử theo chiều dọc
    margin: 10,
  },
  buttonCallContainer: {
    width: "40%", // Mỗi hàng chứa
    marginBottom: 10, // Khoảng cách giữa các nút
    alignItems: "center", // Căn giữa các phần tử bên trong
  },
  smarttne: {
    fontSize: 16,
  },
});
