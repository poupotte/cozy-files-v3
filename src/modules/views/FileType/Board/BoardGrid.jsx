import React from 'react'
import { useNavigate } from 'react-router-dom'

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
 * @param {number} [props.limit] - Number of boards shown at most
 * @param {string} [props.seeAllPath] - Page listing every board, linked from
 *   the title when the grid is limited
 * @param {Function} [props.Card] - Tile of a file, for the Office pages
 * @param {object} [props.cardProps] - Extra props of each tile
 * @param {string} [props.emptyLabel] - Text shown without any file
 */
export const BoardGrid = ({
  result,
  files,
  actions,
  title,
  limit,
  seeAllPath,
  Card = BoardCard,
  cardProps,
  emptyLabel
}) => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const isLoading = !result.lastFetch
  const shownFiles = limit ? files.slice(0, limit) : files

  return (
    <section aria-label={title ?? undefined}>
      {(title || seeAllPath) && (
        <div className={styles['boardSection-head']}>
          {title && <h2 className={styles['boardSection-title']}>{title}</h2>}
          {seeAllPath && (
            <Button
              variant="text"
              size="small"
              label={t('BoardHome.see_all')}
              onClick={() => navigate(seeAllPath)}
              data-testid="board-grid-see-all"
            />
          )}
        </div>
      )}
      {isLoading && <Spinner size="xxlarge" middle />}
      {!isLoading && files.length === 0 && (
        <p className={styles['boardGrid-empty']} data-testid="board-grid-empty">
          {emptyLabel ?? t('BoardHome.no_board')}
        </p>
      )}
      <ul className={styles['boardGrid']}>
        {shownFiles.map(file => (
          <Card key={file._id} file={file} actions={actions} {...cardProps} />
        ))}
      </ul>
      {!limit && result.hasMore && (
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
