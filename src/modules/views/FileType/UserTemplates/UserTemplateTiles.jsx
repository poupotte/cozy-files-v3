import { Icon, CrossSmall, Pen, Plus } from '@linagora/twake-icons'
import cx from 'classnames'
import React from 'react'

import { splitFilename } from 'cozy-client/dist/models/file'
import IconButton from 'cozy-ui/transpiled/react/IconButton'
import { useI18n } from 'twake-i18n'

import styles from './userTemplates.styl'
import boardStyles from '../Board/board.styl'

const EditButton = ({ name, onClick }) => {
  const { t } = useI18n()
  return (
    <IconButton
      size="small"
      className={styles['userTemplate-action']}
      aria-label={t('UserTemplates.edit', { name })}
      onClick={onClick}
      data-testid="user-template-edit"
    >
      <Icon icon={Pen} />
    </IconButton>
  )
}

const RemoveButton = ({ name, onClick }) => {
  const { t } = useI18n()
  return (
    <IconButton
      size="small"
      className={styles['userTemplate-action']}
      aria-label={t('UserTemplates.remove', { name })}
      onClick={onClick}
      data-testid="user-template-remove"
    >
      <Icon icon={CrossSmall} />
    </IconButton>
  )
}

/**
 * Tile of a template of the page in its Create block, with discreet buttons
 * editing it, a copy of it then taking its place, and removing it.
 *
 * @param {object} props - Component props
 * @param {string} props.name - Name of the template
 * @param {Function} [props.onEdit] - Edits the template
 * @param {Function} [props.onRemove] - Removes the template from the page
 * @param {React.ReactNode} props.children - Button creating a file from it
 */
export const PageTemplateTile = ({ name, onEdit, onRemove, children }) => (
  <li className={styles['userTemplate']}>
    {children}
    {(onEdit || onRemove) && (
      <span className={styles['userTemplate-actions']}>
        {onEdit && <EditButton name={name} onClick={onEdit} />}
        {onRemove && <RemoveButton name={name} onClick={onRemove} />}
      </span>
    )}
  </li>
)

/**
 * Tile of a template the user saved, with discreet buttons editing or
 * removing it.
 *
 * @param {object} props - Component props
 * @param {object} props.template - The template file
 * @param {Function} props.renderPreview - Preview of a template file
 * @param {Function} props.onCreate - Creates a file from a template
 * @param {Function} props.onEdit - Opens a template in its editor
 * @param {Function} props.onRemove - Puts a template in the trash
 * @param {boolean} props.isCreating - Whether a file is being created
 */
export const UserTemplateTile = ({
  template,
  renderPreview,
  onCreate,
  onEdit,
  onRemove,
  isCreating
}) => {
  const { filename } = splitFilename(template)

  return (
    <li className={styles['userTemplate']}>
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
      <span className={styles['userTemplate-actions']}>
        <EditButton name={filename} onClick={() => onEdit(template)} />
        <RemoveButton name={filename} onClick={() => onRemove(template)} />
      </span>
    </li>
  )
}

/**
 * Tiles of the templates the user saved, after the templates of the page in
 * its Create block, then a tile creating a new template.
 *
 * @param {object} props - Component props, as UserTemplateTile without
 *   template
 * @param {object[]} props.templates - Templates the user saved
 * @param {string} props.newTemplateClassName - Shape of the new template
 *   tile, as the blank file of the page
 * @param {Function} [props.onCreateTemplate] - Creates an empty template,
 *   no tile for it without
 */
export const UserTemplateTiles = ({
  templates,
  newTemplateClassName,
  onCreateTemplate,
  ...tileProps
}) => {
  const { t } = useI18n()

  return (
    <>
      {templates.map(template => (
        <UserTemplateTile
          key={template._id}
          template={template}
          {...tileProps}
        />
      ))}
      {onCreateTemplate && (
        <li>
          <button
            type="button"
            className={boardStyles['boardTemplate']}
            disabled={tileProps.isCreating}
            onClick={() => onCreateTemplate()}
            data-testid="user-template-new"
          >
            <span
              className={cx(newTemplateClassName, styles['userTemplate-new'])}
            >
              <Icon icon={Plus} size={24} />
            </span>
            <span className={boardStyles['boardTemplate-name']}>
              {t('UserTemplates.new')}
            </span>
          </button>
        </li>
      )}
    </>
  )
}
