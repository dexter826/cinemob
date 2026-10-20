import React from 'react';

interface ListboxSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
  inputRef: React.Ref<HTMLInputElement>;
}

/** Ô lọc tùy chọn bên trong listbox (dropdown/multi-select) — compact, không icon/xóa. */
function ListboxSearchInput({ value, onChange, onKeyDown, inputRef }: ListboxSearchInputProps) {
  return (
    <div className="p-2 border-b border-border-default">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Tìm kiếm…"
        aria-label="Tìm kiếm tùy chọn"
        autoComplete="off"
        spellCheck={false}
        className="w-full bg-surface border border-border-default rounded-control px-3 py-2 text-body focus-ring text-text-primary placeholder:text-text-muted"
      />
    </div>
  );
}

export default ListboxSearchInput;
