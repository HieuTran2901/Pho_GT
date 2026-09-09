import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Check,
  UploadCloud,
  Loader2,
  AlertCircle,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { PRESET_DISH_IMAGES } from '../adminConstants';
import { adminApi } from '../../../services/adminApi';

export default function AdminDishImageSelector({ dishForm, setDishForm }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Client-side validation
    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn tệp định dạng hình ảnh (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Kích thước ảnh vượt quá 10MB. Vui lòng nén hoặc chọn ảnh nhỏ hơn.');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      const res = await adminApi.uploadDishImage(file);
      const s3Url = res?.imageUrl || res;
      if (s3Url && typeof s3Url === 'string') {
        setDishForm(prev => ({ ...prev, imageUrl: s3Url }));
      } else {
        throw new Error('Không nhận được URL ảnh từ máy chủ.');
      }
    } catch (err) {
      setUploadError(err.message || 'Lỗi khi tải ảnh lên Amazon S3. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset file input value so same file can be re-selected if desired
    e.target.value = '';
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const isS3Url = dishForm.imageUrl && dishForm.imageUrl.includes('.amazonaws.com');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-[#8a1e14] font-bold font-serif uppercase tracking-wider text-[11px]">
          Hình Ảnh Món Ăn
        </label>
        {isS3Url && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Amazon S3
          </span>
        )}
      </div>

      {/* Vùng Tải Ảnh Lên Amazon S3 (Drag & Drop / File Picker) */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
          dragActive
            ? 'border-[#8a1e14] bg-amber-50/80 scale-[1.01]'
            : 'border-stone-300 hover:border-amber-500 bg-stone-50/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="py-4 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 text-[#8a1e14] animate-spin" />
            <p className="text-xs font-serif font-bold text-stone-700">
              Đang tải ảnh lên Amazon S3...
            </p>
            <span className="text-[10px] text-stone-400 font-sans">
              Đang bảo mật và tạo liên kết truy cập tốc độ cao
            </span>
          </div>
        ) : dishForm.imageUrl ? (
          <div className="flex flex-col sm:flex-row items-center gap-3.5 p-1 text-left">
            <div className="relative w-24 h-20 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-300 shadow-2xs">
              <img
                src={dishForm.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setDishForm(prev => ({ ...prev, imageUrl: '' }))}
                className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors"
                title="Gỡ ảnh này"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 min-w-0 w-full space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                <span className="text-xs font-serif font-bold text-stone-800">
                  {isS3Url ? 'Ảnh đã lưu trên Amazon S3' : 'Ảnh đang sử dụng'}
                </span>
                {isS3Url && (
                  <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    S3 Bucket
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-stone-500 truncate" title={dishForm.imageUrl}>
                {dishForm.imageUrl}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-[11px] font-serif font-bold text-[#8a1e14] hover:underline"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Chọn ảnh khác</span>
                </button>
                <span className="text-stone-300">•</span>
                <a
                  href={dishForm.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-serif text-stone-500 hover:text-stone-800"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Xem ảnh gốc</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="py-4 flex flex-col items-center justify-center cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-100 group-hover:bg-[#8a1e14] text-amber-900 group-hover:text-white flex items-center justify-center transition-colors mb-2 shadow-2xs">
              <UploadCloud className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <p className="text-xs font-serif font-bold text-stone-800 group-hover:text-[#8a1e14] transition-colors">
              Bấm để chọn ảnh từ máy hoặc kéo thả vào đây
            </p>
            <p className="text-[11px] text-stone-400 font-sans mt-0.5">
              Hỗ trợ PNG, JPG, WEBP, GIF tối đa 10MB • Tự động upload lên Amazon S3
            </p>
          </div>
        )}

        {uploadError && (
          <div className="mt-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5 text-left">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
            <span className="flex-1">{uploadError}</span>
            <button
              type="button"
              onClick={() => setUploadError('')}
              className="text-rose-400 hover:text-rose-700"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Nhập link URL thủ công (fallback) */}
      <div className="relative">
        <input
          type="text"
          value={dishForm.imageUrl || ''}
          onChange={(e) => setDishForm({ ...dishForm, imageUrl: e.target.value })}
          placeholder="Hoặc dán trực tiếp đường dẫn URL ảnh (https://...)"
          className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#8a1e14] shadow-2xs text-xs font-mono"
        />
      </div>

      {/* Bộ Ảnh Mẫu: Mobile Băng Chuyền Ngang & Desktop Lưới 4 Cột */}
      <div className="mt-2.5 pt-2 border-t border-stone-200/70">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-stone-700 font-serif flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Bộ ảnh mẫu Phở 1986 (1-Chạm áp dụng nhanh):</span>
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
