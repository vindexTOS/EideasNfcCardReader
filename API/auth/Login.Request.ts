import { loginType } from "@/types/Login.Types";
 

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiManager } from "../ApiManager";

export const LoginPostRequest = async (body: loginType): Promise<any> => {
  
    try {
      const res: any = await ApiManager("login", {
        method: "POST",
        data: body,
      
      });
      console.log(res.data)
      await AsyncStorage.setItem("token", res.data.token);
      return res;
    } catch (error) {
      console.log(error);
      const err: any = error;
      throw new Error(err);
    }
  };