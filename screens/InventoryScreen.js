import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import * as SQLite from "expo-sqlite";

const InventoryScreen = ({ navigation }) => {
  const db = SQLite.openDatabase("inventoryDatabase.db");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM Product",
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
            });
          }

          setProducts(productsArray);
        },
        (error) => {
          console.error("Error fetching products:", error);
        }
      );
    });
  }, [db]);

  const handleDelete = (productId) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM Product WHERE id = ?",
        [productId],
        (tx, result) => {
          if (result.rowsAffected > 0) {
            console.log("Product deleted successfully");
            // Refresh the products after deletion
            fetchProducts();
          }
        },
        (error) => {
          console.error("Error deleting product:", error);
        }
      );
    });
  };

  const fetchProducts = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM Product",
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
            });
          }

          setProducts(productsArray);
        },
        (error) => {
          console.error("Error fetching products:", error);
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Text>{item.brands}</Text>
            <Text>{item.product_name}</Text>
            <Image
              style={styles.productImage}
              source={{ uri: item.image_url }}
            />
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  productItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  productImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  deleteButton: {
    color: "red",
    marginTop: 5,
  },
});

export default InventoryScreen;
