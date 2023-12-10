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
import * as SQLite from "expo-sqlite";

const ScanScreen = ({ navigation }) => {
  const db = SQLite.openDatabase("inventoryDatabase.db");
  const [hasPermission, setHasPermission] = useState(null);
  const [scanData, setScanData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [scanning, setScanning] = useState(true);
  const cameraRef = useRef(null);
  const [isSaved, setIsSaved] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    // Create the "Product" table if it doesn't exist
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS Product (id INTEGER PRIMARY KEY AUTOINCREMENT, product_name TEXT, image_url TEXT, brands TEXT, amount INTEGER DEFAULT 1);",
        [],
        (tx, result) => {
          if (result.rowsAffected > 0) {
            console.log("Product table is ready");
          }
        },
        (error) => {
          console.error("Error creating Product table:", error);
        }
      );
    });
  }, [db]);

  useFocusEffect(
    React.useCallback(() => {
      setScanning(true);
      setScanData(null);
      setProductData(null);
      setIsSaved(false);
      if (cameraRef.current) {
        cameraRef.current.resumePreview();
      }
    }, [])
  );

  const addProductToDatabase = () => {
    console.log("pressed");
    if (!productData || !productData.product) {
      console.error("Product data is not available");
      return;
    }

    const { product_name, image_front_small_url, brands } = productData.product;

    db.transaction(
      (tx) => {
        tx.executeSql(
          "INSERT INTO Product (product_name, image_url, brands, amount) VALUES (?, ?, ?, 1)",
          [product_name, image_front_small_url, brands],
          (tx, result) => {
            if (result.rowsAffected > 0) {
              console.log("Product added successfully");
              setIsSaved(true);
            } else {
              console.log("Error adding product");
            }
          },
          (tx, error) => {
            console.error("Transaction error:", error);
          }
        );
      },
      (error) => {
        console.error("Error during transaction:", error);
      },
      () => {
        console.log("Transaction completed successfully");
      }
    );
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanning) {
      setScanData(data);
      setModalVisible(true);

      try {
        const response = await fetch(
          `https://world.openfoodfacts.org/api/v3/product/${data}.json`
        );
        console.log(
          `https://world.openfoodfacts.org/api/v3/product/${data}.json`
        );
        const result = await response.json();
        if (result.status === "success") {
          setProductData(result);
        } else {
          // Handle the failure case
          setModalVisible(true);
          setProductData(null);
          setScanning(false);
          setIsSaved(false);
          return;
        }
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
    setIsSaved(false);
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
        {!isSaved ? (
          <View style={styles.modalContainer}>
            {productData ? (
              <View>
                <View>
                  <Text>{productData.product.product_name}</Text>
                  <Image
                    style={styles.productImage}
                    source={{ uri: productData.product.image_front_small_url }}
                  />
                </View>
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={addProductToDatabase}
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
            ) : (
              <View>
                <Text>
                  This product could not be found. Scan another product please
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleCancelButton}
                >
                  <Text>Scan</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.modalContainer}>
            <Text style={styles.confirmationText}>
              Product Saved Successfully
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={handleCancelButton}
            >
              <Text>Scan Another Product</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("Inventory");
              }}
            >
              <Text>Go to Inventory</Text>
            </TouchableOpacity>
          </View>
        )}
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
