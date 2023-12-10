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
import { useFocusEffect } from "@react-navigation/native";
import Icons from "react-native-vector-icons/MaterialCommunityIcons";

const InventoryScreen = ({ navigation }) => {
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

  const handleDelete = (productId) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM Product WHERE id = ?",
        [productId],
        (tx, result) => {
          if (result.rowsAffected > 0) {
            console.log("Product deleted successfully");
            fetchProducts();
          }
        },
        (error) => {
          console.error("Error deleting product:", error);
        }
      );
    });
  };

  const handleDecrement = (productId, currentAmount) => {
    if (currentAmount > 0) {
      const newAmount = currentAmount - 1;
      updateAmount(productId, newAmount);
    }
  };

  const handleIncrement = (productId, currentAmount) => {
    const newAmount = currentAmount + 1;
    updateAmount(productId, newAmount);
  };

  const updateAmount = (productId, newAmount) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE Product SET amount = ? WHERE id = ?",
        [newAmount, productId],
        (tx, result) => {
          if (result.rowsAffected > 0) {
            console.log("Amount updated successfully");
            fetchProducts();
          }
        },
        (error) => {
          console.error("Error updating amount:", error);
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
        contentContainerStyle={{ gap: 15 }}
        style={styles.productsContainer}
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <View style={styles.productImageWrapper}>
              <Image
                style={styles.productImage}
                source={{ uri: item.image_url }}
              />
            </View>
            <View style={styles.productDetailWrapper}>
              <View>
                <Text style={styles.productDetailBrand}>{item.brands}</Text>
                <Text>{item.product_name}</Text>
              </View>
              <View style={styles.productSubContainer}>
                <View style={styles.amountContainer}>
                  <TouchableOpacity
                    style={styles.amountButton}
                    onPress={() => handleDecrement(item.id, item.amount)}
                    disabled={item.amount === 0}
                  >
                    <Text style={styles.amountButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.amountText}>{item.amount}</Text>
                  <TouchableOpacity
                    style={styles.amountButton}
                    onPress={() => handleIncrement(item.id, item.amount)}
                  >
                    <Text style={styles.amountButtonTextPlus}>+</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Icons style={styles.deleteButton} name="delete" size={26} />
                </TouchableOpacity>
              </View>
            </View>
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
  productsContainer: {
    width: "100%",
    marginTop: 30,
    marginBottom: 30,
  },
  productItem: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 40,
    overflow: "hidden",
    flexDirection: "row",
  },
  productImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 40,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  productDetailWrapper: {
    padding: 10,
    justifyContent: "space-between",
  },
  productDetailBrand: {
    fontWeight: "700",
  },
  productSubContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 220,
    alignItems: "center",
  },
  deleteButton: {
    color: "red",
    marginTop: 5,
    fontSize: 24,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  amountButton: {
    padding: 5,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  amountButtonText: {
    fontWeight: "700",
    fontSize: 24,
  },
  amountButtonTextPlus: {
    fontWeight: "700",
    fontSize: 23,
  },
  amountText: {
    fontSize: 16,
  },
});

export default InventoryScreen;
