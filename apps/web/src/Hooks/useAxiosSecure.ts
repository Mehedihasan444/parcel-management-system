import axios from "axios";
import type { AxiosInstance } from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";
import { API_BASE_URL } from "../config/api";

export const axiosSecure: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  // Cookies are the fallback session transport (Google OAuth logins carry no
  // Bearer token). Same-host deployments send them automatically.
  withCredentials: true,
});

let mounted = 0;
let reqId: number | null = null;
let resId: number | null = null;

const useAxiosSecure = (): AxiosInstance => {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    mounted += 1;

    if (mounted === 1) {
      reqId = axiosSecure.interceptors.request.use(
        (config) => {
          const token = localStorage.getItem("access-token");
          if (token) config.headers.authorization = `Bearer ${token}`;
          return config;
        },
        (error: unknown) => Promise.reject(error)
      );

      resId = axiosSecure.interceptors.response.use(
        (response) => response,
        async (error: unknown) => {
          const status = axios.isAxiosError(error) ? error.response?.status : undefined;
          if (status === 401 || status === 403) {
            try {
              await auth?.logOut();
            } finally {
              navigate("/login");
            }
          }
          return Promise.reject(error);
        }
      );
    }

    return () => {
      mounted -= 1;
      if (mounted === 0) {
        if (reqId !== null) axiosSecure.interceptors.request.eject(reqId);
        if (resId !== null) axiosSecure.interceptors.response.eject(resId);
        reqId = null;
        resId = null;
      }
    };
    // Interceptors are app-lifetime singletons; re-registering per render would duplicate them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return axiosSecure;
};

export default useAxiosSecure;
