import { Icon, Plus } from '@linagora/twake-icons'
import React from 'react'

import Button from 'cozy-ui/transpiled/react/Buttons'
import { useI18n } from 'twake-i18n'

import { useCreateFileTypeFile } from './useCreateFileTypeFile'
import FolderViewHeader from '../Folder/FolderViewHeader'

import styles from '@/styles/topbar.styl'

import { MobileAwareBreadcrumb as Breadcrumb } from '@/modules/breadcrumb/components/MobileAwareBreadcrumb'
import ViewSwitcher from '@/modules/drive/Toolbar/components/ViewSwitcher'

/**
 * Header of a file type section: its title, then the list/grid switch on
 * desktop, where the sidebar holds the Create button, or the Create button
 * on mobile.
 *
 * @param {object} props - Component props
 * @param {string} props.title - Title of the section
 * @param {string} props.fileType - Type of the page
 * @param {object} props.page - File type page, from getFileTypePage
 * @param {boolean} props.isMobile - Current breakpoint
 * @param {React.ReactNode} [props.tabs] - Tabs shown next to the title on desktop
 * @param {boolean} [props.canCreate=true] - Whether to offer the Create button
 * @param {boolean} [props.withViewSwitcher=true] - Whether to offer the
 *   list/grid switch
 */
export const FileTypeHeader = ({
  title,
  fileType,
  page,
  isMobile,
  tabs,
  canCreate = true,
  withViewSwitcher = true
}) => {
  const { t } = useI18n()
  const { createFile, isCreating } = useCreateFileTypeFile(fileType, page)

  return (
    <FolderViewHeader>
      {/* Keeps the title at its content width so the tabs sit right next
          to it, as in the Sharings view (see topbar.styl). */}
      <div className={styles['fil-sharings-title']}>
        <Breadcrumb path={[{ name: title }]} />
      </div>
      {!isMobile && tabs}
      <div className="u-flex u-flex-items-center u-ml-auto">
        {!isMobile && withViewSwitcher && <ViewSwitcher />}
        {isMobile && canCreate && (
          <Button
            variant="primary"
            startIcon={<Icon icon={Plus} size={12} />}
            label={t('toolbar.menu_create')}
            busy={isCreating}
            onClick={createFile}
          />
        )}
      </div>
    </FolderViewHeader>
  )
}
