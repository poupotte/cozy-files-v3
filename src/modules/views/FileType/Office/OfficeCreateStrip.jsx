import { Icon, Plus } from '@linagora/twake-icons'
import cx from 'classnames'
import React from 'react'

import { useI18n } from 'twake-i18n'

import { OfficeTemplatePreview } from './OfficePreview'
import styles from './office.styl'
import {
  getOfficeTemplateIds,
  makeOfficeTemplatePreview
} from './officeTemplates'
import boardStyles from '../Board/board.styl'

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
 */
export const OfficeCreateStrip = ({
  fileType,
  onCreate,
  isCreating,
  userTemplates
}) => {
  const { t } = useI18n()

  return (
    <section
      className={boardStyles['boardStrip']}
      aria-labelledby="office-strip"
    >
      <h2 id="office-strip" className={boardStyles['boardSection-title']}>
        {t(`OfficeHome.create_title.${fileType}`)}
      </h2>
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
        {getOfficeTemplateIds(fileType).map(id => (
          <li key={id}>
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
                {t(`OfficeHome.templates.${id}.name`)}
              </span>
            </button>
          </li>
        ))}
        {userTemplates}
      </ul>
    </section>
  )
}
