import React from 'react'
import { Navigate, Outlet, useParams } from 'react-router-dom'

import flag from 'cozy-flags'
import {
  useSharingContext,
  useNativeFileSharing,
  shareNative
} from 'cozy-sharing'
import { makeActions } from 'cozy-ui/transpiled/react/ActionsMenu/Actions'
import { Content } from 'cozy-ui/transpiled/react/Layout'

import { BoardCreateStrip } from './Board/BoardCreateStrip'
import { BoardGrid } from './Board/BoardGrid'
import boardStyles from './Board/board.styl'
import { FileTypeEmpty } from './FileTypeEmpty'
import { FileTypeHeader } from './FileTypeHeader'
import { FileTypeListProvider } from './FileTypeList'
import {
  FILE_TYPE_SECTION_CREATED_BY_ME,
  FILE_TYPE_SECTION_RECENT,
  getFileTypePage,
  getFileTypePath
} from './helpers'
import { useCreateFileTypeFile } from './useCreateFileTypeFile'
import { useFileTypeFavicon } from './useFileTypeFavicon'
import { useFileTypeFiles } from './useFileTypeFiles'
import FolderView from '../Folder/FolderView'
import FolderViewBody from '../Folder/FolderViewBody'
import FolderViewBodyVz from '../Folder/virtualized/FolderViewBody'

import useHead from '@/components/useHead'
import { RECENT_FOLDER_ID } from '@/constants/config'
import { useFolderSort } from '@/hooks'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useViewSwitcherContext } from '@/lib/ViewSwitcherContext'
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
import { useFolderViewBase } from '@/modules/views/Folder/hooks/useFolderViewBase'
import { useCreatedByMe } from '@/modules/views/Recent/createdByMe'

const FileTypeViewContent = ({ fileType, page, createdByMe }) => {
  const base = useFolderViewBase()
  const sharingContext = useSharingContext()
  const { allLoaded, refresh, isOwner, byDocId } = sharingContext
  const nativeSharing = useNativeFileSharing()
  // The grid view of a board page is the board home: its templates and the
  // drawings as tiles, never the welcome page.
  const { viewType } = useViewSwitcherContext()
  const isBoardHome = Boolean(page.withBoardHome) && viewType === 'grid'
  const titleKey = createdByMe
    ? 'title_created_by_me'
    : isBoardHome
      ? 'title_home'
      : 'title'
  const title = base.t(`FileTypeView.${titleKey}.${fileType}`)
  useHead({ title })
  useFileTypeFavicon(fileType)
  const [sortOrder, setSortOrder, isSettingsLoaded] =
    useFolderSort(RECENT_FOLDER_ID)

  const { result, filteredResult: typedResult } = useFileTypeFiles({
    fileType,
    page
  })
  const filteredResult = useCreatedByMe(typedResult, createdByMe)
  const basePath = getFileTypePath(
    fileType,
    createdByMe ? FILE_TYPE_SECTION_CREATED_BY_ME : FILE_TYPE_SECTION_RECENT
  )

  // Without any file of the type, show a welcome page instead of an empty
  // list. Created by me keeps the regular list, other files may exist.
  const hasNoFile =
    result.fetchStatus === 'loaded' &&
    !result.hasMore &&
    typedResult.data.length === 0
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
        {(showHeader || (isBoardHome && !isFirstLoad)) && (
          <FileTypeHeader
            title={title}
            fileType={fileType}
            page={page}
            isMobile={base.isMobile}
          />
        )}
        {isBoardHome ? (
          <div className={boardStyles['boardHome']}>
            {!createdByMe && (
              <BoardCreateStrip onCreate={createFile} isCreating={isCreating} />
            )}
            <BoardGrid
              result={result}
              files={filteredResult.data ?? []}
              actions={actions}
              title={createdByMe ? null : base.t('BoardHome.list_title')}
            />
          </div>
        ) : (
          <>
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
          </>
        )}
        <FileTypeListProvider
          result={result}
          files={filteredResult.data ?? []}
          basePath={basePath}
        >
          <Outlet />
        </FileTypeListProvider>
      </Content>
    </FolderView>
  )
}

/**
 * Recent files of the type, or the ones I created among them.
 *
 * @param {object} props - Component props
 * @param {boolean} [props.createdByMe=false] - Whether to keep my files only
 */
export const FileTypeView = ({ createdByMe = false }) => {
  const { fileType } = useParams()
  const page = getFileTypePage(fileType)

  if (!page) return <Navigate to="/recent" replace={true} />

  return (
    <FileTypeViewContent
      fileType={fileType}
      page={page}
      createdByMe={createdByMe}
    />
  )
}

export default FileTypeView
