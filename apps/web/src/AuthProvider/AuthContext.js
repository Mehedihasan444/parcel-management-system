import { createContext } from "react";

/** Shared auth context — lives here (not in AuthProvider.jsx) so the
 *  provider file only exports a component (react-refresh rule). */
export const AuthContext = createContext(null);

export default AuthContext;
