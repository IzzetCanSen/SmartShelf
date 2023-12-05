import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
} from "react-native";
import { Camera } from "expo-camera";
import { useFocusEffect } from "@react-navigation/native";
import { useIsFocused } from "@react-navigation/native";

const ScanScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanData, setScanData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [scanning, setScanning] = useState(true);
  const cameraRef = useRef(null);

  const isFocused = useIsFocused();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setScanning(true);
      setScanData(null);
      setProductData(null);

      if (cameraRef.current) {
        cameraRef.current.resumePreview();
      }
    }, [])
  );

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanning) {
      setScanData(data);
      setModalVisible(true);

      try {
        const response = await fetch(
          `https://world.openfoodfacts.org/api/v3/product/${data}.json`
        );
        const result = await response.json();
        setProductData(result);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }

      setScanning(false);
    }
  };

  const handleCancelButton = () => {
    setScanning(true);
    setScanData(null);
    setModalVisible(false);
    setProductData(null);
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No camera permission.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          onBarCodeScanned={scanData ? undefined : handleBarCodeScanned}
          ratio="16:9"
        >
          <View style={styles.overlay}>
            <View style={styles.unfocusedContainer}></View>
            <View style={styles.middleContainer}>
              <View style={styles.unfocusedContainer}></View>
              <View style={styles.focusedContainer}></View>
              <View style={styles.unfocusedContainer}></View>
            </View>
            <View style={styles.unfocusedContainer}></View>
          </View>
        </Camera>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {productData ? (
            <View>
              <Text>{productData.product.product_name}</Text>
              <Image
                style={styles.productImage}
                source={{ uri: productData.product.image_front_small_url }}
              />
            </View>
          ) : (
            <Text>Loading...</Text>
          )}
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleCancelButton}
            >
              <Text>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleCancelButton}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    aspectRatio: 9 / 15,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  middleContainer: {
    flexDirection: "row",
    flex: 0.6,
  },
  focusedContainer: {
    flex: 7,
    backgroundColor: "transparent",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  productImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  modalButtonContainer: {
    justifyContent: "center",
    flexDirection: "row",
    columnGap: 10,
  },
});

export default ScanScreen;
