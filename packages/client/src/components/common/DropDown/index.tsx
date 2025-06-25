import classNames from 'classnames';
import React, {
  FocusEventHandler,
  MouseEventHandler,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createUseStyles } from 'react-jss';
import EditIcon from '~icons/pencil.svg';
import { activeItem, activeItemNoTransform } from '~styles/elements';
import { boxShadow } from '~styles/shadows';
import { theme } from '~styles/theme';
import { ClassNameProps } from '~types/props';

const useStyles = createUseStyles({
  root: {
    '&:not([data-open=true])': {
      ...activeItemNoTransform(),
    },
    display: 'flex',
    alignItems: 'center',
    gap: '0.2em',
    position: 'relative',
    outline: 'none',
  },
  backdrop: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 4,
    backgroundColor: theme.bg1,
  },
  search: {
    ...boxShadow(4),
    position: 'absolute',
    top: '-3em',
    left: '-0.5em',
    zIndex: 5,
  },
  options: {
    ...boxShadow(4),
    backgroundColor: theme.bg1,
    position: 'absolute',
    top: '-0.5em',
    left: '-0.5em',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 5,
    maxHeight: '10em',
    overflow: 'hidden auto',
    borderRadius: '0.5em',
    '& > $option': {
      ...activeItem(),
      padding: '0.5em',
    },
  },
  option: {
    whiteSpace: 'nowrap',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: '0 0 auto',
  },
  editIcon: {
    fontSize: '0.65em',
    flex: '0 0 auto',
  },
});

export interface DropDownOptionProps<TValue = unknown> {
  value: TValue;
  title?: string;
}

type DropDownProps<TValue = unknown> = ClassNameProps & {
  value: TValue;
  setValue: (value: TValue) => void;
  options: DropDownOptionProps<TValue>[];
  disabled?: boolean;
};

const DropDownOption = <TValue,>({
  option,
  onClick,
}: {
  option?: DropDownOptionProps<TValue>;
  onClick?: (value: TValue) => void;
}) => {
  const c = useStyles();

  if (!option) {
    return <div className={c.option}>Unknown</div>;
  }

  const { title, value } = option;

  return (
    <div className={c.option} onClick={() => onClick?.(value)}>
      {title ?? String(value)}
    </div>
  );
};

export const DropDown = <TValue,>({
  value,
  setValue,
  options,
  disabled,
  className,
}: DropDownProps<TValue>) => {
  const c = useStyles();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = React.useRef<HTMLInputElement>(null);
  const showSearch = options.length > 8;

  useEffect(() => {
    setSearchQuery('');
  }, [open]);

  const selectedOption = options.find((opt) => opt.value === value);

  const sortedOptions = useMemo(
    () =>
      [...options]
        .sort((a, b) =>
          a === selectedOption
            ? -1
            : b === selectedOption
              ? 1
              : a.title < b.title
                ? -1
                : a.title > b.title
                  ? 1
                  : 0,
        )
        .filter(
          (opt) =>
            !searchQuery ||
            opt === selectedOption ||
            opt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (typeof opt.value === 'string' &&
              opt.value.toLowerCase().includes(searchQuery.toLowerCase())),
        ),
    [options, selectedOption, searchQuery],
  );

  const onClick: MouseEventHandler = (e) => {
    if (disabled) return;
    if (e.target === searchRef.current) return;

    setOpen((c) => !c);
  };

  const onBlur: FocusEventHandler = (e) => {
    if (e.relatedTarget === searchRef.current) return;

    setOpen(false);
  };

  return (
    <div
      className={classNames(c.root, className)}
      tabIndex={0}
      onBlur={onBlur}
      onClick={onClick}
      data-open={open}
      data-disabled={disabled ?? false}
    >
      {open && <div className={c.backdrop}></div>}
      <DropDownOption option={selectedOption} />
      <EditIcon className={c.editIcon} />
      {open && (
        <>
          {showSearch && (
            <input
              type="text"
              className={c.search}
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              ref={searchRef}
              onBlur={(e) => e.stopPropagation()}
            />
          )}
          <div className={c.options}>
            {sortedOptions.map((opt, idx) => (
              <DropDownOption key={idx} option={opt} onClick={setValue} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
