//outdated spotlight, upgraded on 7/7/25

// import React from 'react';
// import { useState, useEffect, useRef } from "react";
// import { Sparkles, Send, Command } from "lucide-react";

// interface SpotlightProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSearch?: (query: string) => void;
//   onAskAI?: (question: string) => void;
// }

// const suggestions = [
//   "Open Chrome",
//   "Switch to Slack",
//   "Find my latest document",
//   "Summarize my morning session",
//   "What did I work on yesterday?",
//   "Close all background apps",
//   "Create new folder",
//   "Show me my productivity stats"
// ];

// export function Spotlight({ isOpen, onClose, onSearch, onAskAI }: SpotlightProps) {
//   const [query, setQuery] = useState("");
//   const [isAIMode, setIsAIMode] = useState(false);
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (isOpen) {
//       inputRef.current?.focus();
//       setQuery("");
//       setIsAIMode(false);
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (!isOpen) return;

//       if (e.key === 'Escape') {
//         onClose();
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown);
//     return () => document.removeEventListener('keydown', handleKeyDown);
//   }, [isOpen, onClose]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!query.trim()) return;

//     if (isAIMode || query.endsWith('?') || query.toLowerCase().includes('how') || query.toLowerCase().includes('what')) {
//       onAskAI?.(query);
//     } else {
//       onSearch?.(query);
//     }
    
//     setQuery("");
//     onClose();
//   };

//   const handleSuggestionClick = (suggestion: string) => {
//     setQuery(suggestion);
//     if (suggestion.includes('?') || suggestion.toLowerCase().includes('what') || suggestion.toLowerCase().includes('summarize')) {
//       setIsAIMode(true);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-2xl bg-dashboard-glass backdrop-blur-xl rounded-2xl shadow-dashboard-lg border border-border overflow-hidden">
//         {/* Header */}
//         <div className="p-6 border-b border-border">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="p-2 bg-primary/10 rounded-lg">
//               <Sparkles className="w-5 h-5 text-primary" />
//             </div>
//             <div>
//               <h2 className="font-semibold text-foreground">Cortex Spotlight</h2>
//               <p className="text-sm text-muted-foreground">Search anything or ask AI</p>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="relative">
//             <div className="flex items-center bg-card border border-border rounded-xl shadow-dashboard hover:shadow-dashboard-hover transition-all group">
//               <input
//                 ref={inputRef}
//                 type="text"
//                 value={query}
//                 onChange={(e) => {
//                   setQuery(e.target.value);
//                   const value = e.target.value;
//                   setIsAIMode(value.endsWith('?') || value.toLowerCase().includes('how') || value.toLowerCase().includes('what') || value.toLowerCase().includes('summarize'));
//                 }}
//                 placeholder="Search apps, ask questions, or give commands..."
//                 className="flex-1 px-4 py-4 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none rounded-xl"
//               />
//               <div className="flex items-center gap-2 pr-2">
//                 {isAIMode && (
//                   <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
//                     <Sparkles className="w-3 h-3" />
//                     <span>AI</span>
//                   </div>
//                 )}
//                 <button
//                   type="submit"
//                   disabled={!query.trim()}
//                   className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-colors"
//                 >
//                   <Send className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//           </form>
//         </div>

//         {/* Suggestions */}
//         <div className="p-6">
//           <h3 className="text-sm font-medium text-foreground mb-3">Suggestions</h3>
//           <div className="grid grid-cols-2 gap-2">
//             {suggestions.map((suggestion, index) => (
//               <button
//                 key={index}
//                 onClick={() => handleSuggestionClick(suggestion)}
//                 className="text-left p-3 bg-card hover:bg-card-hover border border-border rounded-lg transition-colors text-sm"
//               >
//                 {suggestion}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="px-6 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-1">
//               <Command className="w-3 h-3" />
//               <span>Space</span>
//               <span>to open</span>
//             </div>
//             <div className="flex items-center gap-1">
//               <span className="px-1 py-0.5 bg-muted rounded text-xs">esc</span>
//               <span>to close</span>
//             </div>
//           </div>
//           <div className="text-xs text-muted-foreground">
//             End with "?" for AI mode
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

