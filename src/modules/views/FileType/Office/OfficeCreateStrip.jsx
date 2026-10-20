import { Icon, Plus } from '@linagora/twake-icons'
import cx from 'classnames'
import React from 'react'

import Button from 'cozy-ui/transpiled/react/Buttons'
import { useI18n } from 'twake-i18n'

import { OfficeTemplatePreview } from './OfficePreview'
import styles from './office.styl'
import {
  getOfficeTemplateIds,
  makeOfficeTemplatePreview
} from './officeTemplates'
import boardStyles from '../Board/board.styl'
import { PageTemplateTile } from '../UserTemplates/UserTemplateTiles'

/**
 * Create block of an Office page home, as the Google Docs template gallery: a
 * blank file shaped as the files of the page (a page, a sheet or a slide),
 * then the templates of the type.
 *
 * @param {object} props - Component props
 * @param {string} props.fileType - Type of the page (text, sheet or slide)
 * @param {Function} props.onCreate - Creates a file, from a template id or
 *   from nothing
 * @param {boolean} props.isCreating - Whether a file is being created
 * @param {React.ReactNode} [props.userTemplates] - Tiles of the templates the
 *   user saved, shown after the others
 * @param {Function} [props.onEditTemplate] - Edits a template of the page,
 *   from its id
 * @param {Function} [props.renderCustomizedTemplate] - Tile of the template
 *   the user saved in place of a template of the page, from its id, or null
 * @param {string[]} [props.hiddenTemplateIds] - Templates of the page the
 *   user removed
 * @param {Function} [props.onRemoveTemplate] - Removes a template of the
 *   page, from its id
 * @param {Function} [props.onRestoreTemplates] - Shows the removed
 *   templates again
 */
export const OfficeCreateStrip = ({
  fileType,
  onCreate,
  isCreating,
  userTemplates,
  onEditTemplate,
  renderCustomizedTemplate,
  hiddenTemplateIds = [],
  onRemoveTemplate,
  onRestoreTemplates
}) => {
  const { t } = useI18n()
  const templateIds = getOfficeTemplateIds(fileType).filter(
    id => !hiddenTemplateIds.includes(id)
  )

  return (
    <section
      className={boardStyles['boardStrip']}
      aria-labelledby="office-strip"
    >
      <div className={boardStyles['boardSection-head']}>
        <h2 id="office-strip" className={boardStyles['boardSection-title']}>
          {t(`OfficeHome.create_title.${fileType}`)}
        </h2>
        {onRestoreTemplates && hiddenTemplateIds.length > 0 && (
          <Button
            variant="text"
            size="small"
            label={t('UserTemplates.restore', {
              smart_count: hiddenTemplateIds.length
            })}
            onClick={onRestoreTemplates}
            data-testid="templates-restore"
          />
        )}
      </div>
      <ul className={boardStyles['boardStrip-list']}>
        <li>
          <button
            type="button"
            className={boardStyles['boardTemplate']}
            disabled={isCreating}
            onClick={() => onCreate(null)}
            data-testid="office-create-blank"
          >
            <span
              className={cx(
                styles['officeBlank'],
                styles[`officePreview--${fileType}`]
              )}
            >
              <Icon icon={Plus} size={24} />
            </span>
            <span className={boardStyles['boardTemplate-name']}>
              {t(`OfficeHome.blank.${fileType}`)}
            </span>
          </button>
        </li>
        {templateIds.map(id => {
          const name = t(`OfficeHome.templates.${id}.name`)
          return (
            renderCustomizedTemplate?.(id) ?? (
              <PageTemplateTile
                key={id}
                name={name}
                onEdit={onEditTemplate && (() => onEditTemplate(id))}
                onRemove={onRemoveTemplate && (() => onRemoveTemplate(id))}
              >
                <button
                  type="button"
                  className={boardStyles['boardTemplate']}
                  disabled={isCreating}
                  onClick={() => onCreate(id)}
                  data-testid={`office-template-${id}`}
                >
                  <OfficeTemplatePreview
                    fileType={fileType}
                    preview={makeOfficeTemplatePreview(fileType, id, t)}
                  />
                  <span className={boardStyles['boardTemplate-name']}>
                    {name}
                  </span>
                </button>
              </PageTemplateTile>
            )
          )
        })}
        {userTemplates}
      </ul>
    </section>
  )
}
