import { supportedLanguages } from '@motd-menu/common';
import React, { FC, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { motdApi } from 'src/api';
import { addNotification } from 'src/hooks/state/notifications';
import {
  setPreferredLanguages,
  usePreferredLanguages,
} from 'src/hooks/state/preferredLanguages';
import { theme } from '~styles/theme';
import { DropDown } from './common/DropDown';
import { Page } from './common/Page';
import { Switch } from './common/Switch';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    gap: '0.5em',
    padding: '1em',
    minHeight: 0,
  },
  section: {
    backgroundColor: theme.bg1,
    borderRadius: '1em',
    flex: '1 1 50%',
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
    overflow: 'hidden auto',
    padding: '1em',
    alignItems: 'flex-start',
    border: '0.5em solid transparent',
  },
  langRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5em',
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
  return (
    <DropDown
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

  return (
    <div className={c.root}>
      <div className={c.section}>
        <h3>Main Language</h3>
        <p>
          Select your main language for chat translation. This is the language
          into which unknown languages will be translated
        </p>
        <LanguagePicker language={mainLang} setLanguage={setMainLang} />
      </div>
      <div className={c.section}>
        <h3>Other Languages</h3>
        <p>
          Select additional languages that you understand and don't need to be
          translated.
        </p>
        {Object.keys(supportedLanguages).map((lang) => (
          <span key={lang} className={c.langRow}>
            <Switch
              disabled={lang === mainLang}
              active={lang === mainLang || otherLangs.includes(lang)}
              setActive={(active) => setOtherLang(lang, active)}
            />
            {supportedLanguages[lang]}
          </span>
        ))}
      </div>
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
