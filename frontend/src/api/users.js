import apiClient from "./client";

export async function fetchDashboardStats() {
  const res = await apiClient.get("/users/stats/dashboard");
  return res.data;
}

export async function fetchUsers(search = "") {
  const res = await apiClient.get("/users", { params: { search } });
  return res.data;
}

export async function fetchUserDetail(userId) {
  const res = await apiClient.get(`/users/${userId}`);
  return res.data;
}

export async function updateUserStatus(userId, status) {
  const res = await apiClient.patch(`/users/${userId}/status`, { status });
  return res.data;
}

export async function deleteUser(userId) {
  const res = await apiClient.delete(`/users/${userId}`);
  return res.data;
}
