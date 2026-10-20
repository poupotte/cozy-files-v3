import { Icon, Upload } from '@linagora/twake-icons'
import React, { useRef, useState } from 'react'

import ActionsMenu from 'cozy-ui/transpiled/react/ActionsMenu'
import ActionsMenuItem from 'cozy-ui/transpiled/react/ActionsMenu/ActionsMenuItem'
import ActionsMenuMobileHeader from 'cozy-ui/transpiled/react/ActionsMenu/ActionsMenuMobileHeader'
import Divider from 'cozy-ui/transpiled/react/Divider'
import FileInput from 'cozy-ui/transpiled/react/FileInput'
import ListItemIcon from 'cozy-ui/transpiled/react/ListItemIcon'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'
import { useI18n } from 'twake-i18n'

import { useCreateDocument } from './useCreateDocument'
import { useFileTypeUpload } from '../useFileTypeUpload'

import { makeOnlyOfficeIconByClass } from '@/modules/views/OnlyOffice/helpers'

// OnlyOffice class of the files of each page, as the Drive add menu names
// and draws them.
const OFFICE_CLASS_BY_FILE_TYPE = {
  text: 'text',
  sheet: 'spreadsheet',
  slide: 'slide'
}

/**
 * Create button of the Documents page, opening the Drive add menu with the
 * entries of the page: a document, a spreadsheet or a presentation, then the
 * import of files.
 *
 * @param {object} props - Component props
 * @param {string} props.fileType - Type of the page
 * @param {object} props.page - The file type page, with its createTypes
 * @param {Function} props.renderButton - Button, from its onClick, busy and
 *   accessibility attributes
 */
export const DocumentsCreateMenu = ({ fileType, page, renderButton }) => {
  const { t } = useI18n()
  const anchorRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const { createDocument, isCreating } = useCreateDocument()
  const upload = useFileTypeUpload(fileType, page)
  const canCreate = page.canCreate()

  const closeMenu = () => setIsOpen(false)

  const handleFiles = files => {
    if (!files || files.length === 0) return
    upload(Array.from(files).map(file => ({ file, isDirectory: false })))
    closeMenu()
  }

  return (
    <>
      <div ref={anchorRef}>
        {renderButton({
          onClick: () => setIsOpen(open => !open),
          busy: isCreating,
          a11y: {
            'aria-controls': isOpen ? 'documents-add-menu' : undefined,
            'aria-haspopup': true,
            'aria-expanded': isOpen ? true : undefined
          }
        })}
      </div>
      {isOpen && (
        <ActionsMenu
          id="documents-add-menu"
          open
          ref={anchorRef}
          onClose={closeMenu}
          docs={[]}
          actions={[]}
        >
          <ActionsMenuMobileHeader>
            <ListItemText
              primary={t('toolbar.menu_create')}
              primaryTypographyProps={{ variant: 'h6' }}
            />
          </ActionsMenuMobileHeader>
          {canCreate &&
            page.createTypes.map(type => {
              const fileClass = OFFICE_CLASS_BY_FILE_TYPE[type]
              return (
                <ActionsMenuItem
                  key={type}
                  onClick={() => {
                    closeMenu()
                    createDocument(type)
                  }}
                  data-testid={`documents-menu-${type}`}
                >
                  <ListItemIcon>
                    <Icon icon={makeOnlyOfficeIconByClass(fileClass)} />
                  </ListItemIcon>
                  <ListItemText
                    primary={t(`toolbar.menu_onlyOffice.${fileClass}`)}
                  />
                </ActionsMenuItem>
              )
            })}
          {canCreate && <Divider className="u-mv-half" />}
          <FileInput
            label={t('toolbar.menu_upload')}
            multiple
            onChange={handleFiles}
            value={[]}
            data-testid="documents-menu-import"
          >
            <ActionsMenuItem>
              <ListItemIcon>
                <Icon icon={Upload} />
              </ListItemIcon>
              <ListItemText primary={t('toolbar.menu_upload')} />
            </ActionsMenuItem>
          </FileInput>
        </ActionsMenu>
      )}
    </>
  )
}
