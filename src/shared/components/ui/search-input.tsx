import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Nhãn sr-only; mặc định "Tìm kiếm". */
  label?: string;
  id?: string;
  /** Class cho khối bao ngoài (độ rộng, margin...). */
  className?: string;
  autoFocus?: boolean;
}

/**
 * Ô tìm kiếm DUY NHẤT của app: h-11, nền trong suốt + hairline,
 * icon search trái, nút xóa phải — mọi trang dùng chung để không lệch nhịp.
 */
function SearchInput({
  value,
  onChange,
  placeholder = 'Tìm kiếm…',
  label = 'Tìm kiếm',
  id,
  className,
  autoFocus = false,
}: SearchInputProps) {
  const inputId = id ?? 'search-input';

  return (
    <div className={`relative ${className ?? ''}`}>
      <Search
        size={16}
        strokeWidth={1.5}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
        aria-hidden="true"
      />
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        autoFocus={autoFocus}
        className="w-full h-11 bg-transparent border border-border rounded-control pl-10 pr-9 text-sm font-medium text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:border-primary transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Xóa từ khóa tìm kiếm"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          <X size={15} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
