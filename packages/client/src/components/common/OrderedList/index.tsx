import classNames from 'classnames';
import React, { FC, Fragment, Key, PointerEventHandler, useState } from 'react';
import { createUseStyles } from 'react-jss';
import DeleteIcon from '~icons/delete.svg';
import GripIcon from '~icons/grip.svg';
import { activeItem, verticalScroll } from '~styles/elements';
import { theme } from '~styles/theme';
import { ClassNameProps } from '~types/props';

const useStyles = createUseStyles({
  root: {
    ...verticalScroll(),
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    minHeight: 0,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
  },
  beforeTarget: {
    transform: 'translateY(-100%)',
  },
  afterTarget: {
    transform: 'translateY(100%)',
  },
  move: {
    cursor: 'move',
  },
  grip: {
    ...activeItem(),
    cursor: 'move',
    fontSize: '0.5em',
    '& *': {
      pointerEvents: 'none',
    },
  },
  grabbed: {},
  target: {
    height: '2px',
    margin: '-1px 0',
    background: `linear-gradient(90deg, transparent, ${theme.fg1}, transparent)`,
    flex: '0 0 auto',
  },
  deleteItem: {
    ...activeItem(),
    color: theme.fgError,
    fontSize: '0.75em',
    display: 'flex',
    padding: '0.5em',
    marginLeft: 'auto',
  },
});

type OrderedListProps<TItem> = {
  items: TItem[];
  setItems: (items: TItem[]) => void;
  getItemKey: (item: TItem) => Key;
  ItemComponent: FC<{ item: TItem }>;
  onDeleteClick?: (item: TItem, idx: number) => void;
};

export const OrderedList = <TItem,>({
  items,
  setItems,
  getItemKey,
  ItemComponent,
  className,
  onDeleteClick,
}: OrderedListProps<TItem> & ClassNameProps) => {
  const c = useStyles();

  const [srcIdx, setSrcIdx] = useState(null as number);
  const [targetIdx, setTargetIdx] = useState(null as number);

  const onItemPressed: PointerEventHandler<HTMLDivElement> = (e) => {
    const grip = e.target as HTMLDivElement;

    if (!grip.classList.contains(c.grip)) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    setSrcIdx(Number(grip.dataset.idx));
  };

  const onItemReleased: PointerEventHandler<HTMLDivElement> = (e) => {
    if (srcIdx == null) return;

    const list = e.currentTarget;

    const grabbed = list.querySelector(
      `:scope > .${c.grabbed}`,
    ) as HTMLDivElement;

    if (!grabbed) return;

    grabbed.style.removeProperty('transform');

    list.releasePointerCapture(e.pointerId);
    setSrcIdx(null);
    setTargetIdx(null);

    if (targetIdx == null) return;

    const newItems = [...items];
    newItems.splice(targetIdx, 0, items[srcIdx]);
    newItems.splice(targetIdx < srcIdx ? srcIdx + 1 : srcIdx, 1);

    setItems(newItems);
  };

  const onPointerMove: PointerEventHandler<HTMLDivElement> = (e) => {
    if (srcIdx == null) return;

    const list = e.currentTarget;

    const grabbed = list.querySelector(
      `:scope > .${c.grabbed}`,
    ) as HTMLDivElement;

    if (!grabbed) return;

    const centerY =
      list.getBoundingClientRect().top -
      list.scrollTop +
      grabbed.offsetTop +
      grabbed.offsetHeight / 2;

    grabbed.style.setProperty(
      'transform',
      `translateY(${Math.round(e.pageY - centerY)}px)`,
    );

    list
      .querySelectorAll(`:scope > .${c.item}:not(.${c.grabbed})`)
      .forEach((itemElement: HTMLDivElement, idx) => {
        if (!itemElement.classList?.contains(c.item)) return;

        const bounds = itemElement.getBoundingClientRect();
        const pageY = e.pageY;

        if (pageY >= bounds.top && pageY <= bounds.bottom) {
          let target = pageY < (bounds.top + bounds.bottom) / 2 ? idx : idx + 1;

          if (target > srcIdx) target++;

          if (target === srcIdx) target = null;

          setTargetIdx(target);
        }
      });
  };

  const renderedItems = items?.map((item, idx) => (
    <Fragment key={getItemKey(item)}>
      <div className={classNames(c.item, idx === srcIdx && c.grabbed)}>
        <div className={c.grip} data-idx={idx}>
          <GripIcon />
        </div>
        <ItemComponent item={item} />
        {onDeleteClick && (
          <div
            className={c.deleteItem}
            onClick={() => onDeleteClick(item, idx)}
          >
            <DeleteIcon />
          </div>
        )}
      </div>
    </Fragment>
  ));

  if (targetIdx != null) {
    renderedItems.splice(
      targetIdx,
      0,
      <div key="target" className={c.target}></div>,
    );
  }

  return (
    <div
      className={classNames(c.root, className, srcIdx != null && c.move)}
      onPointerUp={onItemReleased}
      onPointerDown={onItemPressed}
      onPointerMove={srcIdx != null ? onPointerMove : undefined}
    >
      {renderedItems}
    </div>
  );
};
