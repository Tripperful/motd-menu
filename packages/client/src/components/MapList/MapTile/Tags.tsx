import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  tag: {
    border: '0.2em solid currentColor',
    padding: '0 0.4em',
    borderRadius: '1em',
    textWrap: 'nowrap',
  },
});

export const Tags: FC<{ tags: string[] }> = ({ tags }) => {
  const c = useStyles();

  return (
    <>
      {tags?.map((tag) => (
        <div key={tag} className={c.tag}>
          {tag}
        </div>
      ))}
    </>
  );
};
