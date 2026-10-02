import { useContext } from "react";
import { AuthContext } from "../AuthProvider/AuthContext";
import type { AuthInfo } from "../AuthProvider/AuthContext";

const useAuth = (): AuthInfo | null => {
  const auth = useContext(AuthContext);
  return auth;
};

export default useAuth;
