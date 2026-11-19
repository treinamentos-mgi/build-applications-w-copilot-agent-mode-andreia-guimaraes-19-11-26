import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

export type ResourceState<T> = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: T };

export function useJsonResource<T>(path: string): ResourceState<T> {
  const [state, setState] = useState<ResourceState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    getJson<T>(path)
      .then((data) => {
        if (active) setState({ status: 'ready', data });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => {
      active = false;
    };
  }, [path]);

  return state;
}
