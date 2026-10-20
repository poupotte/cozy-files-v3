import { Icon, Bottom, Upload } from '@linagora/twake-icons'
import cx from 'classnames'
import React, { useState } from 'react'

import { useI18n } from 'twake-i18n'

import { DocumentsTemplatesMenu } from './DocumentsTemplatesMenu'
import styles from './documents.styl'
import { useImportPicker } from './useImportPicker'
import boardStyles from '../Board/board.styl'
import { getFileTypePage } from '../helpers'

/**
 * Create block of the Documents page, as the Mail.ru Documents: a large
 * button per kind of document, creating a blank one, with an arrow opening
 * its templates in a menu over the page, then one importing files from the
 * computer.
 *
 * @param {object} props - Component props
 * @param {string[]} props.createTypes - Pages whose files can be created
 * @param {Function} props.onCreate - Creates a file of a page, from its type
 * @param {Function} props.onImport - Uploads the files picked, as dropped
 * @param {boolean} props.canCreate - Whether files can be edited and created
 * @param {boolean} props.isCreating - Whether a file is being created
 */
export const DocumentsCreateStrip = ({
  createTypes,
  onCreate,
  onImport,
  canCreate,
  isCreating
}) => {
  const { t } = useI18n()
  const { openPicker, pickerInput } = useImportPicker(onImport)
  // Arrow whose templates menu is open, and its kind of document
  const [templatesMenu, setTemplatesMenu] = useState(null)
  const closeTemplatesMenu = () => setTemplatesMenu(null)

  return (
    <section aria-labelledby="documents-strip">
      <h2 id="documents-strip" className={boardStyles['boardSection-title']}>
        {t('DocumentsHome.create_title')}
      </h2>
      <ul className={styles['documentsCreate']}>
        {canCreate &&
          createTypes.map(fileType => {
            const AppIcon = getFileTypePage(fileType).appIcon
            return (
              <li key={fileType} className={styles['documentsCreate-split']}>
                <button
                  type="button"
                  className={cx(
                    styles['documentsCreate-button'],
                    styles['documentsCreate-button--main']
                  )}
                  disabled={isCreating}
                  onClick={() => onCreate(fileType)}
                  data-testid={`documents-create-${fileType}`}
                >
                  <AppIcon className={styles['documentsCreate-icon']} />
                  <span className={styles['documentsCreate-label']}>
                    {t(`DocumentsHome.create.${fileType}`)}
                  </span>
                </button>
                <button
                  type="button"
                  className={cx(
                    styles['documentsCreate-button'],
                    styles['documentsCreate-toggle']
                  )}
                  aria-haspopup="dialog"
                  aria-expanded={templatesMenu?.fileType === fileType}
                  aria-label={t(`DocumentsHome.show_templates.${fileType}`)}
                  title={t(`DocumentsHome.show_templates.${fileType}`)}
                  onClick={event =>
                    setTemplatesMenu({
                      fileType,
                      anchorEl: event.currentTarget
                    })
                  }
                  data-testid={`documents-templates-${fileType}`}
                >
                  <Icon icon={Bottom} size={14} />
                </button>
              </li>
            )
          })}
        <li>
          <button
            type="button"
            className={styles['documentsCreate-button']}
            onClick={openPicker}
            data-testid="documents-import"
          >
            <span className={styles['documentsCreate-import']}>
              <Icon icon={Upload} size={18} />
            </span>
            <span className={styles['documentsCreate-label']}>
              {t('DocumentsHome.import')}
            </span>
          </button>
          {pickerInput}
        </li>
      </ul>
      <DocumentsTemplatesMenu
        menu={templatesMenu}
        onClose={closeTemplatesMenu}
      />
    </section>
  )
}
