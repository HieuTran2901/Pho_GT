import React from 'react';
import {
  ArrowLeft,
  RefreshCw,
  UtensilsCrossed,
  PlusCircle,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import {
  QUICK_TAGS,
  QUICK_PORTIONS,
  QUICK_PRICES,
  renderPreviewTagIcon
} from '../adminConstants';
import AdminDishPreview from './AdminDishPreview';
import AdminDishImageSelector from './AdminDishImageSelector';

function AdminAddDishTab({
  editingDish,
  dishForm,
  setDishForm,
  categories,
  dishSaving,
  handleSaveDish,
  resetDishForm,
  setActiveTab,
  fetchDishes,
  showAdvancedDishFields,
  setShowAdvancedDishFields,
  mobileDishPreviewOpen,
  setMobileDishPreviewOpen
}) {
  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto pb-28 sm:pb-8">
      {/* Mobile Compact Header (sm:hidden) */}
      <div className="sm:hidden flex items-center justify-between gap-2 pb-2.5 border-b border-amber-900/15">
        <button
          type="button"
          onClick={() => { setActiveTab('dishes'); fetchDishes(); }}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-stone-300 text-stone-700 hover:text-[#8a1e14] rounded-xl text-xs font-serif font-bold shadow-2xs active:scale-95 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-stone-600" />
          <span>DS Món</span>
        </button>
        <div className="text-right">
          <span className="text-[10px] font-mono tracking-widest text-[#8a1e14] block font-bold uppercase">
            {editingDish ? 'Biên Tập Món' : 'Món Mới 1986'}
          </span>
          <h2 className="text-sm font-serif font-bold text-stone-900 leading-none">
            {editingDish ? 'Sửa Món Ăn' : 'Thêm Món Vào Bếp'}
          </h2>
        </div>
      </div>

      {/* Desktop Header & Back button (hidden on sm) */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setActiveTab('dishes'); fetchDishes(); }}
            className="p-2 bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-[#8a1e14] rounded-xl transition-colors"
            title="Quay lại danh sách món"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-mono tracking-widest text-[#8a1e14] uppercase font-bold">
              {editingDish ? 'Biên Tập Thực Đơn' : 'Khởi Tạo Hương Vị Mới'}
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              {editingDish ? `Chỉnh Sửa: ${dishForm.name || 'Món ăn'}` : 'Thêm Món Ăn Mới'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editingDish && (
            <button
              type="button"
              onClick={resetDishForm}
              className="px-3.5 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-serif font-bold transition-all shadow-2xs"
            >
              Hủy Chế Độ Sửa
            </button>
          )}
          <button
            type="button"
            onClick={() => { setActiveTab('dishes'); fetchDishes(); }}
            className="px-3.5 py-2 border border-amber-900/20 text-[#8a1e14] hover:bg-amber-50 rounded-xl text-xs font-serif font-bold transition-all shadow-2xs"
          >
            Xem Danh Sách Món
          </button>
        </div>
      </div>

      {/* Grid 2 Cột: Form Nhập Liệu & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">

        {/* CỘT TRÁI: FORM NHẬP LIỆU */}
        <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-sm">
          <form onSubmit={handleSaveDish} className="space-y-4 sm:space-y-5">

            {/* 1. Tên Món Ăn */}
            <div>
              <label className="block text-[#8a1e14] font-bold font-serif mb-1.5 uppercase tracking-wider text-[11px]">
                Tên Món Ăn <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={dishForm.name}
                onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                placeholder="VD: Phở Bò Tái Lăn Hà Nội..."
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-medium text-sm focus:outline-none focus:border-[#8a1e14] focus:ring-2 focus:ring-[#8a1e14]/15 shadow-2xs"
                required
              />
            </div>

            {/* 2. Danh Mục & Khẩu Phần (2 Cột) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Danh Mục */}
              <div>
                <label className="block text-[#8a1e14] font-bold font-serif mb-1.5 uppercase tracking-wider text-[11px]">
                  Danh Mục <span className="text-rose-600">*</span>
                </label>
                <select
                  value={dishForm.categoryId}
                  onChange={(e) => setDishForm({ ...dishForm, categoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#8a1e14] shadow-2xs"
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Khẩu Phần */}
              <div>
                <label className="block text-[#8a1e14] font-bold font-serif mb-1.5 uppercase tracking-wider text-[11px]">
                  Khẩu Phần / Kích Cỡ
                </label>
                <input
                  type="text"
                  value={dishForm.portion}
                  onChange={(e) => setDishForm({ ...dishForm, portion: e.target.value })}
                  placeholder="VD: Tô Thường, Tô Lớn..."
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#8a1e14] shadow-2xs"
                />
                {/* Gợi ý khẩu phần nhanh */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[11px] sm:text-[10px] text-stone-400 font-serif">Gợi ý:</span>
                  {QUICK_PORTIONS.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDishForm({ ...dishForm, portion: p })}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-serif border transition-all active:scale-95 ${
                        dishForm.portion === p
                          ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Giá Bán & Gợi Ý Giá (VNĐ) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[#8a1e14] font-bold font-serif uppercase tracking-wider text-[11px]">
                  Giá Bán (VNĐ) <span className="text-rose-600">*</span>
                </label>
                {dishForm.price && !isNaN(parseFloat(dishForm.price)) && (
                  <span className="text-xs sm:text-sm font-bold text-[#8a1e14] font-serif bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200/80 shadow-2xs">
                    {parseFloat(dishForm.price).toLocaleString('vi-VN')} VNĐ
                  </span>
                )}
              </div>
              <input
                type="number"
                value={dishForm.price}
                onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                placeholder="85000"
                min="1000"
                step="1000"
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-mono text-sm focus:outline-none focus:border-[#8a1e14] focus:ring-2 focus:ring-[#8a1e14]/15 shadow-2xs"
                required
              />
              {/* Gợi ý giá nhanh */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                <span className="text-[11px] sm:text-[10px] text-stone-400 font-serif">Gợi ý:</span>
                {QUICK_PRICES.map(pr => (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => setDishForm({ ...dishForm, price: pr.toString() })}
                    className={`px-2.5 py-1 sm:px-2 sm:py-0.5 rounded-lg text-[11px] sm:text-[10px] font-mono border transition-all active:scale-95 ${
                      dishForm.price === pr.toString()
                        ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {(pr / 1000)}k
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Đường Dẫn Ảnh & Băng Chuyền Ảnh Mẫu Phở 1986 */}
            <AdminDishImageSelector dishForm={dishForm} setDishForm={setDishForm} />

            {/* 5. Mô Tả Món Ăn */}
            <div>
              <label className="block text-[#8a1e14] font-bold font-serif mb-1.5 uppercase tracking-wider text-[11px]">
                Mô Tả Hương Vị & Thành Phần Nổi Bật
              </label>
              <textarea
                rows="3"
                value={dishForm.description}
                onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                placeholder="Nước dùng ninh từ xương ống bò 18 tiếng theo công thức cổ truyền 1986..."
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#8a1e14] shadow-2xs leading-relaxed"
              />
            </div>

            {/* 6. Tùy Chọn Nâng Cao: Nhãn Tag, Độc Quyền, Thành Phần (Accordion) */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden bg-stone-50/50">
              <button
                type="button"
                onClick={() => setShowAdvancedDishFields(!showAdvancedDishFields)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-stone-100/80 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="font-serif font-bold text-xs text-stone-800 uppercase tracking-wider">
                    Thiết Lập Nhãn Tag, Huy Hiệu & Nguyên Liệu
                  </span>
                  {(dishForm.tag || dishForm.isSignature) && (
                    <span className="w-2 h-2 rounded-full bg-[#8a1e14]" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-stone-400 font-sans hidden sm:inline">
                    {showAdvancedDishFields ? 'Thu gọn' : 'Mở rộng'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform duration-200 ${showAdvancedDishFields ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {showAdvancedDishFields && (
                <div className="p-4 pt-2 border-t border-stone-200 space-y-4 bg-white">
                  {/* Nhãn Tag Nổi Bật */}
                  <div>
                    <label className="block text-stone-700 font-bold font-serif mb-1 uppercase tracking-wider text-[11px]">
                      Nhãn Quảng Bá (Tag Badge)
                    </label>
                    <input
                      type="text"
                      value={dishForm.tag}
                      onChange={(e) => setDishForm({ ...dishForm, tag: e.target.value })}
                      placeholder="VD: Bán Chạy Nhất, Đậm Đà..."
                      className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 text-xs focus:outline-none focus:border-[#8a1e14]"
                    />
                    {/* Gợi ý tags nhanh */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      <span className="text-[10px] text-stone-400 font-serif">Chọn nhanh:</span>
                      {QUICK_TAGS.map(t => (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => setDishForm({ ...dishForm, tag: t.label, tagIcon: t.icon })}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border font-serif transition-all active:scale-95 ${
                            dishForm.tag === t.label
                              ? 'bg-[#8a1e14] text-white border-[#8a1e14] font-bold shadow-2xs'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {renderPreviewTagIcon(t.icon)}
                          <span>{t.label}</span>
                        </button>
                      ))}
                      {dishForm.tag && (
                        <button
                          type="button"
                          onClick={() => setDishForm({ ...dishForm, tag: '', tagIcon: '' })}
                          className="px-2 py-0.5 text-[10px] text-stone-400 hover:text-rose-600 underline"
                        >
                          Bỏ nhãn
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Danh sách nguyên liệu */}
                  <div>
                    <label className="block text-stone-700 font-bold font-serif mb-1 uppercase tracking-wider text-[11px]">
                      Nguyên Liệu Chính (Cách nhau bởi dấu phẩy)
                    </label>
                    <input
                      type="text"
                      value={dishForm.ingredients}
                      onChange={(e) => setDishForm({ ...dishForm, ingredients: e.target.value })}
                      placeholder="Thịt bò gầu, Bánh phở tươi, Hành hoa, Quế hồi..."
                      className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 text-xs focus:outline-none focus:border-[#8a1e14]"
                    />
                  </div>

                  {/* Switch: Món Đặc Quyền 1986 */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-200/70">
                    <div>
                      <span className="font-serif font-bold text-xs text-[#8a1e14] block">
                        Món Đặc Quyền Di Sản (Signature Dish)
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        Đính kèm huy hiệu sao vàng "★ ĐẶC BIỆT 1986" trên thẻ món
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dishForm.isSignature}
                        onChange={(e) => setDishForm({ ...dishForm, isSignature: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8a1e14]"></div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* 7. Trạng Thái Mở Bán (Checkbox) */}
            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between">
              <div>
                <span className="font-serif font-bold text-xs text-stone-800 block">
                  Trạng Thái Bán Hàng Ngay
                </span>
                <span className="text-[11px] text-stone-500 block">
                  Bật để khách hàng trên website và app có thể chọn đặt món này
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dishForm.isAvailable}
                  onChange={(e) => setDishForm({ ...dishForm, isAvailable: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Desktop Action Buttons (hidden on mobile sticky bar) */}
            <div className="hidden sm:flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={resetDishForm}
                className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-serif font-bold transition-all shadow-2xs"
              >
                Làm Lại Form
              </button>
              <button
                type="submit"
                disabled={dishSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#8a1e14] hover:bg-[#70170e] text-white rounded-xl text-xs font-serif font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {dishSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Đang lưu vào hệ thống...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 text-amber-300" />
                    <span>{editingDish ? 'Cập Nhật Món Ăn' : 'Lưu Vào Thực Đơn Quán'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* CỘT PHẢI & DRAWER: LIVE PREVIEW DESKTOP & MOBILE */}
        <AdminDishPreview
          dishForm={dishForm}
          categories={categories}
          editingDish={editingDish}
          dishSaving={dishSaving}
          handleSaveDish={handleSaveDish}
          mobileDishPreviewOpen={mobileDishPreviewOpen}
          setMobileDishPreviewOpen={setMobileDishPreviewOpen}
        />

      </div>
    </div>
  );
}

export default React.memo(AdminAddDishTab);
