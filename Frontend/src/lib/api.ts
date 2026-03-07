const BASE_URL = import.meta.env.VITE_API_URL;

export const apiFetch = (path: string, options?: RequestInit) => {
  return fetch(`${BASE_URL}${path}`, options);
};

export const apiFetchPost = (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`${BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...options.headers, // Allow overriding headers if needed
    },
  });
};