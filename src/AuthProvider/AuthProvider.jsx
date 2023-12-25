import { createContext, useEffect, useState } from "react";
import {GoogleAuthProvider,createUserWithEmailAndPassword,onAuthStateChanged,signInWithEmailAndPassword,signInWithPopup,signOut,updateProfile,} from "firebase/auth";
import auth from "../Firebase/firebase.config";
import useAxiosPublic from "../Hooks/useAxiosPublic";
import Swal from "sweetalert2";
export const AuthContext = createContext(null);

const AuthProvider = ({children}) => {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const googleProvider = new GoogleAuthProvider();
  const axiosPublic = useAxiosPublic();
 
  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };
  const googleLogin = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };

  const logOut = () => {
    setLoading(true);
    return signOut(auth);
  };

  const updateUserProfile = (name, photo) => {
    return updateProfile(auth.currentUser, {
      displayName: name,
      photoURL: photo,
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // get token and store client
        const userInfo = { 
          name: currentUser.displayName,
          email: currentUser.email,
        image: currentUser.photoURL,
       role:'user'
        };
        axiosPublic.post("/jwt", userInfo).then((res) => {
          // console.log("hi",res.data.token)
          if (res.data.token) {
            localStorage.setItem("access-token", res.data.token);
          }
        });

        axiosPublic.post("/users", userInfo)
        .then((res) => {
           console.log(res.data)
        })
      } else {
        // TODO: remove token (if token stored in the client side: Local storage, caching, in memory)
        localStorage.removeItem("access-token");
      }
      setLoading(false);
    });
    return () => {
      return unsubscribe();
    };
  }, [axiosPublic]);
 
  const authInfo = {
    user,
    createUser,
    login,
    logOut,
    updateUserProfile,
    googleLogin,
    loading,
  };
  return <AuthContext.Provider value={authInfo}>
  {children}
</AuthContext.Provider>
};

export default AuthProvider;
