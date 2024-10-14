import React, { FC, ReactNode } from 'react';
import { createUseStyles } from 'react-jss';
import { Link } from 'react-router-dom';
import RefreshIcon from '~icons/refresh.svg';
import { activeItem, outlineButton } from '~styles/elements';
import { theme } from '~styles/theme';
import { ChildrenProps } from '~types/props';
import { Page } from '.';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minHeight: 0,
  },
  footer: {
    flex: '0 0 auto',
    display: 'flex',
    gap: '1em',
    justifyContent: 'flex-end',
    marginTop: 'auto',
    background: theme.bg1,
    padding: '0.5em',
  },
  refreshButton: {
    ...activeItem(),
    display: 'flex',
    marginRight: '0.5em',
  },
  actionButton: {
    ...outlineButton(),
  },
});

type ActionPageClickActionProps = {
  action: () => void;
};

type ActionPageLinkActionProps = {
  to: string;
};

type ActionPageActionProps = ChildrenProps & {
  disabled?: boolean;
} & (ActionPageClickActionProps | ActionPageLinkActionProps);

export const ActionPageAction: FC<ActionPageActionProps> = (props) => {
  const c = useStyles();

  if ('to' in props) {
    return (
      <Link
        to={props.disabled ? '#' : props.to}
        className={c.actionButton}
        data-disabled={props.disabled}
      >
        {props.children}
      </Link>
    );
  } else {
    return (
      <div
        className={c.actionButton}
        onClick={props.action}
        data-disabled={props.disabled}
      >
        {props.children}
      </div>
    );
  }
};

export const ActionPage: FC<
  ChildrenProps & {
    title: ReactNode;
    refreshAction?: () => void;
    actions?: ActionPageActionProps[];
    headerContent?: ReactNode;
  }
> = ({ title, refreshAction, actions, headerContent, children }) => {
  const c = useStyles();

  return (
    <Page
      title={
        <>
          <h2>{title}</h2>
          {headerContent}
          {refreshAction && (
            <div className={c.refreshButton} onClick={refreshAction}>
              <RefreshIcon />
            </div>
          )}
        </>
      }
    >
      <div className={c.root}>
        {children}
        {actions?.length && (
          <div className={c.footer}>
            {actions.map((action, i) => (
              <ActionPageAction key={i} {...action} />
            ))}
          </div>
        )}
      </div>
    </Page>
  );
};
