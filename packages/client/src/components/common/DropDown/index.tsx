import React, { useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import ArrowDownIcon from '~icons/chevron-down.svg';
import ArrowUpIcon from '~icons/chevron-up.svg';
import { activeItem } from '~styles/elements';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  root: {
    '&:not([data-open=true])': {
      ...activeItem(),
    },
    display: 'flex',
    alignItems: 'center',
    gap: '0.2em',
    position: 'relative',
    outline: 'none',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 4,
    backgroundColor: theme.bg1,
  },
  arrow: {
    fontSize: '0.5em',
    flex: '0 0 auto',
  },
  options: {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.5em',
    zIndex: 5,
  },
  option: {
    ...activeItem(),
    whiteSpace: 'nowrap',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export interface DropDownOptionProps<TValue = unknown> {
  value: TValue;
  title?: string;
}

interface DropDownProps<TValue = unknown> {
  value: TValue;
  setValue: (value: TValue) => void;
  options: DropDownOptionProps<TValue>[];
}

const DropDownOption = <TValue,>(
  option: DropDownOptionProps<TValue> & {
    onClick: (value: TValue) => void;
  },
) => {
  const c = useStyles();
  const { title, value, onClick } = option;
  return (
    <div className={c.option} onClick={() => onClick(value)}>
      {title ?? String(value)}
    </div>
  );
};

export const DropDown = <TValue,>({
  value,
  setValue,
  options,
}: DropDownProps<TValue>) => {
  const c = useStyles();
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const sortedOptions = useMemo(
    () =>
      [...options].sort((a, b) =>
        a === selectedOption
          ? -1
          : b === selectedOption
          ? 1
          : a.title < b.title
          ? -1
          : a.title > b.title
          ? 1
          : 0,
      ),
    [options, selectedOption],
  );

  return (
    <div
      className={c.root}
      tabIndex={0}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen((c) => !c)}
      data-open={open}
    >
      {open && <div className={c.backdrop}></div>}
      {selectedOption ? (
        <DropDownOption {...selectedOption} onClick={null} />
      ) : (
        'INVALID'
      )}
      {open ? (
        <ArrowUpIcon className={c.arrow} />
      ) : (
        <ArrowDownIcon className={c.arrow} />
      )}
      {open && (
        <div className={c.options}>
          {sortedOptions.map((opt, idx) => (
            <DropDownOption key={idx} {...opt} onClick={setValue} />
          ))}
        </div>
      )}
    </div>
  );
};
