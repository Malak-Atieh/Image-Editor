import axios from "axios";
axios.defaults.baseURL = `http://localhost:8000/api/v1`; 
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";


export const request = async ({ method, route, body, headers,token=null, params = {} }) => {
  try {
    const requestHeaders = {
      ...headers,
      "Content-Type": "application/json"
    };
    const authToken = token || localStorage.getItem("token");

    if (authToken) {
      requestHeaders["Authorization"] = `Bearer ${authToken}`;
      console.log("Attaching token:", authToken); // Debug

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
    console.error("API Error:", error);

    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 422 && data.errors) {
        return {
          error: true,
          status,
          message: "Validation failed",
          errors: data.errors,
        };
      }

      if (status === 401) {
        return {
          error: true,
          status,
          message: data.message || "Unauthorized",
        };
      }

      return {
        error: true,
        status,
        message: data.message || `Request failed with status ${status}`,
      };
    }

    return {
      error: true,
      message: error.message || "Network error",
    };
  }
};
