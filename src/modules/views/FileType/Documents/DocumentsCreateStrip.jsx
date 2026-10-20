import { Icon, Bottom, Upload } from '@linagora/twake-icons'
import cx from 'classnames'
import React, { useRef, useState } from 'react'

import Popover from 'cozy-ui/transpiled/react/Popover'
import { useI18n } from 'twake-i18n'

import styles from './documents.styl'
import boardStyles from '../Board/board.styl'
import { getFileTypePage } from '../helpers'

// Files offered by the Import button: the ones of the page.
const IMPORT_ACCEPT =
  '.doc,.docx,.odt,.rtf,.txt,.xls,.xlsx,.ods,.csv,.ppt,.pptx,.odp,.pdf'

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
 * @param {Function} props.renderTemplates - Templates of a kind
 */
export const DocumentsCreateStrip = ({
  createTypes,
  onCreate,
  onImport,
  canCreate,
  isCreating,
  renderTemplates
}) => {
  const { t } = useI18n()
  const inputRef = useRef(null)
  // Arrow whose templates menu is open, and its kind of document
  const [templatesMenu, setTemplatesMenu] = useState(null)
  const closeTemplatesMenu = () => setTemplatesMenu(null)

  const handleFiles = event => {
    const files = Array.from(event.target.files ?? [])
    onImport(files.map(file => ({ file, isDirectory: false })))
    // The same files can be picked again.
    event.target.value = ''
  }

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
            onClick={() => inputRef.current?.click()}
            data-testid="documents-import"
          >
            <span className={styles['documentsCreate-import']}>
              <Icon icon={Upload} size={18} />
            </span>
            <span className={styles['documentsCreate-label']}>
              {t('DocumentsHome.import')}
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={IMPORT_ACCEPT}
            className={styles['documentsCreate-input']}
            onChange={handleFiles}
            data-testid="documents-import-input"
          />
        </li>
      </ul>
      <Popover
        open={Boolean(templatesMenu)}
        anchorEl={templatesMenu?.anchorEl}
        onClose={closeTemplatesMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {templatesMenu && (
          <div
            className={styles['documentsTemplatesMenu']}
            data-testid="documents-templates-menu"
          >
            {renderTemplates(templatesMenu.fileType)}
          </div>
        )}
      </Popover>
    </section>
  )
}
