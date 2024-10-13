import classNames from 'classnames';
import React, { FC, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import { activeItem } from '~styles/elements';
import { Spinner } from './Spinner';
import { ClassNameProps } from '~types/props';

const useStyles = createUseStyles({
  root: {
    flex: '1 1 auto',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  tabHeaders: {
    display: 'flex',
    gap: '1em',
    marginBottom: '1em',
    flexWrap: 'wrap',
  },
  tabHeader: {
    ...activeItem(),
    borderBottomWidth: '0.17em',
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    transition: 'border-color 0.5s',
    padding: '0.25em',
  },
  activeTabHeader: {
    borderBottomColor: 'currentColor',
  },
});

interface TabData {
  label: React.ReactNode;
  content: React.ReactNode;
}

export const Tabs: FC<{ tabs: TabData[] } & ClassNameProps> = ({
  tabs,
  className,
}) => {
  const c = useStyles();
  const tabPaths = Object.keys(tabs);
  const [selectedTab, setSelectedTab] = React.useState(0);
  const content = tabs[selectedTab].content;

  return (
    <div className={classNames(c.root, className)}>
      <div className={c.tabHeaders}>
        {tabPaths.map((tabPath, idx) => {
          const { label } = tabs[tabPath];
          const active = selectedTab === idx;
          return (
            <div
              className={classNames(c.tabHeader, active && c.activeTabHeader)}
              key={tabPath}
              onClick={() => setSelectedTab(idx)}
            >
              {label}
            </div>
          );
        })}
      </div>
      <Suspense fallback={<Spinner />}>{content}</Suspense>
    </div>
  );
};
