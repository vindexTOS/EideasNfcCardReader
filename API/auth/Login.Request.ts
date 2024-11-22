import { loginType } from "@/types/Login.Types";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Import axios for interceptors
import { ApiManager } from "../ApiManager";

// Add Axios Interceptors for logging requests and responses
axios.interceptors.request.use(
  request => {
    console.log('Starting Request:', JSON.stringify(request, null, 2));
    return request;
  },
  error => {
    console.error('Request Error:', JSON.stringify(error, null, 2));
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    console.log('Response:', JSON.stringify(response, null, 2));
    return response;
  },
  error => {
    console.error('Response Error:', JSON.stringify(error, null, 2));
    return Promise.reject(error);
  }
);

export const LoginPostRequest = async (body: loginType): Promise<any> => {
  try {
    const res: any = await ApiManager("login", {
      method: "POST",
      data: body,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    await AsyncStorage.setItem("token", res.data.token);
    return res;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Error Message:', error.message);
      console.log('Error Code:', error.code);
      
      if (error.response) {
        console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
        console.log('Response Status:', error.response.status);
        console.log('Response Headers:', JSON.stringify(error.response.headers, null, 2));
      } else if (error.request) {
        console.log('Request Details:', JSON.stringify(error.request, null, 2));
      } else {
        console.log('General Error:', JSON.stringify(error, null, 2));
      }
    } else {
      console.error('Non-Axios Error:', error);
    }

    // Throw the error again for further error handling upstream
    throw error;
  }
};
