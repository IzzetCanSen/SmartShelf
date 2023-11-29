import React, { useState } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";

const { width, height } = Dimensions.get("window");
const scannerSize = 250;

const ScanScreen = ({ navigation }) => {
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setScannedData({ type, data });
    console.log(`Bar code scanned: ${type} - ${data}`);
    console.log(scannedData);
  };

  return (
    <View style={styles.container}>
      <BarCodeScanner
        style={StyleSheet.absoluteFillObject}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.rectangleContainer}>
          <View style={styles.rectangle} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: "rgba(0,0,0,0.5)",
  },
  rectangleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rectangle: {
    height: scannerSize,
    width: scannerSize,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "transparent",
  },
});

export default ScanScreen;
