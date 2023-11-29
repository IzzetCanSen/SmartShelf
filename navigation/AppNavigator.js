import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import InventoryScreen from "../screens/InventoryScreen";
import ShoppingListScreen from "../screens/ShoppingListScreen";
import ScanScreen from "../screens/ScanScreen";
import Icons from "react-native-vector-icons/MaterialCommunityIcons";
import Icons2 from "react-native-vector-icons/MaterialIcons";

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: [
          {
            height: 70,
          },
          null,
        ],
      }}
    >
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: "Inventory",
          tabBarIcon: () => <Icons2 name="inventory" size={26} />,
        }}
      />
      <Tab.Screen
        name="Scan Product"
        component={ScanScreen}
        options={{
          tabBarLabel: "Scan",
          tabBarIcon: () => <Icons name="barcode-scan" size={26} />,
        }}
      />
      <Tab.Screen
        name="Shopping List"
        component={ShoppingListScreen}
        options={{
          tabBarLabel: "Shopping List",
          tabBarIcon: () => <Icons name="basket" size={26} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
