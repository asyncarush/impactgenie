import axios from "axios";

// Define the ML workload API error response structure
const API_ML = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export async function getVideoMLSuggestions() {
  try {
    const response = await API_ML.get("/api/ml/uploadVideo");
    return response.data;
  } catch (err) {
    console.error("Error in getting suggestion from ML :", err);
  }
}
