import api from "./api";

export const loginAdmin = (credentials) => api.post("/admin/login", credentials);
