import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const getFeedForUser = async (userId) => {
  // Path variable para coincidir con @PathVariable del controlador
  const response = await api.get(`/feed/${userId}`);
  return response.data;
};

export const processSwipe = async (swipeRequest) => {
  // El @PostMapping("/swipe") espera un @RequestBody, enviamos JSON
  const response = await api.post(`/feed/swipe`, swipeRequest);
  return response.data;
};
