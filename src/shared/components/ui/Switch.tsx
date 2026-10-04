import { classNames } from '@/shared/utils/classNames';

interface SwitchProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
  disabled?: boolean;
}

/** Công tắc bật/tắt cho các tuỳ chọn cài đặt. */
function Switch({ checked, onToggle, label, disabled = false }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      disabled={disabled}
      className={classNames(
        'relative w-10 h-6 rounded-full transition-colors shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        checked ? 'bg-primary' : 'bg-text-secondary/50',
      )}
    >
      <span
        aria-hidden="true"
        className={classNames(
          'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-4',
        )}
      />
    </button>
  );
}

export default Switch;
