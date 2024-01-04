import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useGoBack = () => {
  const nav = useNavigate();
  return useCallback(
    (levels = 1) => nav('../'.repeat(levels), { relative: 'path' }),
    [nav],
  );
};
