import api from "./api";

export const loginUser = (credentials) => api.post("/users/login", credentials);

export const registerUser = (userData) => api.post("/users/register", userData);

export const getUserProfile = (userId) => api.get(`/users/profile/${userId}`);

export const updateUserProfile = (userId, data) => api.put(`/users/profile/${userId}`, data);

export const toggleFavoriteStation = (userId, stationId) =>
  api.post("/users/favorites/toggle", { userId, stationId });

export const getUserFavorites = (userId) => api.get(`/users/favorites/${userId}`);
