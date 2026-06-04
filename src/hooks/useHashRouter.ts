import { useState, useEffect, useCallback } from 'react';

export interface RouteState {
  path: string; // e.g., 'dashboard', 'orders', 'orders/new', 'orders/edit', 'customers', 'templates'
  params: {
    id?: string;
    status?: string;
  };
}

const parseHash = (hash: string): RouteState => {
  // Remove starting '#' and '/'
  const cleanHash = hash.replace(/^#\/?/, '');
  
  if (!cleanHash) {
    return { path: 'landing', params: {} };
  }

  // Handle query parameters if present (e.g. orders?status=pending)
  const [pathWithParams, queryString] = cleanHash.split('?');
  const pathParts = pathWithParams.split('/');

  const state: RouteState = {
    path: pathWithParams,
    params: {}
  };

  // Parse query string
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    const status = searchParams.get('status');
    if (status) state.params.status = status;
  }

  // Handle subpaths like orders/edit/ORD-123 or orders/new
  if (pathParts[0] === 'orders') {
    if (pathParts[1] === 'new') {
      state.path = 'orders/new';
    } else if (pathParts[1] === 'edit' && pathParts[2]) {
      state.path = 'orders/edit';
      state.params.id = decodeURIComponent(pathParts[2]);
    }
  }

  return state;
};

export function useHashRouter() {
  const [route, setRoute] = useState<RouteState>(() => parseHash(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Set default hash if empty
    if (!window.location.hash) {
      window.location.hash = '/landing';
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigate = useCallback((path: string, params?: { id?: string; status?: string }) => {
    let newHash = `/${path}`;
    
    if (path === 'orders/edit' && params?.id) {
      newHash = `/orders/edit/${encodeURIComponent(params.id)}`;
    } else if (path === 'orders/new') {
      newHash = `/orders/new`;
    } else if (params?.status) {
      newHash = `${newHash}?status=${encodeURIComponent(params.status)}`;
    }

    window.location.hash = newHash;
  }, []);

  return {
    ...route,
    navigate,
  };
}
