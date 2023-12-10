import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";
import InventoryScreen from "../screens/InventoryScreen";
import ShoppingListScreen from "../screens/ShoppingListScreen";
import ScanScreen from "../screens/ScanScreen";
import Icons from "react-native-vector-icons/MaterialCommunityIcons";
import Icons2 from "react-native-vector-icons/MaterialIcons";

const Tab = createBottomTabNavigator();

const CustomHeader = ({ title }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-end",
        height: 90,
        backgroundColor: "#456BFF",
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: 18,
          marginBottom: 15,
          fontWeight: "700",
        }}
      >
        {title}
      </Text>
    </View>
  );
};

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: [
          {
            backgroundColor: "#fff",
            height: 70,
            alignItems: "center",
            justifyContent: "center",
          },
          null,
        ],
        tabBarItemStyle: {
          marginTop: 10,
          marginBottom: 10,
        },
      }}
    >
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarIcon: () => <Icons2 name="inventory" size={26} />,
          header: (props) => <CustomHeader title="Inventory" {...props} />,
        }}
      />
      <Tab.Screen
        name="Scan Product"
        component={ScanScreen}
        options={{
          tabBarIcon: () => <Icons name="barcode-scan" size={26} />,
          headerStyle: {
            backgroundColor: "black",
          },
          headerTitleStyle: {
            color: "black",
          },
        }}
      />
      <Tab.Screen
        name="Shopping List"
        component={ShoppingListScreen}
        options={{
          tabBarLabel: "Shopping List",
          tabBarIcon: () => <Icons name="basket" size={26} />,
          header: (props) => <CustomHeader title="Shopping List" {...props} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
