/** Bảng ánh xạ tên quốc gia từ Tiếng Anh sang Tiếng Việt. */
export const COUNTRY_TRANSLATIONS: Record<string, string> = {
  'United States of America': 'Mỹ',
  'United States': 'Mỹ',
  'USA': 'Mỹ',
  'Vietnam': 'Việt Nam',
  'Viet Nam': 'Việt Nam',
  'VN': 'Việt Nam',
  'South Korea': 'Hàn Quốc',
  'Korea': 'Hàn Quốc',
  'Japan': 'Nhật Bản',
  'China': 'Trung Quốc',
  'Hong Kong': 'Hồng Kông',
  'Taiwan': 'Đài Loan',
  'Thailand': 'Thái Lan',
  'United Kingdom': 'Anh',
  'UK': 'Anh',
  'France': 'Pháp',
  'Germany': 'Đức',
  'Italy': 'Ý',
  'Spain': 'Tây Ban Nha',
  'Canada': 'Canada',
  'Australia': 'Úc',
  'India': 'Ấn Độ',
  'Russia': 'Nga',
  'Brazil': 'Brazil',
  'Mexico': 'Mexico',
};

/** Danh sách quốc gia phổ biến dùng cho dropdown form. */
export const COUNTRY_OPTIONS = [
  { value: 'Mỹ', label: 'Mỹ' }, 
  { value: 'Việt Nam', label: 'Việt Nam' }, 
  { value: 'Hàn Quốc', label: 'Hàn Quốc' },
  { value: 'Nhật Bản', label: 'Nhật Bản' }, 
  { value: 'Trung Quốc', label: 'Trung Quốc' }, 
  { value: 'Thái Lan', label: 'Thái Lan' },
  { value: 'Anh', label: 'Anh' }, 
  { value: 'Pháp', label: 'Pháp' }, 
  { value: 'Đức', label: 'Đức' },
  { value: 'Ý', label: 'Ý' }, 
  { value: 'Tây Ban Nha', label: 'Tây Ban Nha' }, 
  { value: 'Ấn Độ', label: 'Ấn Độ' },
  { value: 'Hồng Kông', label: 'Hồng Kông' }, 
  { value: 'Đài Loan', label: 'Đài Loan' }, 
  { value: 'Khác', label: 'Khác' }
];

/** Hàm hỗ trợ dịch danh sách quốc gia. */
export const translateCountries = (countriesString: string): string => {
  if (!countriesString) return '';
  return countriesString
    .split(',')
    .map(c => {
      const trimmed = c.trim();
      return COUNTRY_TRANSLATIONS[trimmed] || trimmed;
    })
    .join(', ');
};
