import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Skeleton from '@/shared/components/ui/skeleton';
import { classNames } from '@/shared/utils/class-names';

export interface TabItem<T extends string = string> {
  key: T;
  label: React.ReactNode;
  count?: number | string;
  loadingCount?: boolean;
}

export interface TabsProps<T extends string = string> {
  items: readonly TabItem<T>[] | TabItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  label: string;
  className?: string;
  tabClassName?: string;
  layoutId?: string;
  borderBottom?: boolean;
}

export function Tabs<T extends string = string>({
  items,
  activeKey,
  onChange,
  label,
  className,
  tabClassName,
  layoutId,
  borderBottom = false,
}: TabsProps<T>) {
  const reducedMotion = useReducedMotion() ?? false;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % items.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + items.length) % items.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = items.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const nextTab = tabRefs.current[nextIndex];
      nextTab?.focus();
      onChange(items[nextIndex].key);
    }
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className={classNames(
        'flex items-center',
        borderBottom ? 'border-b border-border' : '',
        className ?? '',
      )}
    >
      {items.map((tab, index) => {
        const isActive = activeKey === tab.key;
        return (
          <button
            key={tab.key}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.key)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={classNames(
              'relative flex items-center px-3.5 transition-colors cursor-pointer select-none',
              'focus-ring focus-visible:outline-none',
              isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary',
              tabClassName ?? 'h-11 text-label-caps',
            )}
          >
            <span>{tab.label}</span>
            {tab.loadingCount ? (
              <span className="ml-1.5 opacity-60">
                <Skeleton as="span" className="inline-block h-3 w-5 align-middle" />
              </span>
            ) : tab.count !== undefined ? (
              <span
                className={classNames(
                  'ml-1.5 tabular-nums',
                  isActive ? 'text-primary' : 'opacity-60',
                )}
              >
                {tab.count}
              </span>
            ) : null}

            {isActive &&
              (layoutId ? (
                <motion.span
                  layoutId={reducedMotion ? undefined : layoutId}
                  className="absolute inset-x-3 bottom-[-1px] h-0.5 bg-primary"
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 bottom-[-1px] h-0.5 bg-primary"
                />
              ))}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
