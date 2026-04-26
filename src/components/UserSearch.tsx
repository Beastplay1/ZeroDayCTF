"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"] });

interface SearchResult {
  id: string | number;
  username: string;
  userTag?: string;
  avatarUrl?: string;
  type?: "user" | "team";
}

interface UserSearchProps {
  /** If provided, clicking a result calls this instead of navigating. */
  onSelect?: (user: SearchResult) => void;
  /** Placeholder text override */
  placeholder?: string;
  /** Search mode */
  searchType?: "users" | "all";
}

export function UserSearch({ onSelect, placeholder, searchType = "all" }: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          let data;
          if (searchType === "all") {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const json = await res.json();
            // Map global search results to SearchResult interface
            data = {
              users: (json.results || []).map((r: any) => ({
                id: r.id,
                type: r.type,
                username: r.name,
                userTag: r.tag,
                avatarUrl: r.avatarUrl,
              }))
            };
          } else {
            const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
            data = await res.json();
          }
          
          setResults(data.users || []);
          setIsOpen(true);
        } catch (e) {
          console.error("Search error", e);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (user: SearchResult) => {
    if (onSelect) {
      onSelect(user);
      setQuery("");
      setResults([]);
      setIsOpen(false);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full lg:w-64" ref={wrapperRef}>
      <div className="relative flex items-center">
        <svg
          className="absolute left-3 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen && e.target.value.trim().length >= 2) setIsOpen(true);
          }}
          placeholder={placeholder || "Search Users"}
          className="w-full bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-md pl-9 pr-8 py-2 focus:outline-none focus:border-zerogreen focus:ring-1 focus:ring-zerogreen transition-colors placeholder-gray-500 font-mono"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 text-gray-400 hover:text-white"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (query.trim().length >= 2) && (
        <div className="absolute top-full mt-2 left-0 w-[300px] bg-[#111827] border border-gray-700 rounded-md shadow-2xl overflow-hidden z-50">
          {isLoading && results.length === 0 ? (
            <div className="p-4 text-center text-gray-400 font-mono text-sm">Searching...</div>
          ) : results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {results.map((item) => {
                const isTeam = item.type === "team";
                const profileHref = isTeam 
                  ? `/teams/${item.id}` 
                  : `/profile/${encodeURIComponent(item.username + (item.userTag ? '#' + item.userTag : ''))}`;

                // If onSelect is provided, render a button instead of a Link
                if (onSelect) {
                  return (
                    <button
                      key={`${item.type || 'user'}-${item.id}`}
                      type="button"
                      className="flex items-center gap-3 p-3 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-0 w-full text-left"
                      onClick={() => handleResultClick(item)}
                    >
                      <div className={`w-10 h-10 ${isTeam ? 'rounded' : 'rounded-full'} flex-shrink-0 flex items-center justify-center font-bold text-lg overflow-hidden border border-zerogreen/50 ${item.avatarUrl ? 'bg-transparent' : 'bg-gradient-to-br from-zerogreen to-purple-500 text-black'}`}>
                        {item.avatarUrl ? (
                          <img src={item.avatarUrl} alt={item.username} className="w-full h-full object-cover" />
                        ) : (
                          item.username[0].toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-gray-200 font-bold truncate">
                          {item.username}
                          {item.userTag && <span className="text-gray-500 text-sm ml-1 font-mono">{isTeam ? `[${item.userTag}]` : `#${item.userTag}`}</span>}
                        </span>
                        <span className="text-gray-500 text-xs uppercase tracking-widest font-mono">{isTeam ? 'Team' : 'User'}</span>
                      </div>
                    </button>
                  );
                }

                return (
                  <Link
                    key={`${item.type || 'user'}-${item.id}`}
                    href={profileHref}
                    className="flex items-center gap-3 p-3 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-0"
                    onClick={() => handleResultClick(item)}
                  >
                    <div className={`w-10 h-10 ${isTeam ? 'rounded' : 'rounded-full'} flex-shrink-0 flex items-center justify-center font-bold text-lg overflow-hidden border border-zerogreen/50 ${item.avatarUrl ? 'bg-transparent' : 'bg-gradient-to-br from-zerogreen to-purple-500 text-black'}`}>
                      {item.avatarUrl ? (
                        <img src={item.avatarUrl} alt={item.username} className="w-full h-full object-cover" />
                      ) : (
                        item.username[0].toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-gray-200 font-bold truncate">
                        {item.username}
                        {item.userTag && <span className="text-gray-500 text-sm ml-1 font-mono">{isTeam ? `[${item.userTag}]` : `#${item.userTag}`}</span>}
                      </span>
                      <span className="text-gray-500 text-xs uppercase tracking-widest font-mono">{isTeam ? 'Team' : 'User'}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400 font-mono text-sm">No users found</div>
          )}
        </div>
      )}
    </div>
  );
}
