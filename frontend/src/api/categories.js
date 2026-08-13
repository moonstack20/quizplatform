import apiClient from "./client";

export async function fetchCategories() {
  const res = await apiClient.get("/categories");
  return res.data;
}

export async function createCategory({ name, description }) {
  const res = await apiClient.post("/categories", { name, description });
  return res.data;
}

export async function updateCategory(id, { name, description }) {
  const res = await apiClient.put(`/categories/${id}`, { name, description });
  return res.data;
}

export async function deleteCategory(id) {
  const res = await apiClient.delete(`/categories/${id}`);
  return res.data;
}
