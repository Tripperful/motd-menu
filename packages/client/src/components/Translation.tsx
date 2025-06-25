import { supportedLanguages } from '@motd-menu/common';
import React, { FC, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { motdApi } from 'src/api';
import { addNotification } from 'src/hooks/state/notifications';
import {
  setPreferredLanguages,
  usePreferredLanguages,
} from 'src/hooks/state/preferredLanguages';
import EditIcon from '~icons/pencil.svg';
import { activeItemNoTransform } from '~styles/elements';
import { theme } from '~styles/theme';
import { DropDown } from './common/DropDown';
import { Page } from './common/Page';
import { Popup } from './common/Popup';
import { Switch } from './common/Switch';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5em',
    padding: '4em',
    minHeight: 0,
    fontSize: '1.2em',
    flex: '1 1 auto',
  },
  content: {
    backgroundColor: theme.bg1,
    padding: '1em',
    borderRadius: '1em',
    maxWidth: 'min(50em, 60vw)',
    lineHeight: '1.5em',
  },
  langRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
  },
  otherLangs: {
    ...activeItemNoTransform(),
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2em',
  },
  otherLangsPopup: {
    maxHeight: 'calc(100vh - 10em)',
    width: '50vw',
  },
  otherLangsPopupContent: {
    height: '30em',
    overflow: 'hidden scroll',
    marginRight: '-0.5em',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(10em, 1fr))',
    alignContent: 'start',
    gap: '0.5em',
  },
  inlineDropDown: {
    display: 'inline-flex',
  },
  editIcon: {
    fontSize: '0.65em',
    flex: '0 0 auto',
  },
});

const supportedLanguagesOptions = Object.entries(supportedLanguages).map(
  ([value, title]) => ({
    value,
    title,
  }),
);

const LanguagePicker: FC<{
  language: string;
  setLanguage: (lang: string) => void;
}> = ({ language, setLanguage }) => {
  const c = useStyles();
  return (
    <DropDown
      className={c.inlineDropDown}
      value={language}
      setValue={setLanguage}
      options={supportedLanguagesOptions}
    />
  );
};

const TranslationContent: FC = () => {
  const c = useStyles();
  const languages = usePreferredLanguages() ?? ['en'];

  const mainLang = languages[0];
  const otherLangs = languages.slice(1);

  const setMainLang = (lang: string) => {
    if (lang === mainLang) return;
    setPreferredLanguages([
      lang,
      ...languages.filter((l) => l !== mainLang && l !== lang),
    ]);
  };

  const setOtherLang = (lang: string, active: boolean) => {
    if (active) {
      if (!otherLangs.includes(lang)) {
        otherLangs.push(lang);
      }
    } else {
      const index = otherLangs.indexOf(lang);
      if (index !== -1) {
        otherLangs.splice(index, 1);
      }
    }
    setPreferredLanguages([mainLang, ...otherLangs]);
  };

  useEffect(() => {
    motdApi.setPreferredLanguages(languages).catch(() => {
      addNotification('error', 'Failed to save preferred languages');
    });
  }, [languages]);

  const [showOtherLangs, setShowOtherLangs] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    setSearchQuery('');
  }, [showOtherLangs]);

  return (
    <div className={c.root}>
      <span className={c.content}>
        <span>My primary language is </span>
        <LanguagePicker language={mainLang} setLanguage={setMainLang} />
        <br />
        <span>Besides that, I understand </span>
        <span className={c.otherLangs} onClick={() => setShowOtherLangs(true)}>
          {otherLangs.length > 0 ? (
            <span>
              {otherLangs.map((l) => supportedLanguages[l]).join(', ')}
            </span>
          ) : (
            <span>no other languages</span>
          )}
          <EditIcon className={c.editIcon} />
        </span>
        {showOtherLangs && (
          <Popup
            className={c.otherLangsPopup}
            title="Other languages I understand"
            onClose={() => setShowOtherLangs(false)}
          >
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className={c.otherLangsPopupContent}>
              {Object.entries(supportedLanguages)
                .filter(([lang, langName]) => {
                  if (searchQuery) {
                    return (
                      langName
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      lang.includes(searchQuery)
                    );
                  }
                  return true;
                })
                .map(([lang, langName]) => (
                  <span key={lang} className={c.langRow}>
                    <Switch
                      disabled={lang === mainLang}
                      active={lang === mainLang || otherLangs.includes(lang)}
                      setActive={(active) => setOtherLang(lang, active)}
                    />
                    {langName}
                  </span>
                ))}
            </div>
          </Popup>
        )}
      </span>
    </div>
  );
};

export const Translation: FC = () => {
  return (
    <Page title={<h2>Chat translation settings</h2>}>
      <TranslationContent />
    </Page>
  );
};
