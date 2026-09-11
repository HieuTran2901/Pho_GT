import React from 'react';
import {
  Grid,
  ClipboardList,
  RefreshCw,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  UtensilsCrossed
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LazyDishImage } from '../adminConstants';

function AdminDishesTab({
  dishes,
  categories,
  dishCategoryFilter,
  setDishCategoryFilter,
  dishSearch,
  setDishSearch,
  dishViewMode,
  setDishViewMode,
  dishesLoading,
  fetchDishes,
  openCreateDish,
  openEditDish,
  handleDeleteDish,
  handleToggleDishAvailability,
  filteredDishes
}) {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header Zone: Tinh gọn trên Mobile, Đẳng cấp trên Desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 border-b border-amber-900/15">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-3xl font-bold font-serif text-[#1c120c] tracking-tight">
              <span className="sm:hidden">Thực Đơn Quán</span>
              <span className="hidden sm:inline">Bảng Quản Lý Thực Đơn Gia Truyền</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-serif font-bold bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs">
              {dishes.length} món
            </span>
          </div>
          <p className="hidden sm:block text-xs text-stone-500 mt-0.5">
            Quản lý danh sách món phở, giá tiền và trạng thái phục vụ
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Bộ chuyển đổi chế độ xem: Thẻ Bếp ↔ Sổ Dòng */}
          <div className="flex items-center bg-[#f4ead9]/90 p-1 rounded-xl border border-amber-900/20 shadow-2xs relative shrink-0">
            <button
              type="button"
              onClick={() => setDishViewMode('cards')}
              className={`relative px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 transition-colors z-10 ${
                dishViewMode === 'cards' ? 'text-white' : 'text-stone-700 hover:text-[#8a1e14]'
              }`}
              title="Xem dạng Thẻ Bếp trực quan"
            >
              {dishViewMode === 'cards' && (
                <motion.div
                  layoutId="dishViewPill"
                  className="absolute inset-0 bg-gradient-to-r from-[#8a1e14] to-[#6d150e] rounded-lg shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                />
              )}
              <Grid className="w-3.5 h-3.5 relative z-10" />
              <span className="hidden sm:inline relative z-10">Thẻ Bếp</span>
            </button>

            <button
              type="button"
              onClick={() => setDishViewMode('list')}
              className={`relative px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 transition-colors z-10 ${
                dishViewMode === 'list' ? 'text-white' : 'text-stone-700 hover:text-[#8a1e14]'
              }`}
              title="Xem dạng Sổ Dòng thu gọn"
            >
              {dishViewMode === 'list' && (
                <motion.div
                  layoutId="dishViewPill"
                  className="absolute inset-0 bg-gradient-to-r from-[#8a1e14] to-[#6d150e] rounded-lg shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                />
              )}
              <ClipboardList className="w-3.5 h-3.5 relative z-10" />
              <span className="hidden sm:inline relative z-10">Sổ Dòng</span>
            </button>
          </div>

          <button
            type="button"
            onClick={fetchDishes}
            className="p-2 sm:p-2.5 bg-white border border-stone-300 text-stone-700 hover:text-[#8a1e14] hover:bg-stone-50 rounded-xl transition-all shadow-2xs active:scale-95 shrink-0"
            title="Làm mới thực đơn"
          >
            <RefreshCw className={`w-4 h-4 ${dishesLoading ? 'animate-spin text-[#8a1e14]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={openCreateDish}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 bg-[#8a1e14] hover:bg-[#70170e] text-white font-bold text-xs rounded-xl shadow-sm font-serif tracking-wide transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span className="sm:hidden">Thêm Món</span>
            <span className="hidden sm:inline">Thêm Món Ăn Mới</span>
          </button>
        </div>
      </div>

      {/* Thanh Lọc Danh Mục & Ô Tìm Kiếm Món Ăn Nhanh */}
      <div className="bg-transparent sm:bg-[#f4ead9]/80 p-0 sm:p-3 rounded-2xl border-0 sm:border-2 border-amber-900/20 shadow-none sm:shadow-inner space-y-2.5 sm:space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setDishCategoryFilter('ALL')}
              className={`relative px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-colors font-serif text-xs flex items-center gap-1.5 sm:gap-2 shrink-0 z-10 ${
                dishCategoryFilter === 'ALL'
                  ? 'text-white font-bold shadow-md shadow-[#8a1e14]/35'
                  : 'bg-[#fffdfa] text-stone-800 hover:text-[#8a1e14] hover:bg-amber-100/70 border border-amber-900/15 shadow-2xs'
              }`}
            >
              {dishCategoryFilter === 'ALL' && (
                <motion.div
                  layoutId="activeDishCategoryPill"
                  className="absolute inset-0 bg-gradient-to-r from-[#8a1e14] to-[#6d150e] rounded-xl border border-[#a8281d] -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">Tất Cả Món</span>
              <span className={`relative z-10 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                dishCategoryFilter === 'ALL' ? 'bg-amber-300/25 text-amber-200 border border-amber-300/40' : 'bg-stone-100 text-stone-700'
              }`}>
                {dishes.length}
              </span>
            </button>

            {categories.map(cat => {
              const count = dishes.filter(d => (d.category?.id || d.categoryId) === cat.id).length;
              const isActive = dishCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setDishCategoryFilter(cat.id)}
                  className={`relative px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-colors font-serif text-xs flex items-center gap-1.5 sm:gap-2 shrink-0 z-10 ${
                    isActive
                      ? 'text-white font-bold shadow-md shadow-[#8a1e14]/35'
                      : 'bg-[#fffdfa] text-stone-800 hover:text-[#8a1e14] hover:bg-amber-100/70 border border-amber-900/15 shadow-2xs'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeDishCategoryPill"
                      className="absolute inset-0 bg-gradient-to-r from-[#8a1e14] to-[#6d150e] rounded-xl border border-[#a8281d] -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{cat.name}</span>
                  <span className={`relative z-10 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-amber-300/25 text-amber-200 border border-amber-300/40' : 'bg-stone-100 text-stone-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Ô Tìm Kiếm Món Ăn Nhanh */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={dishSearch}
              onChange={(e) => setDishSearch(e.target.value)}
              placeholder="Tìm theo tên món, khẩu phần..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-stone-300/90 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#8a1e14] shadow-2xs transition-all"
            />
            {dishSearch && (
              <button
                type="button"
                onClick={() => setDishSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DANH SÁCH MÓN ĂN: 2 CHẾ ĐỘ THẺ BẾP HOẶC SỔ DÒNG */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${dishCategoryFilter}-${dishViewMode}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          {filteredDishes.length === 0 ? (
            <div className="p-10 text-center bg-white border-2 border-dashed border-amber-900/20 rounded-2xl">
              <UtensilsCrossed className="w-10 h-10 text-amber-800/40 mx-auto mb-2" />
              <div className="text-sm font-serif font-bold text-stone-700">Không tìm thấy món ăn nào</div>
              <p className="text-xs text-stone-400 mt-1">Thử thay đổi bộ lọc danh mục hoặc từ khóa tìm kiếm</p>
            </div>
          ) : dishViewMode === 'cards' ? (
            <div>
              {/* MOBILE: THẺ NGANG TÁC CHIẾN (~96px/món) */}
              <div className="sm:hidden space-y-2.5">
                {filteredDishes.map((dish, idx) => (
                  <motion.div
                    key={dish.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.26, delay: Math.min(idx * 0.03, 0.2), ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white border border-stone-200/90 rounded-xl p-2.5 shadow-2xs flex items-center gap-3 transition-all"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-amber-900/15 relative bg-stone-100">
                      <LazyDishImage src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
                      {dish.isSignature && (
                        <span className="absolute top-1 left-1 bg-[#8a1e14] text-amber-200 text-[8px] font-bold px-1 rounded shadow-xs">
                          ★ 1986
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] text-stone-500 font-serif truncate">
                          {dish.category?.name || 'Phở'}
                        </span>
                        <span className="text-xs font-mono font-black text-[#8a1e14]">
                          {dish.price?.toLocaleString('vi-VN')}đ
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-xs text-stone-900 truncate leading-snug">
                        {dish.name}
                      </h3>
                      <p className="text-[10px] text-stone-400 truncate mb-1.5">
                        {dish.portion || 'Tô thường'}
                      </p>

                      <div className="flex items-center justify-between gap-1 pt-1 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => handleToggleDishAvailability(dish)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-serif font-bold flex items-center gap-1 border transition-all ${
                            dish.isAvailable
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${dish.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span>{dish.isAvailable ? 'Đang bán' : 'Tạm hết'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditDish(dish)}
                            className="p-1 text-stone-600 hover:text-[#8a1e14] bg-stone-100 rounded-lg border border-stone-200"
                            title="Sửa món"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDish(dish.id)}
                            className="p-1 text-stone-400 hover:text-rose-700 bg-stone-100 rounded-lg border border-stone-200"
                            title="Xóa món"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* DESKTOP: LƯỚI 3 CỘT THẺ DI SẢN LỚN */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredDishes.map((dish, idx) => (
                  <motion.div
                    key={dish.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: Math.min(idx * 0.03, 0.24), ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-48 overflow-hidden bg-stone-100">
                        <LazyDishImage
                          src={dish.imageUrl}
                          alt={dish.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                        {dish.tag && (
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-[#8a1e14]/90 border border-white/20 shadow-xs">
                              {dish.tag}
                            </span>
                          </div>
                        )}

                        {dish.isSignature && (
                          <div className="absolute bottom-3 left-3">
                            <span className="px-2.5 py-0.5 text-[10px] bg-[#8a1e14] text-amber-200 border border-amber-400/40 rounded-full font-bold font-serif shadow-xs">
                              ★ ĐẶC BIỆT 1986
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-3 right-3 text-white font-mono font-bold text-base bg-black/50 px-2.5 py-0.5 rounded-lg backdrop-blur-xs">
                          {dish.price?.toLocaleString('vi-VN')}đ
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                          <span className="font-serif">{dish.category?.name || 'Phở Gia Truyền'}</span>
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-900 rounded font-bold border border-amber-200 text-[10px]">
                            {dish.portion || 'Tô thường'}
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-[#8a1e14] transition-colors line-clamp-1">
                          {dish.name}
                        </h3>
                        <p className="text-xs text-stone-500 line-clamp-2 mt-1 font-sans">
                          {dish.description || 'Món phở gia truyền nấu từ nước dùng ninh xương 18 tiếng.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleToggleDishAvailability(dish)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all shadow-2xs border ${
                          dish.isAvailable
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${dish.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        <span>{dish.isAvailable ? 'Đang phục vụ' : 'Tạm hết hàng'}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditDish(dish)}
                          className="p-2 text-stone-700 hover:text-[#8a1e14] hover:bg-stone-100 rounded-xl transition-colors border border-stone-200 shadow-2xs"
                          title="Chỉnh sửa món"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDish(dish)}
                          className="p-2 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-stone-200 shadow-2xs"
                          title="Xóa vĩnh viễn món"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            /* CHẾ ĐỘ SỔ DÒNG (~50px/dòng) */
            <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f4ead9]/80 border-b border-amber-900/15 text-[#6b1e16] font-serif font-bold">
                      <th className="p-3 w-14">Ảnh</th>
                      <th className="p-4">Tên Món Ăn</th>
                      <th className="p-4">Danh Mục</th>
                      <th className="p-4">Giá Tiền</th>
                      <th className="p-4">Trạng Thái</th>
                      <th className="p-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredDishes.map((dish, idx) => (
                      <motion.tr
                        key={dish.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, delay: Math.min(idx * 0.02, 0.16) }}
                        className="hover:bg-amber-50/40 transition-colors"
                      >
                        <td className="p-3 align-middle">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-900/20 bg-stone-100 shadow-2xs">
                            <LazyDishImage src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="font-serif font-black text-sm text-stone-950">
                            {dish.name}
                          </div>
                          <div className="text-[11px] text-stone-500 font-sans">
                            {dish.portion || 'Tô tiêu chuẩn'}
                          </div>
                        </td>
                        <td className="p-4 align-middle font-serif text-stone-800">
                          {dish.category?.name || '—'}
                        </td>
                        <td className="p-4 align-middle font-serif font-black text-sm text-[#8a1e14]">
                          {dish.price?.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="p-4 align-middle">
                          <button
                            type="button"
                            onClick={() => handleToggleDishAvailability(dish)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-serif font-bold transition-all shadow-2xs border ${
                              dish.isAvailable
                                ? 'bg-emerald-100 text-emerald-950 border-emerald-300 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-950 border-rose-300 hover:bg-rose-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${dish.isAvailable ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`} />
                            <span>{dish.isAvailable ? 'Đang phục vụ' : 'Tạm hết món'}</span>
                          </button>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditDish(dish)}
                              className="p-1.5 text-stone-700 hover:text-[#8a1e14] bg-white hover:bg-amber-100 rounded-lg border border-stone-300 transition-all shadow-2xs"
                              title="Sửa món"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDish(dish)}
                              className="p-1.5 text-stone-400 hover:text-rose-700 bg-white hover:bg-rose-50 rounded-lg border border-stone-200 transition-all shadow-2xs"
                              title="Xóa vĩnh viễn món"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default React.memo(AdminDishesTab);
