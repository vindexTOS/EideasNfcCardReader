import axios from "axios";
import { envirement } from "../envirement/env";
 
export const ApiManagerUmbraco = axios.create({
  baseURL: envirement.baseUrl,

  responseType: "json",
  withCredentials: true,
  httpsAgent: {
    rejectUnauthorized: false,
  },
});