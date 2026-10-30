import React, { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import AuthShell from "../../components/auth/AuthShell.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import { theme } from "../../theme/theme";
import { useAuth } from "../../store/AuthContext.js";

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing info", "Please enter email and password.");
      return;
    }
    try {
      setLoading(true);
      await signIn(email.trim(), password);
    } catch (e) {
      Alert.alert("Login failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Log In" subtitle="Track Your Finances">
      <View style={{ gap: 12 }}>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          autoComplete="email"
        />

        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          autoComplete="current-password"
        />

        <Button title={loading ? "Logging in..." : "Log In"} onPress={onLogin} disabled={loading} />

        <Pressable
          onPress={() => navigation.navigate("Signup")}
          style={{ paddingVertical: 8, alignItems: "center" }}
        >
          <Text style={{ color: theme.colors.muted }}>
            Don&apos;t have an account?{" "}
            <Text style={{ color: theme.colors.accent, fontWeight: "800" }}>Sign Up</Text>
          </Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}