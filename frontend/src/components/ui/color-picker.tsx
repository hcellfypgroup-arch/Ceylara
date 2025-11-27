"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, X, Plus, Palette } from "lucide-react";
import { Input } from "./input";
import { Button } from "./button";

interface ColorOption {
  value: string;
  label: string;
  hex?: string;
}

interface ColorPickerProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  allowCustom?: boolean;
}

// Helper to extract hex code from color value
const extractHex = (colorValue: string): string => {
  // If it's already a hex code
  if (colorValue.startsWith("#")) {
    return colorValue;
  }
  // If it contains a hex code (format: "Name #HEX")
  const hexMatch = colorValue.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})/);
  if (hexMatch) {
    return hexMatch[0];
  }
  // Try to find in color map
  return COLOR_HEX_MAP[colorValue] || "#CCCCCC";
};

// Helper to get display name from color value
const getDisplayName = (colorValue: string): string => {
  // If it's just a hex code, return it
  if (colorValue.startsWith("#") && colorValue.length <= 7) {
    return colorValue.toUpperCase();
  }
  // If it contains a name and hex (format: "Name #HEX")
  const nameMatch = colorValue.match(/^([^#]+)/);
  if (nameMatch) {
    return nameMatch[0].trim();
  }
  return colorValue;
};

// Common color mappings
const COLOR_HEX_MAP: Record<string, string> = {
  Black: "#000000",
  White: "#FFFFFF",
  Beige: "#F5F5DC",
  Green: "#008000",
  Pink: "#FFC0CB",
  Blue: "#0000FF",
  Maroon: "#800000",
  Mustard: "#FFDB58",
  Sand: "#C2B280",
  Red: "#FF0000",
  Navy: "#000080",
  Grey: "#808080",
  Brown: "#A52A2A",
  Purple: "#800080",
  Yellow: "#FFFF00",
  Orange: "#FFA500",
};

const DEFAULT_COLORS: ColorOption[] = [
  { value: "Black", label: "Black", hex: COLOR_HEX_MAP.Black },
  { value: "White", label: "White", hex: COLOR_HEX_MAP.White },
  { value: "Beige", label: "Beige", hex: COLOR_HEX_MAP.Beige },
  { value: "Green", label: "Green", hex: COLOR_HEX_MAP.Green },
  { value: "Pink", label: "Pink", hex: COLOR_HEX_MAP.Pink },
  { value: "Blue", label: "Blue", hex: COLOR_HEX_MAP.Blue },
  { value: "Maroon", label: "Maroon", hex: COLOR_HEX_MAP.Maroon },
  { value: "Mustard", label: "Mustard", hex: COLOR_HEX_MAP.Mustard },
  { value: "Sand", label: "Sand", hex: COLOR_HEX_MAP.Sand },
  { value: "Red", label: "Red", hex: COLOR_HEX_MAP.Red },
  { value: "Navy", label: "Navy", hex: COLOR_HEX_MAP.Navy },
  { value: "Grey", label: "Grey", hex: COLOR_HEX_MAP.Grey },
  { value: "Brown", label: "Brown", hex: COLOR_HEX_MAP.Brown },
  { value: "Purple", label: "Purple", hex: COLOR_HEX_MAP.Purple },
  { value: "Yellow", label: "Yellow", hex: COLOR_HEX_MAP.Yellow },
  { value: "Orange", label: "Orange", hex: COLOR_HEX_MAP.Orange },
];

export const ColorPicker = ({
  value,
  onChange,
  placeholder = "Select colors...",
  className,
  allowCustom = true,
}: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#000000");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCustomInput(false);
        setShowColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleColor = (colorValue: string) => {
    if (value.includes(colorValue)) {
      onChange(value.filter((v) => v !== colorValue));
    } else {
      onChange([...value, colorValue]);
    }
  };

  const removeColor = (colorValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== colorValue));
  };

  const addCustomColor = () => {
    const name = customColorName.trim();
    const hex = customColorHex.toUpperCase();
    
    // If name is a hex code or empty, use just the hex
    let colorValue: string;
    if (!name || name === hex || /^#?[0-9A-Fa-f]{6}$/.test(name)) {
      colorValue = hex;
    } else {
      // Otherwise, combine name and hex
      colorValue = `${name} ${hex}`;
    }
    
    if (!value.includes(colorValue)) {
      onChange([...value, colorValue]);
      setCustomColorName("");
      setCustomColorHex("#000000");
      setShowCustomInput(false);
      setShowColorPicker(false);
    }
  };

  const addColorFromHex = (hex: string) => {
    const normalizedHex = hex.toUpperCase();
    if (!value.includes(normalizedHex)) {
      onChange([...value, normalizedHex]);
      setShowColorPicker(false);
    }
  };

  const selectedColors = value.map((v) => ({
    value: v,
    label: getDisplayName(v),
    hex: extractHex(v),
  }));

  // Combine default colors with any custom colors that aren't in defaults
  const allColors = [
    ...DEFAULT_COLORS,
    ...value
      .filter((v) => {
        const displayName = getDisplayName(v);
        return !DEFAULT_COLORS.find((c) => c.value === displayName);
      })
      .map((v) => ({
        value: v,
        label: getDisplayName(v),
        hex: extractHex(v),
      })),
  ];

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
          "min-h-[42px] flex items-center justify-between gap-2"
        )}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedColors.length > 0 ? (
            selectedColors.map((color) => (
              <span
                key={color.value}
                className="inline-flex items-center gap-1 rounded bg-[var(--accent)] px-2 py-0.5 text-xs"
                title={color.hex}
              >
                <span
                  className="inline-block w-3 h-3 rounded-full border border-[var(--border)] flex-shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="truncate max-w-[100px]">{color.label}</span>
                {color.hex !== color.label && (
                  <span className="text-[var(--muted)] font-mono text-[10px]">{color.hex}</span>
                )}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => removeColor(color.value, e)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      removeColor(color.value, e as any);
                    }
                  }}
                  className="hover:text-red-500 cursor-pointer flex-shrink-0"
                  aria-label={`Remove ${color.label}`}
                >
                  <X className="h-3 w-3" />
                </span>
              </span>
            ))
          ) : (
            <span className="text-[var(--muted)]">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[var(--muted)] transition-transform flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white shadow-lg max-h-80 overflow-auto">
          <div className="p-2">
            <div className="grid grid-cols-4 gap-2">
              {allColors.map((color) => {
                const isSelected = value.includes(color.value);
                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => toggleColor(color.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded hover:bg-[var(--accent)] transition-colors",
                      isSelected && "bg-[var(--accent)]"
                    )}
                    title={color.label}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        isSelected
                          ? "border-[var(--primary)] ring-2 ring-[var(--primary)] ring-offset-1"
                          : "border-[var(--border)]"
                      )}
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs text-center truncate w-full" title={color.hex}>
                      {color.label}
                    </span>
                    {color.hex !== color.label && (
                      <span className="text-[10px] text-[var(--muted)] font-mono">{color.hex}</span>
                    )}
                    {isSelected && (
                      <Check className="h-3 w-3 text-[var(--primary)]" />
                    )}
                  </button>
                );
              })}
            </div>

            {allowCustom && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-3">
                {showColorPicker ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-[var(--foreground)]">Pick Color:</label>
                      <input
                        type="color"
                        value={customColorHex}
                        onChange={(e) => setCustomColorHex(e.target.value)}
                        className="w-12 h-8 rounded border border-[var(--border)] cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={customColorHex.toUpperCase()}
                        onChange={(e) => {
                          const hex = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(hex) || /^[0-9A-Fa-f]{0,6}$/.test(hex)) {
                            setCustomColorHex(hex.startsWith("#") ? hex : `#${hex}`);
                          }
                        }}
                        placeholder="#000000"
                        className="flex-1 text-xs font-mono"
                        maxLength={7}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Color name (optional)"
                        value={customColorName}
                        onChange={(e) => setCustomColorName(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={addCustomColor}
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowColorPicker(false);
                          setCustomColorName("");
                          setCustomColorHex("#000000");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : showCustomInput ? (
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Enter hex code (e.g., #FF5733) or color name"
                        value={customColorName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomColorName(val);
                          // Auto-detect hex code
                          if (val.startsWith("#") && /^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                            if (val.length === 7) {
                              setCustomColorHex(val);
                            }
                          } else if (/^[0-9A-Fa-f]{6}$/.test(val)) {
                            setCustomColorHex(`#${val}`);
                          }
                        }}
                        className="flex-1"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={addCustomColor}
                          disabled={!customColorName.trim()}
                        >
                          Add
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowCustomInput(false);
                            setCustomColorName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] rounded transition-colors border border-[var(--border)]"
                    >
                      <Palette className="h-4 w-4" />
                      Pick Color
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] rounded transition-colors border border-[var(--border)]"
                    >
                      <Plus className="h-4 w-4" />
                      Enter Hex Code
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

