"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { filterCities } from "@/lib/pakistan-cities"

interface CityAutocompleteProps {
  value: string
  onChange: (value: string) => void
  label?: string
  id?: string
  placeholder?: string
  required?: boolean
  error?: string
}

export default function CityAutocomplete({
  value,
  onChange,
  label = "City *",
  id = "city",
  placeholder = "Faisalabad",
  required = true,
  error,
}: CityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
        setHighlightIndex(-1)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    onChange(val)
    const filtered = filterCities(val)
    setSuggestions(filtered)
    setShowDropdown(filtered.length > 0 && val.length > 0)
    setHighlightIndex(-1)
  }

  const handleSelect = (city: string) => {
    setInputValue(city)
    onChange(city)
    setSuggestions([])
    setShowDropdown(false)
    setHighlightIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[highlightIndex])
    } else if (e.key === "Escape") {
      setShowDropdown(false)
      setHighlightIndex(-1)
    }
  }

  return (
    <div ref={wrapperRef} className="relative space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-text-primary">
        {label}
      </label>
      <input
        id={id}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => {
          const filtered = filterCities(inputValue)
          if (filtered.length > 0 && inputValue.length > 0) {
            setSuggestions(filtered)
            setShowDropdown(true)
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        aria-describedby={error ? `${id}-error` : undefined}
        aria-controls={showDropdown && suggestions.length > 0 ? `${id}-listbox` : undefined}
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        role="combobox"
        className="flex h-12 w-full rounded-[10px] bg-[#F9FAFB] border border-border px-4 py-3 text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
      />
      {suggestions.length > 0 && showDropdown && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((city, i) => (
            <li
              key={city}
              role="option"
              aria-selected={highlightIndex === i}
              onMouseDown={() => handleSelect(city)}
              onMouseEnter={() => setHighlightIndex(i)}
              className={`px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2 transition-colors ${
                highlightIndex === i ? "bg-[#25D366]/10 text-black" : "text-text-primary hover:bg-[#F9FAFB]"
              }`}
            >
              <svg className="w-3.5 h-3.5 shrink-0 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {city}
            </li>
          ))}
        </ul>
      )}
      {error && <p id={`${id}-error`} role="alert" className="text-xs text-error">{error}</p>}
    </div>
  )
}
