import React from 'react';
import { Sparkles, Eye, PlusCircle, RefreshCw, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { renderPreviewTagIcon } from '../adminConstants';

export function DishPreviewCard({ dishForm, categories, isModal = false }) {
  return (
    <div className={`bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-stone-200/90 shadow-lg flex flex-col justify-between transition-all duration-300 group ${isModal ? 'max-w-md mx-auto w-full' : ''}`}>
      {/* Item Image with 4:3 Hero Aspect Ratio */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <img
          src={dishForm.imageUrl || 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80'}
          alt={dishForm.name || 'Xem trước món'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80 pointer-events-none" />

        {/* Top-left Tag Badge */}
        {dishForm.tag && (
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white shadow-md backdrop-blur-xs bg-[#96281b]/95 border border-white/20">
              {renderPreviewTagIcon(dishForm.tagIcon)}
              <span>{dishForm.tag}</span>
            </span>
          </div>
        )}

        {/* Signature Special Badge */}
        {dishForm.isSignature && (
          <div className="absolute bottom-3 left-3.5 z-10">
            <span className="px-2.5 py-1 text-[10px] bg-[#8a1e14] text-amber-200 border border-amber-400/40 rounded-full font-bold font-serif tracking-wider shadow-sm">
              ★ ĐẶC BIỆT 1986
            </span>
          </div>
        )}

        {/* Mock Heart Button */}
        <div className="absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full bg-black/35 backdrop-blur-xs flex items-center justify-center text-white/90 border border-white/30">
          <span className="text-xs">♡</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          {/* Portion & Category */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] text-stone-500 font-serif">
              {categories.find(c => c.id === dishForm.categoryId)?.name || 'Phở Gia Truyền'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
              {dishForm.portion || 'Tô thường'}
            </span>
          </div>

          {/* Name */}
          <h3 className="font-serif text-lg font-bold text-[#1b3425] leading-snug">
            {dishForm.name || 'Tên Món Ăn Mẫu'}
          </h3>

          {/* Description */}
          <p className="text-stone-500 text-xs leading-relaxed line-clamp-2 mt-1.5 font-sans">
            {dishForm.description || 'Mô tả hương vị nước dùng thanh trong, ninh xương ống bò 18 tiếng thơm ngậy quế hồi gia truyền 1986...'}
          </p>

          {/* Ingredients Chips */}
          {dishForm.ingredients ? (
            <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-2.5 border-t border-stone-100">
              {dishForm.ingredients
                .split(/[,;\n]+/)
                .map(i => i.trim())
                .filter(Boolean)
                .slice(0, 4)
                .map((ing, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-700 border border-stone-200"
                  >
                    {ing}
                  </span>
                ))}
            </div>
          ) : null}
        </div>

        {/* Bottom Bar: Price & Mock Add Button */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 block font-serif">Giá phục vụ</span>
            <div className="font-serif font-bold text-lg text-[#96281b]">
              {dishForm.price && !isNaN(parseFloat(dishForm.price))
                ? `${parseFloat(dishForm.price).toLocaleString('vi-VN')} đ`
                : '0 đ'}
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#96281b] text-white text-xs font-bold font-serif shadow-xs">
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>Thêm Vào Bát</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDishPreview({
  dishForm,
  categories,
  editingDish,
  dishSaving,
  handleSaveDish,
  mobileDishPreviewOpen,
  setMobileDishPreviewOpen
}) {
  return (
    <>
      {/* CỘT PHẢI: REAL-TIME LIVE PREVIEW TRÊN DESKTOP */}
      <div className="hidden lg:block lg:col-span-5 space-y-4 lg:sticky lg:top-24">
        {/* Preview Banner Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="font-serif font-bold text-xs uppercase tracking-wider text-stone-800">
              Xem Trước Giao Diện Khách Hàng
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300/60 px-2 py-0.5 rounded-full">
            Live Preview
          </span>
        </div>

        {/* Render Shared Dish Card */}
        <DishPreviewCard dishForm={dishForm} categories={categories} isModal={false} />

        {/* Trạng thái phục vụ hiện tại */}
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-serif ${
          dishForm.isAvailable
            ? 'bg-emerald-50 border-emerald-200/80 text-emerald-800'
            : 'bg-rose-50 border-rose-200/80 text-rose-800'
        }`}>
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${dishForm.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="font-bold">{dishForm.isAvailable ? 'Đang Mở Bán' : 'Tạm Hết Hàng'}</span>
          </span>
          <span className="text-[11px] opacity-80">
            {dishForm.isAvailable ? 'Khách hàng có thể đặt món ngay' : 'Món sẽ ẩn nút đặt hàng'}
          </span>
        </div>

        {/* Mẹo sử dụng */}
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5 shadow-2xs">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <p className="font-bold font-serif mb-0.5">Mẹo Quản Trị Viên 1986:</p>
            <p className="text-[11px] text-stone-600">
              Thẻ xem trước đồng bộ trực tiếp theo từng ký tự bạn nhập. Sau khi nhấn "Lưu Vào Thực Đơn", món mới sẽ ngay lập tức được cập nhật vào cơ sở dữ liệu và sổ gọi món của nhà bếp!
            </p>
          </div>
        </div>
      </div>

      {/* THANH TÁC CHIẾN CỐ ĐỊNH ĐÁY CHO MOBILE */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200/90 px-4 py-2.5 shadow-2xl flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setMobileDishPreviewOpen(true)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-amber-50 hover:bg-amber-100 text-[#8a1e14] border border-amber-200 rounded-xl font-serif font-bold text-xs shadow-2xs active:scale-95 transition-all"
        >
          <Eye className="w-4 h-4 text-amber-600" />
          <span>Xem Thẻ Mẫu</span>
        </button>

        <button
          type="button"
          onClick={handleSaveDish}
          disabled={dishSaving}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#8a1e14] hover:bg-[#70170e] text-white font-serif font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50"
        >
          {dishSaving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>{editingDish ? 'Cập Nhật' : 'Lưu Thực Đơn'}</span>
            </>
          )}
        </button>
      </div>

      {/* DRAWER / BOTTOM SHEET XEM TRƯỚC TRÊN MOBILE */}
      <AnimatePresence>
        {mobileDishPreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setMobileDishPreviewOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full sm:max-w-md bg-[#fbf8f2] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border-t-2 sm:border border-[#d4af37]/40 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Drawer */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="font-serif font-bold text-sm text-[#1c120c]">
                    Xem Trước Thẻ Món Khách Hàng
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDishPreviewOpen(false)}
                  className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Render Dish Card */}
              <DishPreviewCard dishForm={dishForm} categories={categories} isModal={true} />

              {/* Bottom Drawer Actions */}
              <div className="mt-4 pt-3 border-t border-stone-200 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setMobileDishPreviewOpen(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-stone-300 text-stone-700 font-serif font-bold text-xs hover:bg-stone-100 transition-colors"
                >
                  Chỉnh Sửa Thêm
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    setMobileDishPreviewOpen(false);
                    handleSaveDish(e);
                  }}
                  disabled={dishSaving}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#8a1e14] hover:bg-[#70170e] text-white font-serif font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {editingDish ? 'Lưu Cập Nhật' : 'Lưu Vào Thực Đơn'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
