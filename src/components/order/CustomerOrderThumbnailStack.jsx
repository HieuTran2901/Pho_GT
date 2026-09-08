import React, { useState } from 'react';
import { getOrderThumbnails, DEFAULT_PHO_IMAGE } from '../../utils/dishImageHelper';
import { Utensils } from 'lucide-react';

export default function CustomerOrderThumbnailStack({ order }) {
  const thumbnails = getOrderThumbnails(order);
  const items = order.items || [];
  const totalItemQuantity = items.reduce((sum, it) => sum + (it.quantity || 1), 0);
  const [imgError, setImgError] = useState(false);

  const mainThumb = thumbnails[0] || { url: DEFAULT_PHO_IMAGE, name: 'Phở Gia Truyền' };

  return (
    <div className="relative shrink-0 select-none group">
      {/* KHUNG THUMBNAIL CHÍNH (64x64px mobile, 76x76px desktop) */}
      <div className="relative w-[64px] h-[64px] sm:w-[76px] sm:h-[76px] shrink-0 rounded-2xl overflow-hidden border-2 border-[#d4af37]/50 shadow-sm bg-stone-100 group-hover:border-[#8a1e14] transition-all">
        <img
          src={imgError ? DEFAULT_PHO_IMAGE : mainThumb.url}
          alt={mainThumb.name}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Lớp gradient nhẹ phủ đáy ảnh để text/badge không lóa */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Huy hiệu số lượng món chính */}
        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono font-bold flex items-center gap-0.5">
          <Utensils className="w-2.5 h-2.5 text-amber-300" />
          <span>{totalItemQuantity} món</span>
        </div>
      </div>

      {/* AVATAR STACK PHỤ (NẾU CÓ TỪ 2 MÓN TRỞ LÊN) */}
      {thumbnails.length > 1 && (
        <div className="absolute -top-1.5 -right-1.5 flex items-center -space-x-2">
          {thumbnails.slice(1, 3).map((thumb, idx) => (
            <div
              key={idx}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border-2 border-white shadow-xs bg-stone-200"
              title={thumb.name}
            >
              <img
                src={thumb.url}
                alt={thumb.name}
                loading="lazy"
                onError={(e) => { e.target.src = DEFAULT_PHO_IMAGE; }}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {items.length > 2 && (
            <span className="w-5 h-5 rounded-full bg-[#8a1e14] border-2 border-white text-[8px] font-bold text-amber-200 flex items-center justify-center font-mono shadow-xs">
              +{items.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
