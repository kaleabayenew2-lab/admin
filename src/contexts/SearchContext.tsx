import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import api from '../services/api';

type SearchResult = { type: string; id: string; title: string; subtitle?: string; url?: string };

type SearchContextType = {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  searching: boolean;
};

const SearchContext = createContext<SearchContextType | null>(null);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!query) { setResults([]); setSearching(false); return; }
    setSearching(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      const q = query.trim();
      const res: SearchResult[] = [];
      try {
        // facilities
        const f = await api.get(`/api/facilities?search=${encodeURIComponent(q)}&limit=5`);
        if (f && f.data && Array.isArray(f.data)) {
          f.data.forEach((it: any) => res.push({ type: 'facility', id: it._id || it.id, title: it.name || it.title || it._id, subtitle: it.address || '' , url: `/map` }));
        }
      } catch (e) { /* ignore */ }
      try {
        const u = await api.get(`/api/admin/users?search=${encodeURIComponent(q)}&limit=5`);
        if (u && u.data && Array.isArray(u.data)) {
          u.data.forEach((it: any) => res.push({ type: 'user', id: it._id || it.id, title: it.fullName || it.email || it._id, subtitle: it.email || '' , url: `/users` }));
        }
      } catch (e) { /* ignore */ }

      try {
        const c = await api.get(`/api/admin/content?search=${encodeURIComponent(q)}&limit=5`);
        if (c && c.data && Array.isArray(c.data)) {
          c.data.forEach((it: any) => res.push({ type: 'content', id: it._id || it.id, title: it.title || it._id, subtitle: it.kind || '' , url: `/content` }));
        }
      } catch (e) { /* ignore */ }

      setResults(res.slice(0, 10));
      setSearching(false);
    }, 300) as unknown as number;

    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [query]);

  return (
    <SearchContext.Provider value={{ query, setQuery, results, searching }}>
      {children}
    </SearchContext.Provider>
  );
};

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used inside SearchProvider');
  return ctx;
}

export type { SearchResult };

export default SearchContext;
