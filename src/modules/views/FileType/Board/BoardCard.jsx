import { Icon, Dots } from '@linagora/twake-icons'
import React, { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { splitFilename } from 'cozy-client/dist/models/file'
import ActionsMenu from 'cozy-ui/transpiled/react/ActionsMenu'
import IconButton from 'cozy-ui/transpiled/react/IconButton'
import { useI18n } from 'twake-i18n'

import { BoardPreview } from './BoardPreview'
import styles from './board.styl'

import { useFormattedUpdatedAt } from '@/modules/filelist/useFormattedUpdatedAt'
import { makeExcalidrawFileRoute } from '@/modules/views/Excalidraw/helpers'

/**
 * Tile of a board: its drawing, its name and when it was last changed, with
 * the file actions behind the dots of its top right corner.
 *
 * @param {object} props - Component props
 * @param {object} props.file - The io.cozy.files board
 * @param {object[]} props.actions - Actions of the page, from makeActions
 */
export const BoardCard = ({ file, actions }) => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const anchorRef = useRef(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const updatedAt = useFormattedUpdatedAt(file.updated_at)
  const { filename } = splitFilename(file)

  const handleOpen = () =>
    navigate(
      makeExcalidrawFileRoute(file._id, {
        driveId: file.driveId,
        fromPathname: `${pathname}${search}`
      })
    )

  const handleMenuClick = event => {
    event.stopPropagation()
    setIsMenuOpen(isOpen => !isOpen)
  }

  return (
    <li className={styles['boardCard']} data-testid="board-card">
      <button
        type="button"
        className={styles['boardCard-open']}
        onClick={handleOpen}
        aria-label={t('BoardHome.open', { name: filename })}
      >
        <BoardPreview file={file} />
        <span className={styles['boardCard-name']}>{filename}</span>
        {updatedAt && (
          <span className={styles['boardCard-date']}>
            {t('BoardHome.updated', { date: updatedAt })}
          </span>
        )}
      </button>
      <IconButton
        ref={anchorRef}
        size="small"
        className={styles['boardCard-menu']}
        aria-label={t('BoardHome.more')}
        onClick={handleMenuClick}
      >
        <Icon icon={Dots} />
      </IconButton>
      {isMenuOpen && (
        <ActionsMenu
          open
          ref={anchorRef}
          docs={[file]}
          actions={actions}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          autoClose
          onClose={() => setIsMenuOpen(false)}
        />
      )}
    </li>
  )
}
