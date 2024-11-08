import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { HttpService } from '../services/http-service';

interface UserContextType {
  userId: number | null;
  setUserId: (id: number | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await HttpService.get<{ id: number }>('/users/me/');
        setUserId(response.id);
        console.log("UserProvider: User ID fetched:", response.id);
      } catch (error) {
        console.error('Failed to fetch user ID:', error);
        setUserId(null);
      }
    };

    fetchUserId();
  }, []);

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
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
