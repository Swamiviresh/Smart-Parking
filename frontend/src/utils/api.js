import axios from "axios";

const api = axios.create({
  baseURL: "https://smartparking.live/api", // 👈 IMPORTANT
});

export default api;