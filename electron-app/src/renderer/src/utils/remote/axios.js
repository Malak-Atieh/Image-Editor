import axios from "axios";
import { BASE_URL } from "../../../env";
import {getAuthToken} from "../../apis/remote";
axios.defaults.baseURL = `${BASE_URL}hr`; 
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";


export const request = async ({ method, route, body, headers,token=null, params = {} }) => {
  try {
    const requestHeaders = {
      ...headers,
      "Content-Type": "application/json"
    };
    token = getAuthToken()
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
    const response = await axios.request({
      method, 
      headers:requestHeaders,
      url: route,
      data: body,
      params,
    });
    return response.data;
  } catch (error) {
    console.error("API Request Error:", error); 
    if (error.response) {
      return {
        error: true,
        status: error.response.status,
        message: error.response.data?.message || "API Error",
      };
    } else if (error.request) {
      return {
        error: true,
        message: "Network error. Check your connection.",
      };
    } else {
    return {
      error: true,
      message: error.response ? error.response.data : error.message,
    };
  }
  }
};
