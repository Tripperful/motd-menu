import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useGoBack = () => {
  const nav = useNavigate();
  return useCallback(() => nav('..', { relative: 'path' }), [nav]);
};
