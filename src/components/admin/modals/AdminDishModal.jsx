import React from 'react';
import { X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AdminDishModal({
  dishModalOpen,
  setDishModalOpen,
  editingDish,
  dishForm,
  setDishForm,
  categories,
  dishSaving = false,
  handleSaveDish
}) {
  return (
    <AnimatePresence>
      {dishModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg bg-[#faf6ee] border-2 border-[#8a1e14]/40 rounded-3xl p-7 shadow-2xl relative text-stone-900"
          >
            <button
              type="button"
              onClick={() => setDishModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-800 p-1.5 hover:bg-stone-200/60 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8a1e14]" />
              <h3 className="text-xl font-bold font-serif text-stone-900">
                {editingDish ? 'Chỉnh Sửa Món Gia Truyền' : 'Thêm Món Ăn Mới'}
              </h3>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#8a1e14] font-bold font-serif mb-1 uppercase tracking-wider text-[11px]">
                  Danh Mục Món
                </label>
                <select
                  value={dishForm.categoryId}
                  onChange={(e) => setDishForm({ ...dishForm, categoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#8a1e14] shadow-2xs"
                  required
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#8a1e14] font-bold font-serif mb-1 uppercase tracking-wider text-[11px]">
                  Tên Món Ăn
                </label>
                <input
                  type="text"
                  value={dishForm.name}
                  onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                  placeholder="Ví dụ: Phở Bò Tái Nạm Gầu Giòn"
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#8a1e14] shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[#8a1e14] font-bold font-serif mb-1 uppercase tracking-wider text-[11px]">
                  Giá Bán (VNĐ)
                </label>
                <input
                  type="number"
                  value={dishForm.price}
                  onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                  placeholder="85000"
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#8a1e14] shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[#8a1e14] font-bold font-serif mb-1 uppercase tracking-wider text-[11px]">
                  Đường Dẫn Ảnh Món
                </label>
                <input
                  type="text"
                  value={dishForm.imageUrl}
                  onChange={(e) => setDishForm({ ...dishForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#8a1e14] shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[#8a1e14] font-bold font-serif mb-1 uppercase tracking-wider text-[11px]">
                  Mô Tả Hương Vị & Nước Dùng
                </label>
                <textarea
                  rows="3"
                  value={dishForm.description}
                  onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                  placeholder="Thịt bò tươi chần tái mềm ngọt, nước dùng ninh xương 18 tiếng..."
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#8a1e14] shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-stone-800 cursor-pointer font-serif font-medium">
                  <input
                    type="checkbox"
                    checked={dishForm.isSignature}
                    onChange={(e) => setDishForm({ ...dishForm, isSignature: e.target.checked })}
                    className="w-4 h-4 accent-[#8a1e14]"
                  />
                  <span>Món Đặc Biệt (Signature)</span>
                </label>

                <label className="flex items-center gap-2 text-stone-800 cursor-pointer font-serif font-medium">
                  <input
                    type="checkbox"
                    checked={dishForm.isAvailable}
                    onChange={(e) => setDishForm({ ...dishForm, isAvailable: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span>Còn Bán (Available)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setDishModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={dishSaving}
                  className="px-6 py-2.5 bg-[#8a1e14] hover:bg-[#70170e] disabled:opacity-60 text-white font-bold font-serif rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  {dishSaving && <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />}
                  <span>{dishSaving ? 'Đang Lưu...' : 'Lưu Vào Thực Đơn'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default React.memo(AdminDishModal);
