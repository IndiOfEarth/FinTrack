import React, { useEffect, useRef, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

// For onboarding
import CoachMarkOverlay from "../components/common/CoachMarkOverlay.jsx";
import { useTour } from "../store/TourContext.js";
import { Dimensions } from "react-native";

import DashboardScreen from "../screens/dashboard/DashboardScreen.jsx";
import LedgerStack from "./LedgerStack.jsx";
import InvestingStack from "./InvestingStack.jsx";
import SettingsStack from "./SettingsStack.jsx";

import FloatingAddButton from "./FloatingAddButton.jsx";
import TabBarBackground from "./TabBarBackground.jsx";
import { theme } from "../theme/theme";

const Tab = createBottomTabNavigator();

function EmptyScreen() {
  return null;
}

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // To do with onboarding
  const addBtnRef = useRef(null); // reference to the floating add button
  const { step, setStep, complete, shouldAutoStart, start } = useTour(); // get Tour state
  const [addRect, setAddRect] = useState(null); // the position of the add button on the screen
  const [spendingRect, setSpendingRect] = useState(null);

  // runs when shouldAutoStart changes
  // Starts the tour and changes the step currently on
  useEffect(() => {
    if (shouldAutoStart && step === null) start();
  }, [shouldAutoStart, step, start]);

  // STEP 0 effect
  // measures the button each time the step changes
  // needs to get new x, y, width, and height
  useEffect(() => {
    if (step === 0) {
      // measure after layout
      const t = setTimeout(() => {
        // gets the x, y, width, height on the screen
        addBtnRef.current?.measureInWindow?.((x, y, width, height) => {
          setAddRect({ x, y, width, height });
        });
      }, 50);
    }
  }, [step]);

  // STEP 1 effect
  // For the next step for the spending tab
  useEffect(() => {
    if (step === 1) {
      const { width: W, height: H } = Dimensions.get("window");

      const tabsCount = 5;
      const slotWidth = W / tabsCount;

      // Spending is index 1
      const centerX = slotWidth * 1 + slotWidth / 2;

      // Your tab bar height setup:
      const tabBarHeight = 62 + insets.bottom + 16;

      // Place rect around the icon area near the top of tab bar
      const rectWidth = 48;
      const rectHeight = 48;

      setSpendingRect({
        x: centerX - rectWidth / 2,
        y: H - tabBarHeight + 6, // 6px down from top of bar
        width: rectWidth,
        height: rectHeight,
      });
    }
  }, [step, insets.bottom]);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarHideOnKeyboard: true,

          tabBarStyle: {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "transparent",
            borderTopWidth: 0,
            elevation: 0,
            height: 62 + insets.bottom + 16,
            paddingBottom: insets.bottom + 10,
            paddingTop: 10,
          },
          tabBarBackground: () => <TabBarBackground />,
          tabBarActiveTintColor: theme.colors.accent,
          tabBarInactiveTintColor: "rgba(255,255,255,0.45)",
          tabBarItemStyle: { paddingTop: 2 },
          tabBarLabelStyle: { fontSize: 11, marginTop: 2 },

          tabBarIcon: ({ color, size, focused }) => {
            if (route.name === "Transaction") return null;

            let iconName = "ellipse";
            if (route.name === "Home")
              iconName = focused ? "home" : "home-outline";
            if (route.name === "Spending")
              iconName = focused ? "receipt" : "receipt-outline";
            if (route.name === "Investing")
              iconName = focused ? "trending-up" : "trending-up-outline";
            if (route.name === "Settings")
              iconName = focused ? "settings" : "settings-outline";

            return <Ionicons name={iconName} size={size ?? 24} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={DashboardScreen} />
        <Tab.Screen name="Spending" component={LedgerStack} />

        {/* Floating + Button */}
        <Tab.Screen
          name="Transaction"
          component={EmptyScreen}
          options={{
            tabBarLabel: "Transaction",
            tabBarButton: () => (
              <FloatingAddButton
                ref={addBtnRef}
                onPress={async () => {
                  await Haptics.selectionAsync();
                  navigation.navigate("AddTransaction"); // Opens the modal
                }}
              >
                <Ionicons name="add" size={32} color="#fff" />
              </FloatingAddButton>
            ),
          }}
        />

        <Tab.Screen name="Investing" component={InvestingStack} />
        <Tab.Screen name="Settings" component={SettingsStack} />
      </Tab.Navigator>

      {/* Rendering the overlay */}
      <CoachMarkOverlay
        visible={step === 0}
        title="Add a transaction"
        body="Tap the + button to add an income or expense."
        anchorRect={addRect}
        primaryText="Next"
        secondaryText="Skip"
        onPrimary={() => setStep(1)}
        onSecondary={() => complete()}
      />

      <CoachMarkOverlay
        visible={step === 1}
        title="Spending ledger"
        body="Head to the Spending tab to view, search and filter your transactions."
        anchorRect={spendingRect} // we can add a Spending tab ref next if you want (we can)
        primaryText="Done"
        secondaryText="Skip"
        onPrimary={() => setStep(2)}
        onSecondary={() => complete()}
      />
    </>
  );
}
