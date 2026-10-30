import React from "react";
import AppHeader from "../components/navigation/AppHeader.jsx";

// Put your logo file in /assets and update this path if needed
const logo = require("../../assets/logo.png");

export default function StackHeader({ navigation, route, options, back }) {
  return (
    <AppHeader
      title="theFinTrack"
      showBack={!!back}
      onBack={() => navigation.goBack()}
      right={options?.headerRight ? options.headerRight() : null}
      logoSource={logo}
    />
  );
}