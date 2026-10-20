import api from "./api";

export const getNodes = (stationId) => api.get(`/navigation/nodes/station/${stationId}`);
export const createNode = (data) => api.post("/navigation/nodes", data);
export const updateNode = (id, data) => api.put(`/navigation/nodes/${id}`, data);
export const deleteNode = (id) => api.delete(`/navigation/nodes/${id}`);

export const getPaths = (stationId) => api.get(`/navigation/paths/station/${stationId}`);
export const createPath = (data) => api.post("/navigation/paths", data);
export const updatePath = (id, data) => api.put(`/navigation/paths/${id}`, data);
export const deletePath = (id) => api.delete(`/navigation/paths/${id}`);

export const calculateRoute = (payload) => api.post("/navigation/route", payload);
