import React from 'react'
import { Navigate, Outlet, useNavigate, useParams } from 'react-router-dom'

import flag from 'cozy-flags'
import {
  useSharingContext,
  useNativeFileSharing,
  shareNative
} from 'cozy-sharing'
import { makeActions } from 'cozy-ui/transpiled/react/ActionsMenu/Actions'
import { Content } from 'cozy-ui/transpiled/react/Layout'

import { FileTypeHeader } from './FileTypeHeader'
import { FileTypeListProvider } from './FileTypeList'
import {
  FILE_TYPE_SECTION_SHARINGS,
  getFileTypePage,
  getFileTypePath
} from './helpers'
import FolderView from '../Folder/FolderView'
import FolderViewBody from '../Folder/FolderViewBody'
import { useFolderViewBase } from '../Folder/hooks/useFolderViewBase'
import FolderViewBodyVz from '../Folder/virtualized/FolderViewBody'
import SharingsTabs from '../Sharings/SharingsTabs'
import { buildSharingsActionsOptions } from '../Sharings/helpers'
import { useFilteredSharings } from '../Sharings/useFilteredSharings'
import { useSharingsLastUpdatedAt } from '../Sharings/useSharingsLastUpdatedAt'
import {
  getSharingsFetchStatus,
  useSharingsQueryResult
} from '../Sharings/useSharingsQueryResult'
import withSharedDocumentIds from '../Sharings/withSharedDocumentIds'

import useHead from '@/components/useHead'
import {
  SHARINGS_VIEW_ID,
  SHARING_TAB_BY_ME,
  SHARING_TAB_WITH_ME
} from '@/constants/config'
import { useFolderSort } from '@/hooks'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import {
  download,
  rename,
  infos,
  versions,
  share,
  hr,
  selectAllItems,
  summariseByAI
} from '@/modules/actions'
import { addToFavorites } from '@/modules/actions/components/addToFavorites'
import { moveTo } from '@/modules/actions/components/moveTo'
import { removeFromFavorites } from '@/modules/actions/components/removeFromFavorites'
import { FileLastUpdatedProvider } from '@/modules/filelist/FileLastUpdatedContext'
import FileListRowsPlaceholder from '@/modules/filelist/FileListRowsPlaceholder'

// Team drives are folders, which a file type page does not list.
const FILE_TYPE_SHARINGS_TABS = [SHARING_TAB_WITH_ME, SHARING_TAB_BY_ME]

const SHARINGS_ACTIONS = [
  selectAllItems,
  share,
  shareNative,
  download,
  hr,
  summariseByAI,
  hr,
  rename,
  moveTo,
  addToFavorites,
  removeFromFavorites,
  infos,
  hr,
  versions
]

export const getFileTypeSharingsPath = (fileType, tab = SHARING_TAB_WITH_ME) =>
  `${getFileTypePath(fileType, FILE_TYPE_SECTION_SHARINGS)}/${tab}`

const FileTypeSharingsContent = ({
  fileType,
  page,
  tab,
  sharedDocumentIds
}) => {
  const base = useFolderViewBase()
  const navigate = useNavigate()
  const sharingContext = useSharingContext()
  const { allLoaded, refresh } = sharingContext
  const nativeSharing = useNativeFileSharing()
  const title = base.t('breadcrumb.title_sharings')
  useHead({ title })
  const [sortOrder, setSortOrder, isSettingsLoaded] =
    useFolderSort(SHARINGS_VIEW_ID)
  const getFileLastUpdatedAt = useSharingsLastUpdatedAt()
  const result = useSharingsQueryResult(sharedDocumentIds, allLoaded)
  const { filteredResult, sharedDrivesLoaded, sharedDrivesError } =
    useFilteredSharings({
      result,
      sharedDocumentIds,
      tab,
      filters: { type: fileType },
      getFileLastUpdatedAt
    })
  const fetchStatus = getSharingsFetchStatus({
    allLoaded,
    filteredResult,
    sharedDrivesLoaded,
    sharedDrivesError
  })

  useKeyboardShortcuts({
    onPaste: () => refresh(),
    client: base.client,
    items: filteredResult?.data || [],
    sharingContext,
    allowCopy: false,
    pushModal: base.pushModal,
    popModal: base.popModal,
    refresh
  })

  const actions = makeActions(
    SHARINGS_ACTIONS,
    buildSharingsActionsOptions({
      base,
      nativeSharing,
      sharingContext,
      filteredResult
    })
  )

  const tabs = (
    <SharingsTabs
      tab={tab}
      onChange={nextTab => navigate(getFileTypeSharingsPath(fileType, nextTab))}
      className={base.isMobile ? undefined : 'u-ml-2'}
    />
  )

  return (
    <FolderView>
      <Content className={base.isMobile ? '' : 'u-pt-1'}>
        <FileTypeHeader
          title={title}
          fileType={fileType}
          page={page}
          isMobile={base.isMobile}
          tabs={tabs}
        />
        {base.isMobile && tabs}
        {fetchStatus === 'loading' ? (
          <FileListRowsPlaceholder />
        ) : (
          <FileLastUpdatedProvider
            getFileLastUpdatedAt={getFileLastUpdatedAt}
            groupDirectoriesFirstByUpdatedAt={false}
            showDirectoryLastUpdated={true}
          >
            {flag('drive.virtualization.enabled') && !base.isMobile ? (
              <FolderViewBodyVz
                actions={actions}
                queryResults={[filteredResult]}
                withFilePath={true}
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
                canSort={true}
                withFilePath={true}
                orderProps={{
                  sortOrder,
                  setOrder: setSortOrder,
                  isSettingsLoaded
                }}
              />
            )}
            <FileTypeListProvider
              result={result}
              files={filteredResult.data ?? []}
              basePath={getFileTypeSharingsPath(fileType, tab)}
            >
              <Outlet />
            </FileTypeListProvider>
          </FileLastUpdatedProvider>
        )}
      </Content>
    </FolderView>
  )
}

/**
 * Files of the type shared with me or by me, as in the Sharings view.
 */
const FileTypeSharingsView = ({ sharedDocumentIds = [] }) => {
  const { fileType, tab } = useParams()
  const page = getFileTypePage(fileType)

  if (!FILE_TYPE_SHARINGS_TABS.includes(tab)) {
    return <Navigate to={getFileTypeSharingsPath(fileType)} replace={true} />
  }

  return (
    <FileTypeSharingsContent
      fileType={fileType}
      page={page}
      tab={tab}
      sharedDocumentIds={sharedDocumentIds}
    />
  )
}

export default withSharedDocumentIds(FileTypeSharingsView)
