"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  X, Plus,
  PhoneCall, UserPlus, Building2, Star, Zap,
  Globe, Link2, Megaphone, HelpCircle, Users,
  ShoppingBag, Handshake, Radio, Mail, Tv,
} from "lucide-react";

// ─── Available icons ──────────────────────────────────────────────────────────

export const SOURCE_ICONS: { name: string; icon: LucideIcon }[] = [
  { name: "PhoneCall",   icon: PhoneCall   },
  { name: "UserPlus",    icon: UserPlus    },
  { name: "Building2",   icon: Building2   },
  { name: "Star",        icon: Star        },
  { name: "Zap",         icon: Zap         },
  { name: "Globe",       icon: Globe       },
  { name: "Link2",       icon: Link2       },
  { name: "Megaphone",   icon: Megaphone   },
  { name: "HelpCircle",  icon: HelpCircle  },
  { name: "Users",       icon: Users       },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Handshake",   icon: Handshake   },
  { name: "Radio",       icon: Radio       },
  { name: "Mail",        icon: Mail        },
  { name: "Tv",          icon: Tv          },
];

export function getSourceIcon(name?: string): LucideIcon {
  return SOURCE_ICONS.find((s) => s.name === name)?.icon ?? Users;
}

// ─── Colors ───────────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  "#3B82F6", "#8B5CF6", "#10B981", "#06B6D4",
  "#F59E0B", "#EF4444", "#1877F2", "#0A66C2",
  "#D97706", "#94A3B8", "#EC4899", "#14B8A6",
  "#F97316", "#6366F1", "#84CC16", "#0EA5E9",
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddSourceModalProps {
  onSave: (name: string, color: string, iconName: string) => void;
  onCancel: () => void;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function AddSourceModal({ onSave, onCancel }: AddSourceModalProps) {
  const [name,      setName]      = useState("");
  const [color,     setColor]     = useState(PRESET_COLORS[0]);
  const [custom,    setCustom]    = useState("");
  const [iconName,  setIconName]  = useState("Users");
  const [attempted, setAttempted] = useState(false);

  const activeColor = custom.match(/^#[0-9A-Fa-f]{6}$/) ? custom : color;
  const nameError   = attempted && name.trim() === "";
  const PreviewIcon = getSourceIcon(iconName);

  function handleSave() {
    setAttempted(true);
    if (name.trim() === "") return;
    onSave(name.trim(), activeColor, iconName);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl w-[440px] mx-4 shadow-[0_24px_64px_rgba(0,0,0,0.22)] overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: activeColor + "22" }}>
              <PreviewIcon size={16} style={{ color: activeColor }} />
            </div>
            <h2 className="text-[15px] font-bold text-slate-900">Add New Source</h2>
          </div>
          <button type="button" onClick={onCancel} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5">

          {/* Source name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-700">
              Source Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Trade Show, Event, Partner..."
              autoFocus
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-400 transition-colors ${
                nameError ? "border-red-300 bg-red-50/40" : "border-slate-200"
              }`}
            />
            {nameError && <p className="text-xs text-red-500">Source name is required.</p>}
          </div>

          {/* Icon picker */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-slate-700">Source Icon</label>
            <div className="grid grid-cols-5 gap-2">
              {SOURCE_ICONS.map(({ name: n, icon: Icon }) => {
                const isActive = iconName === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setIconName(n)}
                    title={n}
                    className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border-2 transition-all duration-150 ${
                      isActive
                        ? "border-transparent"
                        : "border-slate-100 hover:border-slate-200 bg-white"
                    }`}
                    style={isActive ? { backgroundColor: activeColor + "18", borderColor: activeColor + "60" } : {}}
                  >
                    <Icon size={18} style={{ color: isActive ? activeColor : "#94A3B8" }} />
                    <span className="text-[10px] font-medium leading-none" style={{ color: isActive ? activeColor : "#94A3B8" }}>
                      {n.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Badge color */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-slate-700">Badge Color</label>

            {/* Live preview */}
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium border"
                style={{ borderColor: activeColor + "66", color: activeColor, backgroundColor: activeColor + "11" }}
              >
                <PreviewIcon size={11} />
                {name || "Preview"}
              </span>
            </div>

            {/* Preset swatches */}
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setColor(c); setCustom(""); }}
                  className={`w-8 h-8 rounded-lg transition-all duration-100 ${
                    activeColor === c ? "ring-2 ring-offset-1 ring-slate-700 scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            {/* Custom hex */}
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-8 h-8 rounded-lg border border-slate-200 flex-shrink-0"
                style={{ backgroundColor: custom.match(/^#[0-9A-Fa-f]{6}$/) ? custom : "#f1f5f9" }}
              />
              <input
                type="text"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="#1a2b3c"
                maxLength={7}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-400 font-mono"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onCancel} className="flex-1 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white transition-colors" style={{ backgroundColor: activeColor }}>
              Add Source
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
