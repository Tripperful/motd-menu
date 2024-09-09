import { NewsData, NewsPreview, SteamPlayerData } from '@motd-menu/common';
import classNames from 'classnames';
import React, { FC, Suspense, useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import Markdown from 'react-markdown';
import { JsxRuntimeComponents } from 'react-markdown/lib';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import {
  createNews,
  deleteNews,
  editNews,
  fetchMoreNewsPreviews,
  markNewsRead,
  publishNews,
  useNews,
  useNewsPreviews,
} from 'src/hooks/state/news';
import { addNotification } from 'src/hooks/state/notifications';
import { useMyPermissions } from 'src/hooks/state/permissions';
import { usePlayerSteamProfile } from 'src/hooks/state/players';
import { useConfirmDialog } from 'src/hooks/useConfirmDialog';
import { useGoBack } from 'src/hooks/useGoBack';
import { usePlayersProfiles } from 'src/hooks/usePlayersProfiles';
import { dateFormat } from 'src/util';
import { PlayerDetails } from '~components/PlayersMenu/PlayerDetails';
import { CopyOnClick } from '~components/common/CopyOnClick';
import { PageFetcher } from '~components/common/PageFetcher';
import { PlayerItem } from '~components/common/PlayerItem';
import { Popup } from '~components/common/Popup';
import { SidePanel } from '~components/common/SidePanel';
import CopyIcon from '~icons/copy.svg';
import LoadingIcon from '~icons/loading.svg';
import { activeItem, activeItemNoTransform } from '~styles/elements';
import { theme } from '~styles/theme';

const useStyles = createUseStyles({
  newsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
    padding: '1em',
    overflow: 'hidden scroll',
  },
  newsRow: {
    display: 'flex',
    gap: '1em',
  },
  activeNoTransform: activeItemNoTransform(),
  newsItem: {
    ...activeItemNoTransform(),
    borderRadius: '0.5em',
    display: 'flex',
    gap: '1em',
    flex: '1 1 100%',
  },
  newsPopup: {
    width: '50vw',
    height: '80vh',
    '& a': {
      ...activeItemNoTransform(),
    },
    display: 'flex',
    flexDirection: 'column',
  },
  newsTitle: {
    fontSize: '2em',
    display: 'flex',
    marginBottom: '0.5em',
  },
  newsPublishInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    opacity: 0.5,
    fontSize: '0.8em',
  },
  newsContent: {
    overflow: 'hidden scroll',
    marginRight: '-1em',
    paddingRight: '0.5em',
    '& img': {
      maxWidth: '100%',
    },
    '& th, td': {
      padding: '0.5em',
      outline: `2px solid ${theme.fg3}`,
    },
    '& blockquote': {
      borderLeft: `0.25em solid ${theme.fg3}`,
      paddingLeft: '0.75em',
    },
  },
  newsRenderer: {
    display: 'flex',
    flexDirection: 'column',
  },
  publishDate: {
    fontSize: '0.8em',
    marginLeft: 'auto',
    whiteSpace: 'nowrap',
  },
  dot: {
    width: '0.5em',
    height: '0.5em',
    borderRadius: '50%',
    marginTop: '0.4em',
    marginRight: '-0.5em',
  },
  unpublished: {
    backgroundColor: theme.fgSuccess,
    animation: '$blink 3s infinite',
  },
  unread: {
    backgroundColor: theme.fgInfo,
    animation: '$blink 3s infinite',
  },
  copyIcon: {
    fontSize: '0.5em',
    marginRight: '0.25em',
  },
  editButton: {
    ...activeItem(),
    marginLeft: 'auto',
  },
  editing: {
    width: 'calc(100vw - 4em)',
  },
  editorWrapper: {
    flex: '1 1 auto',
    minHeight: 0,
    display: 'flex',
    gap: '1em',
    '& > div': {
      flex: '1 1 100%',
      minWidth: 0,
    },
  },
  editor: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
    '& textarea': {
      flex: '1 1 100%',
    },
  },
  createNewsButton: {
    ...activeItemNoTransform(),
    alignSelf: 'flex-end',
  },
  editActions: {
    display: 'flex',
    gap: '1em',
    justifyContent: 'flex-end',
    '& > div': {
      ...activeItem(),
    },
  },
  views: {
    display: 'grid',
    position: 'relative',
    gridTemplateColumns: 'repeat(auto-fill, minmax(15em, 1fr))',
    alignContent: 'start',
    gap: '0.5em',
    flex: '1 1 auto',
    overflow: 'hidden scroll',
    padding: '0.5em',
  },
  '@keyframes blink': {
    '0%': {
      opacity: 1,
    },
    '5%': {
      opacity: 0.5,
    },
    '10%': {
      opacity: 1,
    },
  },
  loading: {
    fontSize: '4em',
    margin: 'auto',
  },
});

const NewsPreviewItem: FC<{ newsPreview: NewsPreview }> = ({ newsPreview }) => {
  const c = useStyles();
  const { id, title, createdOn, publishedOn, readOn } = newsPreview;

  return (
    <div className={c.newsRow}>
      {publishedOn ? (
        readOn ? null : (
          <div className={classNames(c.dot, c.unread)} />
        )
      ) : (
        <div className={classNames(c.dot, c.unpublished)} />
      )}
      <Link className={c.newsItem} to={id}>
        <div>{title}</div>
        <div className={c.publishDate}>
          {publishedOn
            ? 'Published' + dateFormat(publishedOn)
            : 'Created ' + dateFormat(createdOn)}
        </div>
      </Link>
    </div>
  );
};

const customMarkdownComponents: Partial<JsxRuntimeComponents> = {
  a: ({ node, ...props }) => {
    const c = useStyles();

    const { href, children } = props;

    if (href && href.startsWith('copy://')) {
      return (
        <CopyOnClick className={c.activeNoTransform} copyText={href.slice(7)}>
          <CopyIcon className={c.copyIcon} />
          {children}
        </CopyOnClick>
      );
    }

    return <a {...props} />;
  },
};

const NewsRenderer: FC<{ news: NewsData; author: SteamPlayerData }> = ({
  news,
  author,
}) => {
  const c = useStyles();
  const permissions = useMyPermissions();

  const { title, content, authorSteamId, publishedOn, createdOn, readBy } =
    news;

  const canEdit = permissions.includes('news_create');
  const canPublish = permissions.includes('news_publish');
  const isEditor = canEdit || canPublish;

  return (
    <div className={c.newsRenderer}>
      <div className={c.newsTitle}>
        <span>{title}</span>
      </div>
      {isEditor && (
        <Link to="views" className={c.editButton}>
          Views ({readBy.length})
        </Link>
      )}
      <div className={c.newsPublishInfo}>
        <span>
          <span>{publishedOn ? 'Published by' : 'Created by'}</span>
          &nbsp;
          <Link to={'author/' + authorSteamId}>
            {author?.name ?? authorSteamId}
          </Link>
          &nbsp;
          {publishedOn ? dateFormat(publishedOn) : dateFormat(createdOn)}
        </span>
      </div>
      <div className={c.newsContent}>
        <Markdown
          remarkPlugins={[remarkGfm]}
          urlTransform={(url) => url}
          components={customMarkdownComponents}
        >
          {content}
        </Markdown>
      </div>
    </div>
  );
};

const NewsContent: FC<{
  newsId: string;
  editing: boolean;
  setEditing: (editing: boolean) => void;
}> = ({ newsId, editing, setEditing }) => {
  const c = useStyles();
  const news = useNews(newsId);
  const author = usePlayerSteamProfile(news.authorSteamId);
  const [tempNews, setTempNews] = useState(news);
  const nav = useNavigate();
  const permissions = useMyPermissions();

  const published = !!news.publishedOn;

  const canEdit = permissions.includes('news_create');
  const canPublish =
    (permissions.includes('news_publish') || canEdit) && !published;

  useEffect(() => {
    if (!editing) {
      setTempNews(news);
    }
  }, [news, editing]);

  useEffect(() => {
    if (newsId && news.publishedOn && !news.readOn) {
      markNewsRead(newsId);
    }
  }, [newsId, news.readOn]);

  const [saveConfirmDialog, showSaveConfirmDialog] = useConfirmDialog(
    'Do you want to save the changes?',
    async () => {
      try {
        if (newsId) {
          const newsData = await editNews(
            newsId,
            tempNews.title,
            tempNews.content,
          );

          if (!newsData) throw new Error('Failed to save news');
        } else {
          const newsData = await createNews(tempNews.title, tempNews.content);

          if (!newsData) throw new Error('Failed to save news');

          nav(`../${newsData.id}`);
        }

        setEditing(false);
        addNotification('success', 'News saved');
      } catch {
        addNotification('error', 'Failed to save news');
      }
    },
  );

  const [deleteConfirmDialog, showDeleteConfirmDialog] = useConfirmDialog(
    'Do you want to delete this news?',
    async () => {
      try {
        if (newsId) {
          await deleteNews(newsId);

          nav('..');
          addNotification('success', 'News deleted');
        }
      } catch {
        addNotification('error', 'Failed to delete news');
      }
    },
  );

  const [publishConfirmDialog, showPublishConfirmDialog] = useConfirmDialog(
    'Do you want to publish this news?',
    async () => {
      try {
        publishNews(newsId);
        nav('..');
        addNotification('success', 'News published');
      } catch {
        addNotification('error', 'Failed to publish news');
      }
    },
  );

  return (
    <>
      <div className={c.editorWrapper}>
        {editing && (
          <div className={c.editor}>
            <input
              type="text"
              value={tempNews.title}
              placeholder="Title..."
              onChange={(e) => {
                setTempNews((prev) => ({ ...prev, title: e.target.value }));
              }}
            />
            <textarea
              placeholder="News text..."
              value={tempNews.content}
              onChange={(e) => {
                setTempNews((prev) => ({ ...prev, content: e.target.value }));
              }}
            />
          </div>
        )}
        <NewsRenderer news={editing ? tempNews : news} author={author} />
      </div>
      {(canEdit || (canPublish && !published)) && (
        <div className={c.editActions}>
          {editing ? (
            <>
              <div onClick={showSaveConfirmDialog}>Save</div>
              <div onClick={() => setEditing(false)}>Cancel</div>
            </>
          ) : (
            <>
              {canEdit && <div onClick={() => setEditing(!editing)}>Edit</div>}
              {canEdit && newsId && (
                <div onClick={showDeleteConfirmDialog}>Delete</div>
              )}
              {canPublish && (
                <div onClick={showPublishConfirmDialog}>Publish</div>
              )}
            </>
          )}
        </div>
      )}
      {saveConfirmDialog}
      {deleteConfirmDialog}
      {publishConfirmDialog}
    </>
  );
};

const NewsViews: FC = () => {
  const c = useStyles();
  const { newsId } = useParams();
  const { readBy } = useNews(newsId);

  const viewersProfiles = usePlayersProfiles(readBy);

  return (
    <div className={c.views}>
      {Object.entries(viewersProfiles).map(([steamId, profile], i) => (
        <Link key={i} to={steamId} className={c.activeNoTransform}>
          <PlayerItem profile={profile} />
        </Link>
      ))}
    </div>
  );
};

const NewsPopup: FC = () => {
  const c = useStyles();
  const { newsId } = useParams();
  const goBack = useGoBack();
  const [editing, setEditing] = useState(!newsId);

  return (
    <Popup
      title={editing ? `News (${newsId ? 'editing' : 'creating'})` : 'News'}
      onClose={goBack}
      className={classNames(c.newsPopup, editing && c.editing)}
    >
      <Suspense fallback={<LoadingIcon className={c.loading} />}>
        <NewsContent
          newsId={newsId}
          editing={editing}
          setEditing={setEditing}
        />
        <Routes>
          <Route
            path="author/:steamId/*"
            element={<PlayerDetails backPath="../.." />}
          />
          <Route
            path="views"
            element={
              <SidePanel title="News views">
                <Suspense>
                  <NewsViews />
                </Suspense>
              </SidePanel>
            }
          />
          <Route path="views/:steamId" element={<PlayerDetails />} />
        </Routes>
      </Suspense>
    </Popup>
  );
};

const News: FC = () => {
  const c = useStyles();
  const { news, hasMore } = useNewsPreviews();
  const canCreate = useMyPermissions().includes('news_create');

  return (
    <div className={c.newsList}>
      {canCreate && (
        <Link to="create" className={c.createNewsButton}>
          Create
        </Link>
      )}
      {news.length === 0 ? (
        <div>No news yet</div>
      ) : (
        news.map((newsPreview) => (
          <NewsPreviewItem key={newsPreview.id} newsPreview={newsPreview} />
        ))
      )}
      <PageFetcher hasMore={hasMore} loadMore={fetchMoreNewsPreviews} />
      <Routes>
        <Route path="create" element={<NewsPopup />} />
        <Route path=":newsId/*" element={<NewsPopup />} />
      </Routes>
    </div>
  );
};

export default News;
