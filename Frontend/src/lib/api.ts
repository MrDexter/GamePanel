const BASE_URL = import.meta.env.VITE_API_URL;
let logoutHandler: () => void = () => {};

export const setLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
};

export const apiFetch = (path: string, options?: RequestInit) => {
  return fetch(`${BASE_URL}${path}`, options);
};

export const apiFetchPost = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  let res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...options.headers, // Allow overriding headers if needed
    },
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
        method: "POST",
        credentials: "include",
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(data.token ? { "Authorization": `Bearer ${data.token}` } : {}),
          ...options.headers, // Allow overriding headers if needed
        }, 
      });
    } else {
      localStorage.removeItem("token");
      logoutHandler();
    };
  }
  return res;
};