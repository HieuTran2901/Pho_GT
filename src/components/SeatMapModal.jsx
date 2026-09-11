import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Compass,
  MapPin,
  Clock,
  X,
  Flame,
  Wind
} from 'lucide-react';
import { MOCK_TABLES } from './seatmap/mockTables';
import SeatMapFloorView from './seatmap/SeatMapFloorView';
import SeatMapInspectorDock from './seatmap/SeatMapInspectorDock';
import { tableApi } from '../services/tableApi';

export { MOCK_TABLES };

function SeatMapModal({
  isOpen,
  onClose,
  selectedTable,
  onConfirmTable,
  branchLabel = '45 Hàng Bạc, Hoàn Kiếm, Hà Nội',
  date = '',
  time = '',
  guestCount = '2'
}) {
  const [tables, setTables] = useState(MOCK_TABLES);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [tempTable, setTempTable] = useState(selectedTable);
  const [seatMapFloor, setSeatMapFloor] = useState('1');
  const [floorSlideDirection, setFloorSlideDirection] = useState('up');

  const touchStartY = useRef(null);
  const partySize = useMemo(() => parseInt(guestCount, 10) || 2, [guestCount]);

  const triggerClose = useCallback(() => {
    if (isClosing) return;
    onClose();
  }, [isClosing, onClose]);

  const triggerCloseRef = useRef(triggerClose);
  useEffect(() => {
    triggerCloseRef.current = triggerClose;
  });

  useEffect(() => {
    let timer;
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
      setTempTable(selectedTable);
      if (selectedTable?.floor) {
        setSeatMapFloor(String(selectedTable.floor));
      }
    } else if (isRendered) {
      setIsClosing(true);
      timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 220);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, isRendered, selectedTable]);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setIsLoadingTables(true);
    tableApi.getTables()
      .then((data) => {
        if (isMounted && data && Array.isArray(data)) {
          setTables(data);
        }
      })
      .catch((err) => {
        console.warn('[SeatMapModal] Không thể tải trạng thái bàn realtime:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingTables(false);
      });
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && window.location.hash === '#seatmap') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [isOpen]);

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diffY = currentY - touchStartY.current;
    if (diffY > 65) {
      touchStartY.current = null;
      triggerClose();
    }
  }, [triggerClose]);

  const handleTouchEnd = useCallback(() => {
    touchStartY.current = null;
  }, []);

  useEffect(() => {
    if (!isRendered) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        triggerCloseRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRendered]);

  const handleSwitchFloor = useCallback((newFloor) => {
    setFloorSlideDirection(newFloor === '2' ? 'up' : 'down');
    setSeatMapFloor(newFloor);
  }, []);

  const currentFloorTables = useMemo(() => {
    return tables.filter((t) => String(t.floor) === String(seatMapFloor));
  }, [tables, seatMapFloor]);

  if (!isRendered || typeof document === 'undefined') {
    return null;
  }

  const modalContent = (
    <div
      className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md ${
        isClosing ? 'animate-modal-backdrop-exit' : 'animate-modal-backdrop'
      }`}
      onClick={triggerClose}
      role="dialog"
      aria-modal="true"
      aria-label="Sơ đồ chỗ ngồi 2D"
    >
      <div
        className={`max-w-3xl w-full bg-[#1c1612] border-t sm:border border-amber-500/40 rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[92vh] ${
          isClosing ? 'animate-sheet-down sm:animate-none sm:animate-modal-dialog-exit' : 'animate-sheet-up sm:animate-none sm:animate-modal-dialog'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull / Grabber Bar */}
        <div 
          className="sm:hidden w-full flex items-center justify-center pt-3 pb-2 bg-stone-950/90 cursor-pointer touch-none"
          onClick={triggerClose}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          title="Vuốt xuống để đóng"
        >
          <div className="w-12 h-1.5 bg-stone-600/80 rounded-full" />
        </div>

        {/* Modal Header */}
        <div 
          className="px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10 flex items-center justify-between bg-stone-950/80 shrink-0 select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-serif text-sm sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Mặt Bằng Chỗ Ngồi Phở 1986</span>
                <span className="hidden sm:inline-block text-[10px] bg-amber-500/20 text-amber-300 font-sans font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  2D Interactive
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-stone-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span className="truncate max-w-[180px] sm:max-w-none">{branchLabel}</span>
                <span>•</span>
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{time || '19:00'} ({date || 'Hôm nay'})</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={triggerClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Đóng sơ đồ (Phím Escape)"
            aria-label="Đóng sơ đồ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Floor Switcher & Interactive Legend */}
        <div className="px-3 py-2 sm:px-6 sm:py-2.5 bg-stone-950/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSwitchFloor('1')}
              className={`flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                seatMapFloor === '1'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${seatMapFloor === '1' ? 'text-stone-950' : 'text-amber-400'}`} />
              <span>Tầng 1: Gian Bếp</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchFloor('2')}
              className={`flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                seatMapFloor === '2'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wind className={`w-3.5 h-3.5 ${seatMapFloor === '2' ? 'text-stone-950' : 'text-sky-300'}`} />
              <span>Tầng 2: Ban Công</span>
            </button>
          </div>

          {/* Status Legend */}
          <div className="flex items-center gap-2 sm:gap-2.5 text-[10px] sm:text-[11px] text-stone-400 overflow-x-auto w-full sm:w-auto justify-between sm:justify-start pt-1 sm:pt-0">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Trống</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Đang giữ</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
              <span>Đã kín</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300 ring-2 ring-amber-400 shadow-xs" />
              <span className="text-amber-300 font-semibold">Đang chọn</span>
            </span>
          </div>
        </div>

        {/* 2D Architectural Floor Stage */}
        <SeatMapFloorView
          seatMapFloor={seatMapFloor}
          floorSlideDirection={floorSlideDirection}
          currentFloorTables={currentFloorTables}
          tempTable={tempTable}
          partySize={partySize}
          setTempTable={setTempTable}
          handleSwitchFloor={handleSwitchFloor}
        />

        {/* Floating Bottom Inspector Dock */}
        <SeatMapInspectorDock
          tempTable={tempTable}
          partySize={partySize}
          onConfirmTable={onConfirmTable}
          setTempTable={setTempTable}
          triggerClose={triggerClose}
        />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default React.memo(SeatMapModal);
