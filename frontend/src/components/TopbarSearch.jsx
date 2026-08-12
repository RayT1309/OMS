import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function TopbarSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        setResults(await api.search(query));
      } catch {
        setResults([]);
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goTo = (result) => {
    navigate(`/offenders/${result.offender_id}`);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="topbar-search" ref={boxRef}>
      <span className="topbar-search-icon">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <input
        type="search"
        placeholder="Search inmates, warrants…"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        aria-label="Global search"
      />
      {open && query.trim().length >= 2 && (
        <div className="topbar-search-results">
          {results.length === 0 ? (
            <div className="topbar-search-empty">No matches for “{query}”</div>
          ) : (
            results.map((r, idx) => (
              <div className="topbar-search-result" key={`${r.type}-${idx}`} onClick={() => goTo(r)}>
                <span className="topbar-search-result-title">{r.title}</span>
                <span className="topbar-search-result-meta">{r.meta}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
