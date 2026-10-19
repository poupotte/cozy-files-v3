import React from 'react'

import Button from 'cozy-ui/transpiled/react/Buttons'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import { useI18n } from 'twake-i18n'

import { BoardCard } from './BoardCard'
import styles from './board.styl'

/**
 * Boards of the page as tiles, the newest first, as the VK Board list.
 *
 * @param {object} props - Component props
 * @param {object} props.result - Query result of the section
 * @param {object[]} props.files - Boards to show
 * @param {object[]} props.actions - Actions of the page, from makeActions
 * @param {string|null} props.title - Title of the section, if any
 */
export const BoardGrid = ({ result, files, actions, title }) => {
  const { t } = useI18n()
  const isLoading = !result.lastFetch

  return (
    <section aria-label={title ?? undefined}>
      {title && <h2 className={styles['boardSection-title']}>{title}</h2>}
      {isLoading && <Spinner size="xxlarge" middle />}
      {!isLoading && files.length === 0 && (
        <p className={styles['boardGrid-empty']} data-testid="board-grid-empty">
          {t('BoardHome.no_board')}
        </p>
      )}
      <ul className={styles['boardGrid']}>
        {files.map(file => (
          <BoardCard key={file._id} file={file} actions={actions} />
        ))}
      </ul>
      {result.hasMore && (
        <div className="u-ta-center u-mv-1">
          <Button
            variant="secondary"
            label={t('table.load_more')}
            busy={result.fetchStatus === 'loading'}
            onClick={() => result.fetchMore()}
          />
        </div>
      )}
    </section>
  )
}
