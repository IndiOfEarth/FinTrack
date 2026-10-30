import React, { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import AuthShell from "../../components/auth/AuthShell.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import { theme } from "../../theme/theme";
import { useAuth } from "../../store/AuthContext.js";

export default function SignupScreen({ navigation }) {
  const { signUp } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    if (!displayName.trim() || !email.trim() || !password || !confirm) {
      Alert.alert("Missing info", "Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      Alert.alert(
        "Passwords don't match",
        "Please make sure both passwords are the same.",
      );
      return;
    }

    try {
      setLoading(true);
      await signUp(email.trim(), password, displayName.trim());
    } catch (e) {
      Alert.alert("Sign up failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Sign Up" subtitle="Create your account">
      <View style={{ gap: 12 }}>
        <Input
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Full Name"
          autoCapitalize="words"
        />

        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          autoComplete="new-password"
        />

        <Input
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Confirm Password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          autoComplete="new-password"
        />

        <Button
          title={loading ? "Signing up..." : "Sign Up"}
          onPress={onSignup}
          disabled={loading}
        />

        <Text
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: 12,
            textAlign: "center",
            marginTop: 2,
          }}
        >
          By signing up, you agree to our{" "}
          <Text style={{ color: theme.colors.accent, fontWeight: "800" }}>
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text style={{ color: theme.colors.accent, fontWeight: "800" }}>
            Privacy Policy
          </Text>
          .
        </Text>

        <Pressable
          onPress={() => navigation.navigate("Login")}
          style={{ paddingVertical: 8, alignItems: "center" }}
        >
          <Text style={{ color: theme.colors.muted }}>
            Already have an account?{" "}
            <Text style={{ color: theme.colors.accent, fontWeight: "800" }}>
              Log In
            </Text>
          </Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}
