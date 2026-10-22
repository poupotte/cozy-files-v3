import { Download } from '@linagora/twake-icons'
import React, { useCallback, useMemo } from 'react'
import { Outlet, useLocation, useParams } from 'react-router-dom'

import flag from 'cozy-flags'
import {
  useSharingContext,
  useNativeFileSharing,
  shareNative
} from 'cozy-sharing'
import { makeActions } from 'cozy-ui/transpiled/react/ActionsMenu/Actions'

import { filterRootItems, isAppFolder } from './helpers'
import { useDriveQueries } from './useDriveQueries'

import useHead from '@/components/useHead'
import { FROM_APPS_ROUTE, ROOT_DIR_ID } from '@/constants/config'
import { useClipboardContext } from '@/contexts/ClipboardProvider'
import { useCurrentFolderId, useDisplayedFolder, useFolderSort } from '@/hooks'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useThumbnailSizeContext } from '@/lib/ThumbnailSizeContext'
import {
  share,
  download,
  trash,
  rename,
  infos,
  versions,
  hr,
  selectAllItems,
  summariseByAI,
  signWithEuDss,
  verifyWithEuDss
} from '@/modules/actions'
import { addToFavorites } from '@/modules/actions/components/addToFavorites'
import { duplicateTo } from '@/modules/actions/components/duplicateTo'
import { moveTo } from '@/modules/actions/components/moveTo'
import { personalizeFolder } from '@/modules/actions/components/personalizeFolder'
import { removeFromFavorites } from '@/modules/actions/components/removeFromFavorites'
import AddMenuProvider from '@/modules/drive/AddMenu/AddMenuProvider'
import FabWithAddMenuContext from '@/modules/drive/FabWithAddMenuContext'
import Toolbar from '@/modules/drive/Toolbar'
import Dropzone from '@/modules/upload/Dropzone'
import DropzoneDnD from '@/modules/upload/DropzoneDnD'
import { AssistantLayout } from '@/modules/views/Drive/Assistant/AssistantLayout'
import { AssistantProvider } from '@/modules/views/Drive/Assistant/AssistantProvider'
import { useTrashRedirect } from '@/modules/views/Drive/useTrashRedirect'
import FolderView from '@/modules/views/Folder/FolderView'
import FolderViewBody from '@/modules/views/Folder/FolderViewBody'
import FolderViewBreadcrumb from '@/modules/views/Folder/FolderViewBreadcrumb'
import FolderViewHeader from '@/modules/views/Folder/FolderViewHeader'
import { useFabOnMobile } from '@/modules/views/Folder/hooks/useFabOnMobile'
import { useFolderViewBase } from '@/modules/views/Folder/hooks/useFolderViewBase'
import { filterOutReceivedShares } from '@/modules/views/Folder/syncHelpers'
import FolderViewBodyVz from '@/modules/views/Folder/virtualized/FolderViewBody'
import { useResumeUploadFromFlagship } from '@/modules/views/Upload/useResumeFromFlagship'

/**
 * @param {object} props - Component props
 * @param {bool} [props.fromApps] - Lists the folders the apps made at the root,
 * which My Drive leaves out
 * @returns {JSX.Element} The rendered component
 */
const DriveFolderView = ({ fromApps = false }) => {
  const base = useFolderViewBase()
  const { t } = base
  const params = useParams()
  const currentFolderId = useCurrentFolderId()
  const { pathname, search } = useLocation()
  useHead()
  const { isBigThumbnail, toggleThumbnailSize } = useThumbnailSizeContext()
  const sharingContext = useSharingContext()
  const { allLoaded, hasWriteAccess, refresh, isOwner, byDocId } =
    sharingContext
  const nativeSharing = useNativeFileSharing()
  const { hasClipboardData } = useClipboardContext()

  const { displayedFolder, isNotFound } = useDisplayedFolder()

  useTrashRedirect(displayedFolder)

  const [sortOrder, setSortOrder, isSettingsLoaded] =
    useFolderSort(currentFolderId)

  const {
    allResults: rawResults,
    isInError,
    isLoading,
    isPending
  } = useDriveQueries(currentFolderId, sortOrder)
  // Received shares are tagged with an io.cozy.sharings reference by the stack
  // and may be materialised among the recipient's own files; they belong in the
  // Sharings section, not My Drive. Wait until the sharing context is fully
  // loaded so isOwner can tell a received share from the user's own folders;
  // filtering earlier sees an incomplete picture and would show-then-hide them.
  // The folders created by apps have their own section, From apps, so that
  // they do not crowd the user's own files at the root of My Drive.
  const isRoot = currentFolderId === ROOT_DIR_ID
  const allResults = useMemo(() => {
    const results = allLoaded
      ? filterOutReceivedShares(rawResults, isOwner)
      : rawResults
    return isRoot ? filterRootItems(results, fromApps) : results
  }, [allLoaded, rawResults, isOwner, isRoot, fromApps])
  const [foldersResult, filesResult] = allResults
  const canWriteToCurrentFolder = hasWriteAccess(currentFolderId)

  useKeyboardShortcuts({
    canPaste: hasClipboardData && canWriteToCurrentFolder,
    client: base.client,
    items: [...(foldersResult.data || []), ...(filesResult.data || [])],
    sharingContext,
    pushModal: base.pushModal,
    popModal: base.popModal,
    refresh
  })

  const actionsOptions = {
    ...base,
    ...nativeSharing,
    refresh,
    hasWriteAccess: canWriteToCurrentFolder,
    canMove: true,
    isPublic: false,
    allLoaded,
    isOwner,
    byDocId,
    selectAll: () =>
      base.toggleSelectAllItems(allResults.flatMap(query => query.data || [])),
    displayedFolder
  }
  const actions = makeActions(
    [
      selectAllItems,
      share,
      shareNative,
      download,
      hr,
      summariseByAI,
      signWithEuDss,
      verifyWithEuDss,
      hr,
      rename,
      moveTo,
      duplicateTo,
      addToFavorites,
      removeFromFavorites,
      personalizeFolder,
      infos,
      hr,
      versions,
      hr,
      trash
    ],
    actionsOptions
  )

  const rootBreadcrumbPath = useMemo(
    () => ({
      id: ROOT_DIR_ID,
      name: fromApps ? t('Nav.item_from_apps') : t('breadcrumb.title_drive')
    }),
    [t, fromApps]
  )
  // The folders of an app folder belong to From apps, where it is listed: they
  // lead back there, and one opened from elsewhere moves there.
  const { navigate } = base
  const getRootBreadcrumbPath = useCallback(
    topFolder => {
      if (!isAppFolder(topFolder)) return null
      if (!fromApps) {
        navigate(
          {
            pathname: pathname.replace(/^\/folder\//, `/${FROM_APPS_ROUTE}/`),
            search
          },
          { replace: true }
        )
      }
      return {
        id: ROOT_DIR_ID,
        name: t('Nav.item_from_apps'),
        icon: Download,
        to: `/${FROM_APPS_ROUTE}`
      }
    },
    [t, fromApps, navigate, pathname, search]
  )

  useResumeUploadFromFlagship()

  const isFabDisplayed = useFabOnMobile(canWriteToCurrentFolder)

  const orderProps = { sortOrder, setOrder: setSortOrder, isSettingsLoaded }

  const DropzoneComp =
    flag('drive.virtualization.enabled') && !base.isMobile
      ? DropzoneDnD
      : Dropzone

  return (
    <AssistantProvider>
      <FolderView isNotFound={isNotFound}>
        <AssistantLayout>
          <DropzoneComp
            disabled={!canWriteToCurrentFolder}
            displayedFolder={displayedFolder}
          >
            <FolderViewHeader>
              {currentFolderId && (
                <FolderViewBreadcrumb
                  rootBreadcrumbPath={rootBreadcrumbPath}
                  getRootBreadcrumbPath={getRootBreadcrumbPath}
                  currentFolderId={currentFolderId}
                />
              )}
              <Toolbar
                canUpload={true}
                canCreateFolder={true}
                disabled={isLoading || isInError || isPending}
                isBigThumbnail={isBigThumbnail}
                toggleThumbnailSize={toggleThumbnailSize}
              />
            </FolderViewHeader>
            {flag('drive.virtualization.enabled') && !base.isMobile ? (
              <FolderViewBodyVz
                actions={actions}
                queryResults={allResults}
                currentFolderId={currentFolderId}
                displayedFolder={displayedFolder}
                canDrag
                canUpload={canWriteToCurrentFolder}
                orderProps={orderProps}
              />
            ) : (
              <FolderViewBody
                actions={actions}
                queryResults={allResults}
                canSort
                currentFolderId={currentFolderId}
                displayedFolder={displayedFolder}
                canUpload={canWriteToCurrentFolder}
                orderProps={orderProps}
              />
            )}
            {isFabDisplayed && (
              <AddMenuProvider
                componentsProps={{
                  AddMenu: {
                    anchorOrigin: {
                      vertical: 'top',
                      horizontal: 'left'
                    }
                  }
                }}
                canCreateFolder={true}
                canUpload={true}
                disabled={isLoading || isInError || isPending}
                navigate={base.navigate}
                params={params}
                displayedFolder={displayedFolder}
                isSelectionBarVisible={base.isSelectionBarVisible}
              >
                <FabWithAddMenuContext />
              </AddMenuProvider>
            )}
            <Outlet />
          </DropzoneComp>
        </AssistantLayout>
      </FolderView>
    </AssistantProvider>
  )
}

export { DriveFolderView }
