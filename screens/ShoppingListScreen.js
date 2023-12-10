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

  useEffect(() => {
    fetchProducts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
    }, [])
  );

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
});

export default ShoppingListScreen;
