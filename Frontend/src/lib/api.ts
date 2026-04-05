const BASE_URL = import.meta.env.VITE_API_URL;
let logoutHandler: () => void = () => {};

export const setLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
};

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export const apiFetch = async (method: HttpMethod, path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const buildHeaders = (token?: string | null): HeadersInit => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  });

  let res = await fetch(`${BASE_URL}${path}`, {
    method: method,
    credentials: "include",
    ...options,
    headers: buildHeaders(token),
  });
  if (res.status === 401) {
    const refreshRes = await fetch(`${BASE_URL}/auth/refreshToken`, {
      method: "POST",
      credentials: "include"
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      localStorage.setItem("token", data.token);
      res = await fetch(`${BASE_URL}${path}`, {
        method: method,
        credentials: "include",
        ...options,
        headers: buildHeaders(token), 
      });
    } else {
      localStorage.removeItem("token");
      logoutHandler();
    };
  }
  return res;
};