import { useEffect, useState, useCallback, useRef } from 'react';
import { recordMaterialView, getMaterialViews } from '../firebase/materialViewService';

interface UseMaterialViewOptions {
  materialId: string;
  userId: string | null | undefined;
  onError?: (error: Error) => void;
}

interface UseMaterialViewReturn {
  views: number;
  isLoading: boolean;
  error: Error | null;
  recordView: () => Promise<boolean>;
}

/**
 * React Hook to handle material view tracking
 * Automatically records a view when the component mounts
 * Prevents duplicate views using Firestore queries
 * 
 * @param options - Configuration object with materialId and userId
 * @returns Object with views count, loading state, error, and manual recordView function
 * 
 * @example
 * const { views, isLoading, error } = useMaterialView({
 *   materialId: 'mat_123',
 *   userId: currentUser?.uid,
 * });
 */
export const useMaterialView = ({
  materialId,
  userId,
  onError
}: UseMaterialViewOptions): UseMaterialViewReturn => {
  const [views, setViews] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Use ref to track if we've already recorded a view for this material
  const hasRecordedRef = useRef<boolean>(false);

  /**
   * Manual function to record a view
   * Useful if you want to record views on specific user actions
   */
  const recordView = useCallback(async (): Promise<boolean> => {
    if (!materialId || !userId) {
      console.warn('⚠️ Cannot record view: missing materialId or userId');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const viewRecorded = await recordMaterialView(materialId, userId);

      if (viewRecorded) {
        // View was recorded, fetch updated count
        const updatedViews = await getMaterialViews(materialId);
        setViews(updatedViews);
        console.log('✅ View recorded successfully');
      } else {
        console.log('⏭️ View already recorded for this user');
      }

      return viewRecorded;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      console.error('❌ Error recording view:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [materialId, userId, onError]);

  /**
   * Effect hook to automatically record a view when component mounts
   * Only records once per material load to prevent duplicate counts
   */
  useEffect(() => {
    // Skip if missing required data
    if (!materialId || !userId) {
      return;
    }

    // Skip if we've already recorded a view for this material in this session
    if (hasRecordedRef.current) {
      return;
    }

    const recordViewOnMount = async () => {
      hasRecordedRef.current = true;
      await recordView();
    };

    recordViewOnMount();
  }, [materialId, userId, recordView]);

  /**
   * Effect to fetch current views count
   */
  useEffect(() => {
    if (!materialId) {
      return;
    }

    const fetchViews = async () => {
      try {
        const viewCount = await getMaterialViews(materialId);
        setViews(viewCount);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch views');
        setError(error);
        onError?.(error);
      }
    };

    fetchViews();
  }, [materialId, onError]);

  return {
    views,
    isLoading,
    error,
    recordView
  };
};

/**
 * Alternative hook for materials that should track views on specific events
 * Instead of automatically on mount, you manually call recordView()
 */
export const useMaterialViewManual = ({
  materialId,
  userId,
  onError
}: UseMaterialViewOptions): UseMaterialViewReturn => {
  const [views, setViews] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const recordView = useCallback(async (): Promise<boolean> => {
    if (!materialId || !userId) {
      console.warn('⚠️ Cannot record view: missing materialId or userId');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const viewRecorded = await recordMaterialView(materialId, userId);

      if (viewRecorded) {
        const updatedViews = await getMaterialViews(materialId);
        setViews(updatedViews);
        console.log('✅ View recorded successfully');
      } else {
        console.log('⏭️ View already recorded for this user');
      }

      return viewRecorded;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      console.error('❌ Error recording view:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [materialId, userId, onError]);

  // Only fetch views on mount, don't auto-record
  useEffect(() => {
    if (!materialId) {
      return;
    }

    const fetchViews = async () => {
      try {
        const viewCount = await getMaterialViews(materialId);
        setViews(viewCount);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch views');
        setError(error);
        onError?.(error);
      }
    };

    fetchViews();
  }, [materialId, onError]);

  return {
    views,
    isLoading,
    error,
    recordView
  };
};
