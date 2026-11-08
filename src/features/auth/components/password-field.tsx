import { useState, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import TextField from '@/shared/components/ui/text-field';
import IconButton from '@/shared/components/ui/icon-button';

export default function PasswordField(props: ComponentProps<typeof TextField>) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      trailingAction={
        <IconButton
          label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          aria-pressed={visible}
          size="sm"
          disabled={props.disabled}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </IconButton>
      }
    />
  );
}
