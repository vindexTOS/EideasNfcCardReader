import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";

interface UserInfo {
 sub:string
}

export const useAuth = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string>("");

  const getToken = async () => {
    const t = await AsyncStorage.getItem("token");
    if (t) {
      setToken(t);
    }
  };

  useEffect(() => {
    getToken();
  }, []);

  useEffect(() => {
    console.log(token)
    if (token) {
      try {
        const decodedToken: any = jwt_decode(token);
        setUserInfo(decodedToken);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [token]);

  return { userInfo, token };
};
