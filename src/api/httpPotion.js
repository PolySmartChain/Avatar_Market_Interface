import axios from "axios";

const http = axios.create({
  baseURL: 'https://polyjetclub-backend.polysmartchain.com/',
  // baseURL: "https://polypotion.polysmartchain.com/api/",
  // baseURL: "http://192.168.1.5:8081/",

  headers: {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
  },
  timeout: 50000,
});

http.interceptors.request.use(function (config) {
  if (sessionStorage.getItem("Token") != null) {
    config.headers["Authorization"] =
      "Bearer " + sessionStorage.getItem("Token");
  }

  return config;
});

http.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default http;
