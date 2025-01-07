import { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { HttpService } from '../services/http-service';
import User from '@/interfaces/user-interface';

interface UserContextType {
  userId: string | null;
  setUserId: (id: string | null) => void;
  fetchUserId: () => Promise<void>;
  userType: UserType | null;
  userCompany?: string;
}

type UserType = "b2b" | "b2c";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [userCompany, setUserCompany] = useState<string | undefined>(undefined);

  const fetchUserId = useCallback(async () => {
    try {
      const isAuthenticated = await HttpService.isAuthenticated(async () => {
        const response = await HttpService.get<User>('/auth/me/', undefined, true, false);
        setUserId(response.id);
        setUserCompany(response.company);

        if (response.type === "b2b" || response.type === "b2c") {
          setUserType(response.type);
        }
      });

      if (!isAuthenticated) {
        setUserId(null);
        setUserCompany(undefined);
        setUserType(null);
      }
    } catch (error) {
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
