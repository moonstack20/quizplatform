import apiClient from "./client";

export async function fetchQuizzes(params = {}) {
  const res = await apiClient.get("/quizzes", { params });
  return res.data;
}

export async function fetchQuiz(id) {
  const res = await apiClient.get(`/quizzes/${id}`);
  return res.data;
}

export async function createQuiz(payload) {
  const res = await apiClient.post("/quizzes", payload);
  return res.data;
}

export async function updateQuiz(id, payload) {
  const res = await apiClient.put(`/quizzes/${id}`, payload);
  return res.data;
}

export async function deleteQuiz(id) {
  const res = await apiClient.delete(`/quizzes/${id}`);
  return res.data;
}

export async function togglePublish(id, status) {
  const res = await apiClient.patch(`/quizzes/${id}/publish`, { status });
  return res.data;
}
export async function startAttempt(quizId) {
    const res = await apiClient.post(`/quizzes/${quizId}/start`);
    return res.data;
  }
  
  export async function fetchAttempt(attemptId) {
    const res = await apiClient.get(`/attempts/${attemptId}`);
    return res.data;
  }
  
  export async function saveAnswer(attemptId, questionId, selectedOptionId) {
    const res = await apiClient.patch(`/attempts/${attemptId}/answer`, {
      question_id: questionId,
      selected_option_id: selectedOptionId,
    });
    return res.data;
  }
