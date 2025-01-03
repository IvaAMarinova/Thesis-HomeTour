import { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { HttpService } from '../services/http-service';

interface UserContextType {
  userId: number | null;
  setUserId: (id: number | null) => void;
  fetchUserId: () => Promise<void>;
  userType: UserType | null;
  userCompany?: string;
}

type UserType = "b2b" | "b2c";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [userCompany, setUserCompany] = useState<string | undefined>(undefined);

  const fetchUserId = useCallback(async () => {
    try {
      console.log("[UserContext] Checking authentication...");
      const isAuthenticated = await HttpService.isAuthenticated(async () => {
        console.log("[UserContext] Fetching user auth/me...");
        const response = await HttpService.get<Record<string, any>>('/auth/me/', undefined, true, false);
        console.log("[UserContext] Response: ", response);
        setUserId(response.id);
        setUserCompany(response.company);
        setUserType(response.type);
      });

      if (!isAuthenticated) {
        console.log("[UserContext] User is not authenticated.");
        setUserId(null);
        setUserCompany(undefined);
      }
    } catch (error) {
      console.error("[UserContext] Error fetching user ID:", error);

      setUserId(null);
      setUserType(null);
      setUserCompany(undefined);
    }
  }, []);

  return (
    <UserContext.Provider value={{ userId, setUserId, fetchUserId, userType, userCompany }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
