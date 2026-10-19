import { Icon, Plus } from '@linagora/twake-icons'
import React from 'react'
import { Navigate, Outlet, useParams } from 'react-router-dom'

import flag from 'cozy-flags'
import {
  useSharingContext,
  useNativeFileSharing,
  shareNative
} from 'cozy-sharing'
import { makeActions } from 'cozy-ui/transpiled/react/ActionsMenu/Actions'
import Button from 'cozy-ui/transpiled/react/Buttons'
import { Content } from 'cozy-ui/transpiled/react/Layout'

import { FileTypeEmpty } from './FileTypeEmpty'
import { getFileTypePage } from './helpers'
import { useCreateFileTypeFile } from './useCreateFileTypeFile'
import { useFileTypeFavicon } from './useFileTypeFavicon'
import { useFileTypeFiles } from './useFileTypeFiles'
import FolderView from '../Folder/FolderView'
import FolderViewBody from '../Folder/FolderViewBody'
import FolderViewHeader from '../Folder/FolderViewHeader'
import FolderViewBodyVz from '../Folder/virtualized/FolderViewBody'

import useHead from '@/components/useHead'
import { RECENT_FOLDER_ID } from '@/constants/config'
import { useFolderSort } from '@/hooks'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import {
  download,
  trash,
  rename,
  infos,
  versions,
  hr,
  share,
  selectAllItems,
  summariseByAI
} from '@/modules/actions'
import { addToFavorites } from '@/modules/actions/components/addToFavorites'
import { moveTo } from '@/modules/actions/components/moveTo'
import { removeFromFavorites } from '@/modules/actions/components/removeFromFavorites'
import { MobileAwareBreadcrumb as Breadcrumb } from '@/modules/breadcrumb/components/MobileAwareBreadcrumb'
import { useFolderViewBase } from '@/modules/views/Folder/hooks/useFolderViewBase'

const FileTypeViewContent = ({ fileType, page }) => {
  const base = useFolderViewBase()
  const sharingContext = useSharingContext()
  const { allLoaded, refresh, isOwner, byDocId } = sharingContext
  const nativeSharing = useNativeFileSharing()
  const title = base.t(`FileTypeView.title.${fileType}`)
  useHead({ title })
  useFileTypeFavicon(fileType)
  const [sortOrder, setSortOrder, isSettingsLoaded] =
    useFolderSort(RECENT_FOLDER_ID)

  const { result, filteredResult } = useFileTypeFiles({ fileType, page })

  // Without any file of the type, show a welcome page instead of an empty
  // list.
  const hasNoFile =
    result.fetchStatus === 'loaded' &&
    !result.hasMore &&
    filteredResult.data.length === 0
  // The welcome page has its own title and Create button. Wait for the first
  // load so the header does not flash before it.
  const isFirstLoad = !result.lastFetch
  const showHeader = !hasNoFile && !isFirstLoad
  const { createFile, isCreating } = useCreateFileTypeFile(fileType, page)

  useKeyboardShortcuts({
    client: base.client,
    items: filteredResult?.data || [],
    sharingContext,
    allowCopy: false,
    pushModal: base.pushModal,
    popModal: base.popModal,
    refresh
  })

  const actionsOptions = {
    ...base,
    ...nativeSharing,
    refresh,
    hasWriteAccess: true,
    canMove: true,
    isPublic: false,
    allLoaded,
    isOwner,
    byDocId,
    selectAll: () => base.toggleSelectAllItems(filteredResult?.data || [])
  }

  const actions = makeActions(
    [
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
      versions,
      hr,
      trash
    ],
    actionsOptions
  )

  return (
    <FolderView>
      <Content className={base.isMobile ? '' : 'u-pt-1'}>
        {showHeader && (
          <FolderViewHeader>
            <Breadcrumb path={[{ name: title }]} />
            <Button
              variant="primary"
              startIcon={<Icon icon={Plus} size={12} />}
              label={base.t('toolbar.menu_create')}
              busy={isCreating}
              onClick={createFile}
            />
          </FolderViewHeader>
        )}
        {hasNoFile ? (
          <FileTypeEmpty
            fileType={fileType}
            page={page}
            onCreate={createFile}
            isCreating={isCreating}
          />
        ) : null}
        {hasNoFile ? null : flag('drive.virtualization.enabled') &&
          !base.isMobile ? (
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
            withFilePath={true}
          />
        )}
        <Outlet />
      </Content>
    </FolderView>
  )
}

export const FileTypeView = () => {
  const { fileType } = useParams()
  const page = getFileTypePage(fileType)

  if (!page) return <Navigate to="/recent" replace={true} />

  return <FileTypeViewContent fileType={fileType} page={page} />
}

export default FileTypeView
