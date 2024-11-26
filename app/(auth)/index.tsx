import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LoginPostRequest } from "@/API/auth/Login.Request";
import { loginType } from "@/types/Login.Types";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuthUser";
import { useFocusEffect } from "@react-navigation/native";

export default function Login() {
  const [authInfo, setAuthInfo] = useState<loginType>({
    email: "",
    password: "",
  });
  const router = useRouter();

  const handleInput = (key: string, value: string) => {
    setAuthInfo((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const mutation = useMutation({
    mutationFn: (body: loginType) => {
      return LoginPostRequest(body);
    },
    onError: () => {
      Alert.alert("Error login", "Something went wrong", [{ text: "OK" }]);
    },
    onSuccess: () => {
      router.push("/(home)");
    },
  });

  const handleLogin = async () => {
    if (authInfo.email && authInfo.password) {
      await mutation.mutateAsync(authInfo);
    } else {
      Alert.alert(
        "Missing Information",
        "Please provide both email and password to proceed.",
        [{ text: "OK" }]
      );
    }
  };

  const { userInfo } = useAuth();

  useEffect(() => {
    if (userInfo?.sub) {
      router.push("/(home)");
    }
  }, [userInfo]);

  useFocusEffect(
    React.useCallback(() => {
      if (userInfo?.sub) {
        router.push("/(home)");
      }
    }, [userInfo])
  );

  if (!userInfo?.sub) {
    return (
      <View style={styles.container}>
        <TextInput
          value={authInfo.email}
          onChangeText={(text) => handleInput("email", text)}
          style={styles.input}
          placeholder="email"
          placeholderTextColor="white"
        />

        <TextInput
          onChangeText={(text) => handleInput("password", text)}
          value={authInfo.password}
          style={styles.input}
          placeholder="password"
          secureTextEntry
          placeholderTextColor="white"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    return null; // Or you can return a loading spinner if needed
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    padding: 20,
  },
  input: {
    width: "100%",
    height: 60,
    borderColor: "#ff073a",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 15,
    color: "white",
    fontSize: 18,
  },
  button: {
    width: "100%",
    height: 60,
    backgroundColor: "#ff073a",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
