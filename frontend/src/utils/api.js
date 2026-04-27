import axios from "axios";

const api = axios.create({
  baseURL: "https://smartparking.live", // 👈 IMPORTANT
});

export default api;