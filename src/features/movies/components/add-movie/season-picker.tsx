import { Dropdown } from '@/shared/components/ui';

interface SeasonPickerProps {
  value: number;
  onChange: (season: number) => void;
  episodesPerSeason: Record<number, number>;
  maxSeasons: number;
  disabled?: boolean;
}

function SeasonPicker({
  value,
  onChange,
  episodesPerSeason,
  maxSeasons,
  disabled = false,
}: SeasonPickerProps) {
  const positiveSeasons = Object.keys(episodesPerSeason)
    .map(Number)
    .filter((n) => episodesPerSeason[n] > 0)
    .sort((a, b) => a - b);
  const seasonNumbers =
    positiveSeasons.length > 0
      ? positiveSeasons
      : Array.from({ length: Math.max(maxSeasons, 1) }, (_, i) => i + 1);

  return (
    <Dropdown
      aria-label="Chọn mùa"
      disabled={disabled}
      options={seasonNumbers.map((n) => ({
        value: n,
        label: `Mùa ${n}${episodesPerSeason[n] ? ` · ${episodesPerSeason[n]} tập` : ''}`,
      }))}
      value={value}
      onChange={(v) => onChange(Number(v))}
    />
  );
}

export default SeasonPicker;
