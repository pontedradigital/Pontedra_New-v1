import { User } from "@/context/AuthContext";

const MOCK_USERS: Record<string, User> = {
  "master@teste.com": { email: "master@teste.com", role: "master" },
  "cliente@teste.com": { email: "cliente@teste.com", role: "client" },
};

const MOCK_PASSWORD = "1234Mudar";

export const loginService = async (email: string, password: string): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = MOCK_USERS[email];
      if (user && password === MOCK_PASSWORD) {
        resolve(user);
      } else {
        resolve(null);
      }
    }, 500); // Simulate network delay
  });
};

export const registerService = async (email: string, password: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, this would interact with a backend to create a new user.
      // For this mock, we'll just assume success if the email isn't already taken.
      if (MOCK_USERS[email]) {
        resolve(false); // User already exists
      } else {
        // We don't actually add to MOCK_USERS here to keep the mock simple
        // and focused on the predefined users.
        resolve(true); // Registration successful
      }
    }, 500);
  });
};