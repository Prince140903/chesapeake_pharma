"use client";

import { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check, X } from "lucide-react";

interface SearchableSelectProps {
  label: string;
  placeholder?: string;
  selectedValues: string[];
  options: string[];
  onChange: (values: string[]) => void;
}

export function SearchableSelect({
  label,
  placeholder = "Search or select...",
  selectedValues = [],
  options = [],
  onChange,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const safeQuery = searchTerm.trim().toLowerCase();

  // Filter options based on typed search query
  const filteredOptions = options.filter((option) =>
    String(option ?? "").toLowerCase().includes(safeQuery)
  );

  const isOptionSelected = (opt: string) => {
    const target = opt.trim().toLowerCase();
    return selectedValues.some((v) => v.trim().toLowerCase() === target);
  };

  const toggleOption = (opt: string) => {
    const trimmed = opt.trim();
    if (isOptionSelected(trimmed)) {
      onChange(selectedValues.filter((v) => v.trim().toLowerCase() !== trimmed.toLowerCase()));
    } else {
      onChange([...selectedValues, trimmed]);
    }
    // Keep input focused for quick multi-selection
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const removeValue = (valToRemove: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange(selectedValues.filter((v) => v.trim().toLowerCase() !== valToRemove.trim().toLowerCase()));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
    setSearchTerm("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      e.preventDefault();
      const trimmed = searchTerm.trim();
      // If matches filteredOptions exact or first, toggle it; otherwise add as custom search filter
      const matched = filteredOptions.find(
        (o) => o.toLowerCase() === trimmed.toLowerCase()
      );
      toggleOption(matched || trimmed);
      setSearchTerm("");
    } else if (e.key === "Backspace" && !searchTerm && selectedValues.length > 0) {
      // Remove last badge on backspace if input is empty
      removeValue(selectedValues[selectedValues.length - 1]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-navy truncate">
          {label}
        </label>
        {selectedValues.length > 0 && (
          <span className="rounded-full bg-teal/15 px-1.5 py-0.2 text-[10px] font-bold text-teal">
            {selectedValues.length}
          </span>
        )}
      </div>

      <div
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className={`relative mt-2 flex min-h-[38px] cursor-text flex-wrap items-center gap-1.5 rounded border bg-white px-2.5 py-1.5 pr-14 text-sm transition-all ${
          isOpen
            ? "border-teal ring-1 ring-teal/30"
            : "border-line hover:border-slate-300"
        }`}
      >
        {/* Selected Value Badges */}
        {selectedValues.map((val) => (
          <span
            key={val}
            className="inline-flex max-w-[130px] items-center gap-1 rounded bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal"
          >
            <span className="truncate">{val}</span>
            <button
              type="button"
              onClick={(e) => removeValue(val, e)}
              className="text-teal hover:text-navy hover:bg-teal/20 rounded p-0.5 transition-colors"
            >
              <X size={11} />
            </button>
          </span>
        ))}

        {/* Search input */}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          placeholder={selectedValues.length === 0 ? placeholder : ""}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="min-w-[70px] flex-1 bg-transparent text-xs text-navy placeholder-muted outline-none"
          aria-autocomplete="list"
          aria-controls={listId}
        />

        {/* Clear & Dropdown icons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {(selectedValues.length > 0 || searchTerm) && (
            <button
              type="button"
              onClick={clearAll}
              className="p-1 text-muted hover:text-navy transition-colors rounded"
              title="Clear all"
            >
              <X size={13} />
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
              if (!isOpen) {
                inputRef.current?.focus();
              }
            }}
            className="p-1 text-muted hover:text-navy transition-colors rounded"
          >
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id={listId}
          className="absolute z-40 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-line bg-white py-1 shadow-lg text-sm"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const optStr = String(option ?? "");
              const isSelected = isOptionSelected(optStr);

              return (
                <button
                  key={optStr}
                  type="button"
                  onClick={() => toggleOption(optStr)}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-canvas ${
                    isSelected ? "bg-teal/5 font-semibold text-teal" : "text-navy"
                  }`}
                >
                  {/* Checkbox on left */}
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      isSelected
                        ? "border-teal bg-teal text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                  <span className="truncate flex-1">{optStr}</span>
                </button>
              );
            })
          ) : (
            <div className="px-3 py-2 text-xs text-muted">
              {safeQuery ? (
                <div className="flex flex-col gap-1">
                  <span>No options matching &quot;{searchTerm}&quot;</span>
                  <button
                    type="button"
                    onClick={() => {
                      toggleOption(searchTerm.trim());
                      setSearchTerm("");
                    }}
                    className="text-left text-teal font-semibold hover:underline"
                  >
                    + Filter by &quot;{searchTerm.trim()}&quot;
                  </button>
                </div>
              ) : (
                "No options available"
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
