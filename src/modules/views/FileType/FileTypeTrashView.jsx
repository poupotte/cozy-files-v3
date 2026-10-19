import React from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'

import { useClient, useQuery } from 'cozy-client'
import flag from 'cozy-flags'
import { useSharingContext } from 'cozy-sharing'
import { makeActions } from 'cozy-ui/transpiled/react/ActionsMenu/Actions'
import { Content } from 'cozy-ui/transpiled/react/Layout'

import { FileTypeHeader } from './FileTypeHeader'
import { FileTypeListProvider } from './FileTypeList'
import {
  FILE_TYPE_SECTION_TRASH,
  getFileTypePage,
  getFileTypePath
} from './helpers'
import FolderView from '../Folder/FolderView'
import FolderViewBody from '../Folder/FolderViewBody'
import { useFolderViewBase } from '../Folder/hooks/useFolderViewBase'
import FolderViewBodyVz from '../Folder/virtualized/FolderViewBody'

import useHead from '@/components/useHead'
import { TRASH_DIR_ID } from '@/constants/config'
import { useFolderSort } from '@/hooks'
import { restore, selectAllItems } from '@/modules/actions'
import { useSelectionContext } from '@/modules/selection/SelectionProvider'
import { destroy } from '@/modules/trash/components/actions/destroy'
import { useFilteredRecents } from '@/modules/views/Recent/useFilteredRecents'
import { buildTrashByTypeQuery } from '@/queries'

/**
 * Trashed files of the type, wherever they were, without the folders.
 */
const FileTypeTrashView = () => {
  const { fileType } = useParams()
  const page = getFileTypePage(fileType)
  const base = useFolderViewBase()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const client = useClient()
  const { refresh } = useSharingContext()
  const { toggleSelectAllItems, isSelectAll } = useSelectionContext()
  const title = base.t('breadcrumb.title_trash')
  useHead({ title })
  const [sortOrder, setSortOrder, isSettingsLoaded] =
    useFolderSort(TRASH_DIR_ID)

  const query = buildTrashByTypeQuery({
    classes: page.classes,
    mimes: page.mimes
  })
  const result = useQuery(query.definition, query.options)
  // Same type classifier as the other sections of the page.
  const { filteredResult } = useFilteredRecents({
    result,
    filters: { type: fileType }
  })

  const actions = makeActions([selectAllItems, restore, destroy], {
    client,
    t: base.t,
    refresh,
    navigate,
    pathname,
    selectAll: () => toggleSelectAllItems(filteredResult.data ?? []),
    isSelectAll
  })

  return (
    <FolderView>
      <Content className={base.isMobile ? '' : 'u-pt-1'}>
        <FileTypeHeader
          title={title}
          fileType={fileType}
          page={page}
          isMobile={base.isMobile}
          canCreate={false}
        />
        {flag('drive.virtualization.enabled') && !base.isMobile ? (
          <FolderViewBodyVz
            actions={actions}
            queryResults={[filteredResult]}
            withFilePath={false}
            canUpload={false}
            orderProps={{
              sortOrder,
              setOrder: setSortOrder,
              isSettingsLoaded
            }}
          />
        ) : (
          <FolderViewBody
            actions={actions}
            queryResults={[filteredResult]}
            withFilePath={false}
            canUpload={false}
          />
        )}
        <FileTypeListProvider
          result={result}
          files={filteredResult.data ?? []}
          basePath={getFileTypePath(fileType, FILE_TYPE_SECTION_TRASH)}
        >
          <Outlet />
        </FileTypeListProvider>
      </Content>
    </FolderView>
  )
}

export default FileTypeTrashView
