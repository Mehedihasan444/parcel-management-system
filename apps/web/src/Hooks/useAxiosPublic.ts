import axios from "axios";
import type { AxiosInstance } from "axios";
import { API_BASE_URL } from "../config/api";

const axiosPublic: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

const useAxiosPublic = (): AxiosInstance => {
  return axiosPublic;
};

export default useAxiosPublic;
