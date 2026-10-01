import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";
import { API_BASE_URL } from "../config/api";

export const axiosSecure = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

let mounted = 0;
let reqId = null;
let resId = null;

const useAxiosSecure = () => {
  const navigate = useNavigate();
  const { logOut } = useAuth();

  useEffect(() => {
    mounted += 1;

    if (mounted === 1) {
      reqId = axiosSecure.interceptors.request.use(
        (config) => {
          const token = localStorage.getItem("access-token");
          if (token) config.headers.authorization = `Bearer ${token}`;
          return config;
        },
        (error) => Promise.reject(error)
      );

      resId = axiosSecure.interceptors.response.use(
        (response) => response,
        async (error) => {
          const status = error.response?.status;
          if (status === 401 || status === 403) {
            try {
              await logOut();
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
