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

export const getUserDetails = async (id) => {
  const response = await api.get(`/usuarios/${id}`);
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

export const undoLastSwipe = async (userId) => {
  const response = await api.delete(`/feed/rewind/${userId}`);
  return response.data;
};

export const undoLastCandidatoSwipe = async (propietarioId) => {
  const response = await api.delete(`/feed/propietario-rewind/${propietarioId}`);
  return response.data;
};

export const getPublicFeed = async () => {
  const response = await api.get(`/feed/public`);
  return response.data;
};

export const crearGrupoBusqueda = async (usuarioId) => {
  const response = await api.post(`/usuarios/${usuarioId}/grupo/crear`);
  return response.data;
};

export const abandonarGrupoBusqueda = async (usuarioId) => {
  const response = await api.post(`/usuarios/${usuarioId}/grupo/abandonar`);
  return response.data;
};

export const unirseAGrupoBusqueda = async (usuarioId, codigo) => {
  const response = await api.post(`/usuarios/${usuarioId}/grupo/unirse`, { codigo });
  return response.data;
};

export const getMiembrosGrupo = async (usuarioId) => {
  const response = await api.get(`/usuarios/${usuarioId}/grupo/miembros`);
  return response.data;
};