export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const generateRandomId = (length: number = 8): string => {
  return Math.random().toString(36).substr(2, length);
};

export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
