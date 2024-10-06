import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  // withCredentials: true, TODO: fix error when withCredentials set to true
});
