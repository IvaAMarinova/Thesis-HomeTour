import { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { HttpService } from '../services/http-service';

interface UserContextType {
  userId: number | null;
  setUserId: (id: number | null) => void;
  fetchUserId: () => Promise<void>;
  userType: UserType | null;
  userCompany?: string | null;
}

type UserType = "b2b" | "b2c";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [userCompany, setUserCompany] = useState<string | null>(null);

  const fetchUserId = useCallback(async () => {
    try {
      console.log("[UserContext] Fetching user auth/me...");
      const response = await HttpService.get<{ id: number; type: string; company: string }>('/auth/me/');
      console.log("[UserContext] Response: ", response);

      const type = response.type === "b2b" || response.type === "b2c" ? response.type : null;

      setUserId(response.id);
      setUserType(type);
      setUserCompany(response.company)
    } catch (error) {
      console.error("[UserContext] Error fetching user:", error);
      setUserId(null);
      setUserType(null);
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
