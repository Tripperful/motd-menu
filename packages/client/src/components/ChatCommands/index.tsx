import { ChatCommandInfo } from '@motd-menu/common';
import React, { ComponentProps, FC, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useChatCommands } from 'src/hooks/state/chatCommands';
import { Toggle } from '~components/common/Toggle';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    gap: '1em',
    minHeight: '20em',
  },
  cmdListPanel: {
    display: 'flex',
    gap: '1em',
    flexDirection: 'column',
    flex: '1 1 50%',
    alignItems: 'flex-start',
  },
  cmdList: {
    display: 'inline-flex',
    flexWrap: 'wrap',
    gap: '0.25em',
  },
  cmd: {
    padding: '0.25em 0.5em',
    backgroundColor: theme.bg1,
    borderRadius: '0.5em',
  },
});

const ChatCommandItem: FC<
  { cmd: ChatCommandInfo } & ComponentProps<typeof Toggle>
> = ({ cmd, ...props }) => {
  const c = useStyles();

  return (
    <Toggle className={c.cmd} {...props}>
      !{cmd.name}
    </Toggle>
  );
};

const CommandsList: FC<{
  commands: ChatCommandInfo[];
  selectedCommand: ChatCommandInfo;
  selectCommand: (command: ChatCommandInfo) => void;
}> = ({ commands, selectedCommand, selectCommand }) => {
  const c = useStyles();

  return (
    <div className={c.cmdList}>
      {commands.map((cmd, idx) => (
        <ChatCommandItem
          key={idx}
          cmd={cmd}
          active={selectedCommand === cmd}
          setActive={() => selectCommand(cmd)}
        />
      ))}
    </div>
  );
};

const CommandInfo: FC<{ cmd: ChatCommandInfo }> = ({ cmd }) => {
  const c = useStyles();

  return cmd ? (
    <>
      <big className={c.cmd}>!{cmd.name}</big>
      <div>{cmd.help}</div>
      {cmd.shortcuts?.length ? (
        <div>
          Shortcuts:{' '}
          <div className={c.cmdList}>
            {cmd.shortcuts.map((s, idx) => (
              <span key={idx} className={c.cmd}>
                !{s}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </>
  ) : (
    <div>Select a command on the left to see its info</div>
  );
};

export const ChatCommands: FC = () => {
  const c = useStyles();
  const commands = useChatCommands();
  const [selectedCmd, setSelectedCmd] = useState<ChatCommandInfo>(null);

  let [matchOnly, everywhere] = useMemo(() => {
    const matchOnly: ChatCommandInfo[] = [];
    const everywhere: ChatCommandInfo[] = [];

    for (const cmd of commands) {
      if (cmd.matchmakingOnly) {
        matchOnly.push(cmd);
      } else {
        everywhere.push(cmd);
      }
    }

    return [matchOnly, everywhere];
  }, [commands]);

  return (
    <div className={c.root}>
      <div className={c.cmdListPanel}>
        <div>Matchmaking commands</div>
        <div className={c.cmdList}>
          <CommandsList
            commands={matchOnly}
            selectedCommand={selectedCmd}
            selectCommand={setSelectedCmd}
          />
        </div>
        <div>Other commands</div>
        <div className={c.cmdList}>
          <CommandsList
            commands={everywhere}
            selectedCommand={selectedCmd}
            selectCommand={setSelectedCmd}
          />
        </div>
      </div>
      <div className={c.cmdListPanel}>
        <CommandInfo cmd={selectedCmd} />
      </div>
    </div>
  );
};
