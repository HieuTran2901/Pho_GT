import React from 'react';
import { Image as ImageIcon, Check } from 'lucide-react';
import { PRESET_DISH_IMAGES } from '../adminConstants';

export default function AdminDishImageSelector({ dishForm, setDishForm }) {
  return (
    <div>
      <label className="block text-[#8a1e14] font-bold font-serif mb-1.5 uppercase tracking-wider text-[11px]">
        Đường Dẫn Hình Ảnh Món (URL)
      </label>
      <input
        type="text"
        value={dishForm.imageUrl}
        onChange={(e) => setDishForm({ ...dishForm, imageUrl: e.target.value })}
        placeholder="https://images.unsplash.com/..."
        className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#8a1e14] shadow-2xs text-xs"
      />

      {/* Bộ Ảnh Mẫu: Mobile Băng Chuyền Ngang & Desktop Lưới 4 Cột */}
      <div className="mt-2.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-stone-700 font-serif flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>Bộ ảnh mẫu Phở 1986 (1-Chạm áp dụng):</span>
          </span>
          <span className="sm:hidden text-[10px] text-amber-800 font-serif font-medium">← Vuốt ngang →</span>
        </div>

        {/* Mobile Horizontal Carousel */}
        <div className="sm:hidden flex gap-2.5 overflow-x-auto snap-x pb-2 pt-1 -mx-1 px-1 scroll-smooth no-scrollbar">
          {PRESET_DISH_IMAGES.map((preset) => {
            const isSelected = dishForm.imageUrl === preset.url;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setDishForm({
                    ...dishForm,
                    imageUrl: preset.url,
                    tag: dishForm.tag || preset.tag,
                    tagIcon: dishForm.tagIcon || preset.tagIcon,
                    portion: dishForm.portion || preset.portion,
                    name: dishForm.name || preset.name,
                    price: dishForm.price || (preset.price ? String(preset.price) : '')
                  });
                }}
                className={`group flex-shrink-0 w-28 snap-start rounded-xl overflow-hidden border p-1 text-left transition-all active:scale-95 ${
                  isSelected
                    ? 'border-[#8a1e14] ring-2 ring-[#8a1e14]/40 bg-amber-50/70 shadow-xs'
                    : 'border-stone-200 bg-white'
                }`}
              >
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-stone-100 mb-1 relative">
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#8a1e14] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-bold font-serif text-stone-800 truncate px-0.5">
                  {preset.name}
                </p>
              </button>
            );
          })}
        </div>

        {/* Desktop Grid View */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-2">
          {PRESET_DISH_IMAGES.map((preset) => {
            const isSelected = dishForm.imageUrl === preset.url;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setDishForm({
                    ...dishForm,
                    imageUrl: preset.url,
                    tag: dishForm.tag || preset.tag,
                    tagIcon: dishForm.tagIcon || preset.tagIcon,
                    portion: dishForm.portion || preset.portion,
                    name: dishForm.name || preset.name,
                    price: dishForm.price || (preset.price ? String(preset.price) : '')
                  });
                }}
                className={`group relative rounded-xl overflow-hidden border p-1 text-left transition-all ${
                  isSelected
                    ? 'border-[#8a1e14] ring-2 ring-[#8a1e14]/30 bg-amber-50/50'
                    : 'border-stone-200 hover:border-amber-400 bg-white'
                }`}
              >
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-stone-100 mb-1 relative">
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#8a1e14] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-bold font-serif text-stone-800 truncate px-0.5">
                  {preset.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
