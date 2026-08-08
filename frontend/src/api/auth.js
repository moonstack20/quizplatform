import apiClient from "./client";

export async function registerUser({ name, email, password }) {
  const res = await apiClient.post("/auth/register", { name, email, password });
  return res.data;
}

export async function loginUser({ email, password }) {
  const res = await apiClient.post("/auth/login", { email, password });
  return res.data;
}

export async function logoutUser() {
  const res = await apiClient.post("/auth/logout");
  return res.data;
}

export async function fetchCurrentUser() {
  const res = await apiClient.get("/auth/me");
  return res.data;
}
