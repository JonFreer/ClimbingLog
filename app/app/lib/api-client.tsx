import AsyncStorage from "@react-native-async-storage/async-storage";
import Axios, { InternalAxiosRequestConfig } from "axios";

async function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = "application/json";
    config.headers.Authorization = `Bearer ${await AsyncStorage.getItem("token")}`;
  }

  config.withCredentials = true;
  return config;
}

export const api = Axios.create({
  baseURL: "https://depot.douvk.co.uk/api",
});

api.interceptors.request.use(authRequestInterceptor);
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API error:", error);
    const message = error.response?.data?.message || error.message;

    // if (error.response?.status !== 401) {
    //   useNotifications.getState().addNotification({
    //     type: "error",
    //     title: "Error",
    //     message,
    //   });
    // }

    // if (error.response?.status === 401) {
    //   const searchParams = new URLSearchParams();
    //   const redirectTo =
    //     searchParams.get('redirectTo') || window.location.pathname;
    //   window.location.href = paths.auth.login.getHref(redirectTo);
    // }

    return Promise.reject(error);
  }
);
