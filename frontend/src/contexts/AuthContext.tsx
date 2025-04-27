import { createContext, useEffect, useState } from "react";
import { getLoggedInUser } from "../auth";
import { Hub } from "aws-amplify/utils";
import { signOut, signInWithRedirect } from 'aws-amplify/auth';
import { CurrentUser } from "@common/types/CurrentUser";

interface AuthContextType {
  currentUser: CurrentUser | null,
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: () => { },
  logout: () => { }
  }
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      setCurrentUser(await getLoggedInUser());
    }
    checkAuth();

    Hub.listen("auth", async ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
          await checkAuth();
          return;
      }
    });
  }, []);

  const login = async () => {
    await signInWithRedirect({});
  };

  const logout = async () => {
    await signOut();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};