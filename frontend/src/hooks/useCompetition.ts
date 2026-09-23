import { useCallback, useEffect, useState } from 'react';
import { competitionApi } from '../services/api';
import type { Competition } from '../types';

export function useCompetition() {
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      setCompetition(await competitionApi.get());
      setError(null);
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Something went wrong');
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runAction = async (action: () => Promise<unknown>) => {
    setActing(true);
    try {
      await action();
      await refresh(true);
      return true;
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Action failed');
      return false;
    } finally {
      setActing(false);
    }
  };

  return { competition, loading, acting, error, refresh, runAction, clearError: () => setError(null) };
}
