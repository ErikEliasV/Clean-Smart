import { useAuth } from '../contexts/AuthContext';

export const useTokenError = () => {
  const { handleTokenError } = useAuth();

  const checkTokenError = async (response: Response): Promise<boolean> => {
    if (response.status === 401 || response.status === 403) {
      await handleTokenError();
      return true;
    }
    return false;
  };

  return { checkTokenError };
};
