
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthContextType } from '../../types';
import useLocalStorage from '../../hooks/useLocalStorage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_USERNAME = 'jessieinberg';
const ADMIN_PASSWORD_USER = 'Jessynberg69666$$SS'; // Password for the user 'jessieinberg'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storedUsers, setStoredUsers] = useLocalStorage<User[]>('scrBaraholkaUsers', []);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('scrBaraholkaCurrentUser', null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure the special admin user 'jessieinberg' exists
    const adminUserExists = storedUsers.some(u => u.username === ADMIN_USERNAME);
    if (!adminUserExists) {
      const adminUser: User = {
        id: `admin-${ADMIN_USERNAME}-${Date.now()}`, // Unique ID
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD_USER, // INSECURE: For demo purposes only
        createdAt: Date.now(),
      };
      setStoredUsers(prevUsers => [...prevUsers, adminUser]);
    } else {
      // Optional: ensure password for jessieinberg is up-to-date if it was changed in code
      const existingAdmin = storedUsers.find(u => u.username === ADMIN_USERNAME);
      if (existingAdmin && existingAdmin.password !== ADMIN_PASSWORD_USER) {
        setStoredUsers(prevUsers => 
          prevUsers.map(u => 
            u.username === ADMIN_USERNAME ? { ...u, password: ADMIN_PASSWORD_USER } : u
          )
        );
      }
    }
    setIsLoading(false); // Initial setup including admin user check is done
  }, []); // Runs once on mount to check/initialize users in storage. setStoredUsers updates storage.

  // This useEffect is to set loading state based on currentUser from localStorage check.
  // It was slightly redundant with the above, so integrated the setIsLoading(false) into the user setup effect.
  // useEffect(() => {
  //   setIsLoading(false);
  // }, [currentUser]);


  const login = useCallback(async (username: string, passwordAttempt: string): Promise<User | null> => {
    setIsLoading(true);
    // Ensure users are loaded before attempting login, especially after the admin user check/add
    const currentStoredUsers = JSON.parse(localStorage.getItem('scrBaraholkaUsers') || '[]') as User[];
    const user = currentStoredUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (user && user.password === passwordAttempt) { 
      setCurrentUser(user);
      setIsLoading(false);
      return user;
    }
    setCurrentUser(null);
    setIsLoading(false);
    return null;
  }, [setCurrentUser]); // Removed storedUsers from deps as it's read fresh

  const register = useCallback(async (username: string, passwordAttempt: string): Promise<User | null> => {
    setIsLoading(true);
    const currentStoredUsers = JSON.parse(localStorage.getItem('scrBaraholkaUsers') || '[]') as User[];
    if (currentStoredUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      setIsLoading(false);
      return null; // Username already exists
    }
    const newUser: User = {
      id: String(Date.now() + Math.random()), 
      username,
      password: passwordAttempt, 
      createdAt: Date.now(), 
    };
    setStoredUsers(prevUsers => [...prevUsers, newUser]); // Relies on setStoredUsers from useLocalStorage
    setCurrentUser(newUser);
    setIsLoading(false);
    return newUser;
  }, [setStoredUsers, setCurrentUser]); // Removed storedUsers from deps

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, [setCurrentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, users: storedUsers, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
