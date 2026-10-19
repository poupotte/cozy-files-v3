import { Icon, Dots } from '@linagora/twake-icons'
import React, { useRef, useState } from 'react'

import { splitFilename } from 'cozy-client/dist/models/file'
import ActionsMenu from 'cozy-ui/transpiled/react/ActionsMenu'
import IconButton from 'cozy-ui/transpiled/react/IconButton'
import { useI18n } from 'twake-i18n'

import { OfficePreview } from './OfficePreview'
import styles from './office.styl'
import boardStyles from '../Board/board.styl'

import { useFormattedUpdatedAt } from '@/modules/filelist/useFormattedUpdatedAt'
import { useFileLink } from '@/modules/navigation/hooks/useFileLink'

/**
 * Tile of an Office file, laid out as the board tiles: its preview, its name
 * and when it was last changed, with the file actions behind the dots of its
 * top right corner.
 *
 * @param {object} props - Component props
 * @param {object} props.file - The io.cozy.files doc
 * @param {object[]} props.actions - Actions of the page, from makeActions
 * @param {string} props.fileType - Type of the page (text, sheet or slide)
 */
export const OfficeCard = ({ file, actions, fileType }) => {
  const { t } = useI18n()
  const { openLink } = useFileLink(file)
  const anchorRef = useRef(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const updatedAt = useFormattedUpdatedAt(file.updated_at)
  const { filename } = splitFilename(file)

  const handleMenuClick = event => {
    event.stopPropagation()
    setIsMenuOpen(isOpen => !isOpen)
  }

  return (
    <li
      className={`${boardStyles['boardCard']} ${styles['officeCard']}`}
      data-testid="office-card"
    >
      <button
        type="button"
        className={boardStyles['boardCard-open']}
        onClick={openLink}
        aria-label={t('BoardHome.open', { name: filename })}
      >
        <OfficePreview file={file} shape={fileType} />
        <span className={boardStyles['boardCard-name']}>{filename}</span>
        {updatedAt && (
          <span className={boardStyles['boardCard-date']}>
            {t('BoardHome.updated', { date: updatedAt })}
          </span>
        )}
      </button>
      <IconButton
        ref={anchorRef}
        size="small"
        className={boardStyles['boardCard-menu']}
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
