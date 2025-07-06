import React from 'react';
import { useState } from "react";
import { ArrowRight } from "lucide-react";

interface SearchBarProps {
  onSubmit?: (query: string) => void;
}

export function SearchBar({ onSubmit }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit?.(query.trim());
      setQuery("");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-card border border-border rounded-2xl shadow-dashboard hover:shadow-dashboard-hover transition-shadow group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Cortex anything or type a command: open app, summarize work, find tab…"
            className="flex-1 px-6 py-4 bg-transparent text-card-foreground placeholder-muted-foreground focus:outline-none rounded-2xl"
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="mr-2 p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}