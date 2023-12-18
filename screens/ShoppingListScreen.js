import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import * as SQLite from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";

const ShoppingListScreen = ({ navigation }) => {
  const db = SQLite.openDatabase("inventoryDatabase.db");
  const [products, setProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
    }, [])
  );

  const handleDoneButtonPress = () => {
    db.transaction((tx) => {
      selectedProductIds.forEach((productId) => {
        tx.executeSql(
          "UPDATE Product SET amount = amount + 1 WHERE id = ?",
          [productId],
          () => {
            console.log(`Product with ID ${productId} amount incremented`);
          },
          (error) => {
            console.error(
              `Error incrementing amount for product ${productId}:`,
              error
            );
          }
        );
      });

      // After updating, fetch the products again to reflect the changes
      fetchProducts();
    });

    // Clear the selectedProductIds after pressing the "Done" button
    setSelectedProductIds([]);
  };

  const fetchProducts = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM Product WHERE amount = 0",
        [],
        (tx, result) => {
          const len = result.rows.length;
          const productsArray = [];

          for (let i = 0; i < len; i++) {
            const row = result.rows.item(i);
            productsArray.push({
              id: row.id,
              product_name: row.product_name,
              image_url: row.image_url,
              brands: row.brands,
              amount: row.amount,
            });
          }

          setProducts(productsArray.reverse());
        },
        (error) => {
          console.error("Error fetching products:", error);
        }
      );
    });
  };

  const handleProductPress = (productId) => {
    // Toggle the selected state for the product ID
    setSelectedProductIds((prevSelectedProductIds) => {
      if (prevSelectedProductIds.includes(productId)) {
        // Remove the ID if it's already selected
        return prevSelectedProductIds.filter((id) => id !== productId);
      } else {
        // Add the ID if it's not selected
        return [...prevSelectedProductIds, productId];
      }
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.productsContainer}
        contentContainerStyle={{ gap: 15 }}
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.productItem,
              {
                backgroundColor: selectedProductIds.includes(item.id)
                  ? "#456BFF"
                  : "#fff",
              },
            ]}
            onPress={() => handleProductPress(item.id)}
          >
            <View style={styles.productImageWrapper}>
              <Image
                style={styles.productImage}
                source={{ uri: item.image_url }}
              />
            </View>
            <View style={styles.productDetailWrapper}>
              <View>
                <Text
                  style={[
                    styles.productDetailBrand,
                    {
                      color: selectedProductIds.includes(item.id)
                        ? "white"
                        : "black",
                    },
                  ]}
                >
                  {item.brands}
                </Text>
                <Text
                  style={{
                    color: selectedProductIds.includes(item.id)
                      ? "white"
                      : "black",
                  }}
                >
                  {item.product_name}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      {selectedProductIds.length > 0 && (
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDoneButtonPress}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  productsContainer: {
    width: "100%",
    marginTop: 30,
    marginBottom: 30,
  },
  productItem: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    overflow: "hidden",
    flexDirection: "row",
  },
  productImageWrapper: {
    width: 90,
    height: 90,
    borderRadius: 30,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  productDetailWrapper: {
    padding: 10,
    justifyContent: "center",
  },
  productDetailBrand: {
    fontWeight: "700",
  },
  doneButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#456BFF",
    borderRadius: 15,
    padding: 10,
  },
  doneButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ShoppingListScreen;
