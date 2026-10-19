import { Icon, CrossSmall } from '@linagora/twake-icons'
import React from 'react'

import { splitFilename } from 'cozy-client/dist/models/file'
import IconButton from 'cozy-ui/transpiled/react/IconButton'
import { useI18n } from 'twake-i18n'

import styles from './userTemplates.styl'
import boardStyles from '../Board/board.styl'

/**
 * Tiles of the templates the user saved, after the templates of the page in
 * its Create block, each with a discreet button removing it.
 *
 * @param {object} props - Component props
 * @param {object[]} props.templates - Templates the user saved
 * @param {Function} props.renderPreview - Preview of a template file
 * @param {Function} props.onCreate - Creates a file from a template
 * @param {Function} props.onRemove - Puts a template in the trash
 * @param {boolean} props.isCreating - Whether a file is being created
 */
export const UserTemplateTiles = ({
  templates,
  renderPreview,
  onCreate,
  onRemove,
  isCreating
}) => {
  const { t } = useI18n()

  return templates.map(template => {
    const { filename } = splitFilename(template)
    return (
      <li key={template._id} className={styles['userTemplate']}>
        <button
          type="button"
          className={boardStyles['boardTemplate']}
          disabled={isCreating}
          onClick={() => onCreate(template)}
          data-testid="user-template"
        >
          {renderPreview(template)}
          <span className={boardStyles['boardTemplate-name']}>{filename}</span>
        </button>
        <IconButton
          size="small"
          className={styles['userTemplate-remove']}
          aria-label={t('UserTemplates.remove', { name: filename })}
          onClick={() => onRemove(template)}
          data-testid="user-template-remove"
        >
          <Icon icon={CrossSmall} />
        </IconButton>
      </li>
    )
  })
}
