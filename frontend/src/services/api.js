import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const getFeedForUser = async (userId, filtros = {}) => {
  const params = new URLSearchParams();
  
  if (filtros.municipio && filtros.municipio.trim() !== "") {
    params.append('municipio', filtros.municipio.trim());
  }
  
  if (filtros.precioMax) {
    params.append('precioMax', filtros.precioMax);
  }
  
  const response = await api.get(`/feed/${userId}?${params.toString()}`);
  return response.data;
};

export const processSwipe = async (swipeRequest) => {
  // El @PostMapping("/swipe") espera un @RequestBody, enviamos JSON
  const response = await api.post(`/feed/swipe`, swipeRequest);
  return response.data;
};

export const getPropertyDetails = async (id) => {
  const response = await api.get(`/inmuebles/${id}`);
  return response.data;
};

export const getMatchesForUser = async (userId) => {
  const response = await api.get(`/matches/${userId}`);
  return response.data;
};

// ── US-008: Feed de Candidatos (Swipe del Propietario) ──────────────────────

export const getCandidatosParaPropietario = async (propietarioId) => {
  const response = await api.get(`/propietario-feed/${propietarioId}`);
  return response.data;
};

export const swipeCandidato = async (swipeRequest) => {
  // body: { propietarioId, candidatoId, tipoInteraccion }
  const response = await api.post(`/propietario-feed/swipe`, swipeRequest);
  return response.data;
};

export const crearInmueble = async (inmuebleData) => {
  const response = await api.post(`/inmuebles`, inmuebleData);
  return response.data;
};