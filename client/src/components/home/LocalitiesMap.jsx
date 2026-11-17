import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Shared Delhi localities map.
 * @param {object[]} localities - { _id?, name, status, x, y }
 * @param {boolean} interactive - enable drag-to-reposition
 * @param {string|null} selectedId
 * @param {(id: string) => void} onSelect
 * @param {(id: string, x: number, y: number) => void} onPositionChange - called on drag end
 * @param {boolean} showLegend
 * @param {string} className - outer map frame classes
 */
const LocalitiesMap = ({
  localities = [],
  interactive = false,
  selectedId = null,
  onSelect,
  onPositionChange,
  showLegend = true,
  /** 'desktop' | 'mobile' forces a fixed preview frame; omit for responsive home map */
  viewport = null,
  className = '',
}) => {
  const mapRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);
  const dragStateRef = useRef(null);

  const sizeClass =
    viewport === 'mobile'
      ? 'w-full max-w-[24rem] mx-auto h-[30rem] min-h-[30rem] max-h-[30rem]'
      : viewport === 'desktop'
        ? 'w-full h-96 min-h-96 max-h-96'
        : 'min-h-[26rem] sm:min-h-[24rem] h-[62vw] max-h-[30rem] sm:h-96';

  const updateDragPosition = useCallback((clientX, clientY) => {
    const mapEl = mapRef.current;
    const drag = dragStateRef.current;
    if (!mapEl || !drag) return null;
    const rect = mapEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 4, 96);
    const y = clamp(((clientY - rect.top) / rect.height) * 100, 6, 94);
    drag.x = Math.round(x * 10) / 10;
    drag.y = Math.round(y * 10) / 10;
    return { id: drag.id, x: drag.x, y: drag.y };
  }, []);

  const onPointerDown = (event, locality) => {
    if (!interactive || !locality?._id) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect?.(locality._id);
    const id = locality._id;
    dragStateRef.current = { id, x: locality.x, y: locality.y };
    setDraggingId(id);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!interactive || !draggingId) return;
    const next = updateDragPosition(event.clientX, event.clientY);
    if (next) {
      onPositionChange?.(next.id, next.x, next.y, { live: true });
    }
  };

  const endDrag = (event) => {
    if (!interactive || !draggingId) return;
    const next = updateDragPosition(event.clientX, event.clientY);
    const id = draggingId;
    dragStateRef.current = null;
    setDraggingId(null);
    if (next) {
      onPositionChange?.(next.id, next.x, next.y, { live: false });
    } else if (id) {
      const loc = localities.find((l) => l._id === id);
      if (loc) onPositionChange?.(id, loc.x, loc.y, { live: false });
    }
  };

  return (
    <div
      ref={mapRef}
      className={`relative bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 touch-none ${sizeClass} ${className}`}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.45) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.45) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />

      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M 0 38 Q 25 42 50 38 T 100 38" stroke="white" strokeWidth="0.4" fill="none" vectorEffect="non-scaling-stroke" />
        <path d="M 25 0 L 25 100" stroke="white" strokeWidth="0.35" fill="none" vectorEffect="non-scaling-stroke" />
        <path d="M 0 62 L 100 62" stroke="white" strokeWidth="0.35" fill="none" vectorEffect="non-scaling-stroke" />
        <path d="M 50 0 L 50 100" stroke="white" strokeWidth="0.35" fill="none" vectorEffect="non-scaling-stroke" />
        <path d="M 75 0 L 75 100" stroke="white" strokeWidth="0.45" fill="none" vectorEffect="non-scaling-stroke" />
      </svg>

      {localities.map((locality, i) => {
        const isActive = locality.status === 'active';
        const isSelected = selectedId && locality._id === selectedId;
        const isDragging = draggingId === locality._id;

        return (
          <motion.div
            key={locality._id || `${locality.name}-${i}`}
            className={`absolute z-10 ${interactive ? 'cursor-grab active:cursor-grabbing' : ''} ${
              isSelected ? 'z-30' : ''
            } ${isDragging ? 'z-40' : ''}`}
            style={{
              left: `${Number(locality.x) || 50}%`,
              top: `${Number(locality.y) || 50}%`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={interactive ? false : { opacity: 0 }}
            whileInView={interactive ? undefined : { opacity: 1 }}
            viewport={interactive ? undefined : { once: true }}
            transition={interactive ? undefined : { duration: 0.6, delay: i * 0.08 }}
            onPointerDown={(e) => onPointerDown(e, locality)}
            onClick={() => onSelect?.(locality._id)}
          >
            <div className={`flex flex-col items-center ${isSelected ? 'scale-105' : ''} transition-transform`}>
              {isActive ? (
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-fuchsia-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-300/30 rounded-full flex items-center justify-center border-2 border-purple-300/40 shrink-0">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-200" />
                </div>
              )}
              <div className={`mt-1.5 ${isActive ? 'max-w-[9.5rem] sm:max-w-none' : 'max-w-[6.5rem] sm:max-w-[7.5rem]'}`}>
                <div
                  className={`rounded-xl font-medium text-center leading-tight border ${
                    isActive
                      ? 'bg-white/20 backdrop-blur-sm text-white px-2.5 py-1.5 sm:px-3 text-[11px] sm:text-xs border-white/30'
                      : 'bg-white/10 backdrop-blur-sm text-purple-100 px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs border-white/20'
                  } ${isSelected ? 'ring-2 ring-white/70' : ''}`}
                >
                  {locality.name}
                  {isActive ? (
                    <div className="text-[10px] sm:text-xs text-fuchsia-200 mt-0.5 flex items-center justify-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 bg-fuchsia-300 rounded-full animate-pulse shrink-0" />
                      Active Now
                    </div>
                  ) : (
                    <div className="text-[9px] sm:text-xs text-purple-200 mt-0.5">Coming Soon</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {showLegend && (
        <div className="absolute z-20 bottom-3 left-1/2 -translate-x-1/2 sm:bottom-4 sm:left-4 sm:translate-x-0 bg-white/10 backdrop-blur-md px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl border border-white/20 pointer-events-none">
          <div className="flex flex-row sm:flex-col items-center sm:items-start gap-5 sm:gap-0 sm:space-y-3 text-xs sm:text-sm text-white font-medium">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-fuchsia-400 to-pink-500 rounded-full shrink-0" />
              <span>Active</span>
            </div>
            <div className="hidden sm:block w-full h-px bg-white/15" aria-hidden="true" />
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-300/30 rounded-full border border-purple-300/40 shrink-0" />
              <span>Coming Soon</span>
            </div>
          </div>
        </div>
      )}

      {interactive && (
        <div className="absolute z-20 top-3 right-3 rounded-lg bg-black/35 px-2.5 py-1.5 text-[10px] sm:text-xs text-white/90 pointer-events-none">
          Drag pins to reposition
        </div>
      )}
    </div>
  );
};

export default LocalitiesMap;
