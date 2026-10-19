import React from 'react'
import { Route, useParams, Outlet, Navigate } from 'react-router-dom'

import { BarRoutes } from 'cozy-bar'
import flag from 'cozy-flags'
import { AssistantView } from 'cozy-search'

import ExternalRedirect from './ExternalRedirect'
import Index from './Index'
import AIAssistantPaywallView from '../views/AI/AIAssistantPaywallView'
import AssistantLayout from '../views/Assistant/AssistantLayout'
import { DriveFolderView } from '../views/Drive/DriveFolderView'
import FilesViewerDrive from '../views/Drive/FilesViewerDrive'
import { getExcalidrawRoutes } from '../views/Excalidraw/routes'
import { FilePickerDemoView } from '../views/FilePickerDemo/FilePickerDemoView'
import FileTypeView from '../views/FileType'
import { FilesViewerFileTypeList } from '../views/FileType/FileTypeList'
import {
  FileTypeCreateButton,
  FileTypeNav
} from '../views/FileType/FileTypeNav'
import FileTypeSharingsView from '../views/FileType/FileTypeSharingsView'
import FileTypeTrashView from '../views/FileType/FileTypeTrashView'
import {
  FILE_TYPE_SECTION_CREATED_BY_ME,
  getFileTypePage
} from '../views/FileType/helpers'
import OnlyOfficePaywallView from '../views/OnlyOffice/OnlyOfficePaywallView'
import { getOnlyOfficeRoutes } from '../views/OnlyOffice/routes'
import { getPdfRoutes } from '../views/Pdf/routes'
import RecentView from '../views/Recent'
import FilesViewerRecent from '../views/Recent/FilesViewerRecent'
import FilesViewerSharedDrive from '../views/SharedDrive/FilesViewerSharedDrive'
import FilesViewerSharedDriveRootFile from '../views/SharedDrive/FilesViewerSharedDriveRootFile'
import SharingsView from '../views/Sharings'
import SharingsFilesViewer from '../views/Sharings/FilesViewerSharings'
import SharingsFolderView from '../views/Sharings/SharingsFolderView'
import FilesViewerTrash from '../views/Trash/FilesViewerTrash'
import TrashFolderView from '../views/Trash/TrashFolderView'

import FileHistory from '@/components/FileHistory'
import {
  CREATED_BY_ME_ROUTE,
  ROOT_DIR_ID,
  SHARING_TAB_BY_ME,
  SHARING_TAB_DRIVES,
  SHARING_TAB_WITH_ME,
  TRASH_DIR_ID
} from '@/constants/config'
import { ViewSwitcherContextProvider } from '@/lib/ViewSwitcherContext'
import { SentryRoutes } from '@/lib/sentry'
import { UploaderComponent } from '@/modules//views/Upload/UploaderComponent'
import Layout from '@/modules/layout/Layout'
import { PublicNoteRedirect } from '@/modules/navigation/PublicNoteRedirect'
import { SHARED_DRIVE_ROOT_FILE_ROUTE } from '@/modules/routeUtils'
import FileOpenerExternal from '@/modules/viewer/FileOpenerExternal'
import { FavoritesView } from '@/modules/views/Favorites/FavoritesView'
import { FolderDuplicateView } from '@/modules/views/Folder/FolderDuplicateView'
import { DuplicateSharedDriveFilesView } from '@/modules/views/Modal/DuplicateSharedDriveFilesView'
import { MoveFilesView } from '@/modules/views/Modal/MoveFilesView'
import { MoveSharedDriveFilesView } from '@/modules/views/Modal/MoveSharedDriveFilesView'
import { QualifyFileView } from '@/modules/views/Modal/QualifyFileView'
import { ShareDisplayedFolderView } from '@/modules/views/Modal/ShareDisplayedFolderView'
import { ShareFileView } from '@/modules/views/Modal/ShareFileView'
import { NextcloudDeleteView } from '@/modules/views/Nextcloud/NextcloudDeleteView'
import { NextcloudDestroyView } from '@/modules/views/Nextcloud/NextcloudDestroyView'
import { NextcloudDuplicateView } from '@/modules/views/Nextcloud/NextcloudDuplicateView'
import { NextcloudFolderView } from '@/modules/views/Nextcloud/NextcloudFolderView'
import { NextcloudMoveView } from '@/modules/views/Nextcloud/NextcloudMoveView'
import { NextcloudTrashEmptyView } from '@/modules/views/Nextcloud/NextcloudTrashEmptyView'
import { NextcloudTrashView } from '@/modules/views/Nextcloud/NextcloudTrashView'
import SearchView from '@/modules/views/Search/SearchView'
import { SharedDriveFolderView } from '@/modules/views/SharedDrive/SharedDriveFolderView'
import { LegacySharingsRedirect } from '@/modules/views/Sharings/LegacySharingsRedirect'
import {
  areDrivesAvailable,
  SharingsTabProvider
} from '@/modules/views/Sharings/useSharingsTab'
import {
  SpaceLayout,
  SpaceRootRedirect
} from '@/modules/views/Space/SpaceLayout'
import { TrashDestroyView } from '@/modules/views/Trash/TrashDestroyView'
import { TrashEmptyView } from '@/modules/views/Trash/TrashEmptyView'

// Avoid conflict with legacy Bar routes
export const ASSISTANT_ROUTE_PATH = 'assistant/:conversationId'
const filteredBarRoutes = BarRoutes.filter(
  r => r.props?.path !== ASSISTANT_ROUTE_PATH
)

const FilesRedirect = () => {
  const { folderId } = useParams()
  return <Navigate to={`/folder/${folderId}`} replace={true} />
}

// File type pages are opened from the Home entrypoints: the Drive sections
// for files of the type only, and the bar shows the entrypoint instead of
// Drive. A type may show the grid view by default and remember its own pick.
const FileTypeLayout = () => {
  const { fileType } = useParams()
  const page = getFileTypePage(fileType)

  if (!page) return <Navigate to="/recent" replace={true} />

  const layout = (
    <Layout
      appIcon={page.appIcon}
      appTextIcon={page.appTextIcon}
      sidebarActions={<FileTypeCreateButton fileType={fileType} page={page} />}
      nav={<FileTypeNav fileType={fileType} />}
    />
  )

  return page.viewTypeSetting ? (
    <ViewSwitcherContextProvider
      key={fileType}
      settingKey={page.viewTypeSetting}
      defaultViewType={page.defaultViewType}
    >
      {layout}
    </ViewSwitcherContextProvider>
  ) : (
    layout
  )
}

// Recent and Created by me of a file type page share their routes. Recent is
// the page itself, so it has no path of its own.
const fileTypeListRoute = (path, createdByMe = false) => (
  <Route
    key={path ?? 'recent'}
    path={path}
    element={<FileTypeView createdByMe={createdByMe} />}
  >
    {path ? null : <Route index element={null} />}
    <Route
      path="file/:fileId"
      element={<OutletWrapper Component={FilesViewerFileTypeList} />}
    >
      <Route path="v/revision" element={<FileHistory />} />
      <Route path="v/share" element={<ShareFileView />} />
      <Route path="v/move" element={<MoveFilesView isOpenInViewer />} />
      <Route path="v/duplicate" element={<FolderDuplicateView />} />
    </Route>
    <Route path="file/:fileId/revision" element={<FileHistory />} />
    <Route path="file/:fileId/share" element={<ShareFileView />} />
    <Route path="file/:fileId/qualify" element={<QualifyFileView />} />
    <Route path="share" element={<ShareDisplayedFolderView />} />
    <Route path="move" element={<MoveFilesView />} />
  </Route>
)

const FilesViewerCreatedByMe = () => <FilesViewerRecent createdByMe />

// Recent and Created by me of Drive share their routes.
const recentRoute = (path, createdByMe = false) => (
  <Route
    key={path}
    path={path}
    element={<RecentView createdByMe={createdByMe} />}
  >
    <Route
      path="file/:fileId"
      element={
        <OutletWrapper
          Component={createdByMe ? FilesViewerCreatedByMe : FilesViewerRecent}
        />
      }
    >
      <Route path="v/revision" element={<FileHistory />} />
      <Route path="v/share" element={<ShareFileView />} />
      <Route path="v/move" element={<MoveFilesView isOpenInViewer />} />
      <Route path="v/duplicate" element={<FolderDuplicateView />} />
    </Route>
    <Route path="file/:fileId/revision" element={<FileHistory />} />
    <Route path="file/:fileId/share" element={<ShareFileView />} />
    <Route path="file/:fileId/qualify" element={<QualifyFileView />} />
    <Route path="share" element={<ShareDisplayedFolderView />} />
    <Route path="move" element={<MoveFilesView />} />
  </Route>
)

const OutletWrapper = ({ Component }) => (
  <>
    <Component />
    <Outlet />
  </>
)

const SharingsTabLayout = ({ tab }) => (
  <SharingsTabProvider tab={tab}>
    <Outlet />
  </SharingsTabProvider>
)

const sharingsTabRoute = (tab, sharedDrivesEnabled) => (
  <Route key={tab} path={tab} element={<SharingsTabLayout tab={tab} />}>
    <Route index element={<SharingsView />} />
    <Route element={<SharingsView />}>
      <Route
        path="file/:fileId"
        element={<OutletWrapper Component={SharingsFilesViewer} />}
      >
        <Route path="v/revision" element={<FileHistory />} />
        <Route path="v/share" element={<ShareFileView />} />
        <Route path="v/move" element={<MoveFilesView isOpenInViewer />} />
        <Route path="v/duplicate" element={<FolderDuplicateView />} />
      </Route>
      <Route path="file/:fileId/revision" element={<FileHistory />} />
      <Route path="file/:fileId/share" element={<ShareFileView />} />
      <Route
        path="share/shareddrive/:driveId/:fileId"
        element={<ShareFileView />}
      />
      <Route path="file/:fileId/qualify" element={<QualifyFileView />} />
      {sharedDrivesEnabled ? sharedDriveRootFileRoute() : null}
    </Route>
    <Route path="folder/:folderId" element={<SharingsFolderView />}>
      <Route path="file/:fileId" element={<SharingsFilesViewer />} />
      <Route path="file/:fileId/revision" element={<FileHistory />} />
      <Route path="file/:fileId/share" element={<ShareFileView />} />
      <Route path="file/:fileId/qualify" element={<QualifyFileView />} />
      <Route path="share" element={<ShareDisplayedFolderView />} />
    </Route>
    {sharedDrivesEnabled ? sharedDriveFolderRoute() : null}
    <Route path="move" element={<MoveFilesView />} />
  </Route>
)

const sharedDriveRootFileViewerRoutes = () => (
  <>
    <Route path="v/revision" element={<FileHistory />} />
    <Route path="v/share" element={<ShareFileView />} />
    <Route path="revision" element={<FileHistory />} />
    <Route path="share" element={<ShareFileView />} />
  </>
)

const sharedDriveRootFileRoute = () => (
  <Route
    path={SHARED_DRIVE_ROOT_FILE_ROUTE}
    element={<OutletWrapper Component={FilesViewerSharedDriveRootFile} />}
  >
    {sharedDriveRootFileViewerRoutes()}
  </Route>
)

const sharedDriveFolderRoute = (path = 'shareddrive/:driveId/:folderId') => (
  <Route path={path} element={<SharedDriveFolderView />}>
    <Route
      path="file/:fileId"
      element={<OutletWrapper Component={FilesViewerSharedDrive} />}
    >
      <Route
        path="v/move"
        element={<MoveSharedDriveFilesView isOpenInViewer />}
      />
      <Route path="v/duplicate" element={<DuplicateSharedDriveFilesView />} />
      {/* The viewer's Share action navigates to a relative `v/share`; without
          this child route the URL matches nothing and the page goes blank.
          driveId is in the path so the modal resolves a proxied recipient
          document. */}
      <Route path="v/share" element={<ShareFileView />} />
    </Route>
    <Route path="file/:fileId/revision" element={<FileHistory />} />
    <Route path="file/:fileId/v/revision" element={<FileHistory />} />
    <Route path="file/:fileId/share" element={<ShareFileView />} />
    <Route path="share" element={<ShareDisplayedFolderView />} />
    <Route path="move" element={<MoveSharedDriveFilesView />} />
    <Route path="duplicate" element={<DuplicateSharedDriveFilesView />} />
  </Route>
)

const sharedDriveRoutes = () => (
  <>
    {sharedDriveRootFileRoute()}
    {sharedDriveFolderRoute()}
  </>
)

const getEditorRoutes = () => (
  <>
    {flag('drive.excalidraw.enabled') && getExcalidrawRoutes()}
    {flag('drive.pdf-editor.enabled') && getPdfRoutes()}
  </>
)

const AppRoutes = ({ sharedDrivesEnabled }) => (
  <SentryRoutes>
    <Route path="external/:fileId" element={<ExternalRedirect />} />
    <Route path="external/:driveId/:fileId" element={<ExternalRedirect />} />
    <Route path="note/:fileId" element={<PublicNoteRedirect />} />
    <Route path="note/:driveId/:fileId" element={<PublicNoteRedirect />} />

    {sharedDrivesEnabled ? (
      <Route path="embed/sharings/:driveId" element={<SpaceLayout />}>
        <Route index element={<SpaceRootRedirect />} />
        {sharedDriveFolderRoute(':folderId')}
      </Route>
    ) : null}

    <Route element={<AssistantLayout />}>
      <Route path={ASSISTANT_ROUTE_PATH} element={<AssistantView />} />
    </Route>

    <Route path="type/:fileType" element={<FileTypeLayout />}>
      {fileTypeListRoute()}
      {fileTypeListRoute(FILE_TYPE_SECTION_CREATED_BY_ME, true)}
      <Route path="sharings" element={<Navigate to="with-me" replace />} />
      <Route path="sharings/:tab" element={<FileTypeSharingsView />}>
        <Route
          path="file/:fileId"
          element={<OutletWrapper Component={FilesViewerFileTypeList} />}
        >
          <Route path="v/revision" element={<FileHistory />} />
          <Route path="v/share" element={<ShareFileView />} />
          <Route path="v/move" element={<MoveFilesView isOpenInViewer />} />
          <Route path="v/duplicate" element={<FolderDuplicateView />} />
        </Route>
        <Route path="file/:fileId/revision" element={<FileHistory />} />
        <Route path="file/:fileId/share" element={<ShareFileView />} />
        <Route path="file/:fileId/qualify" element={<QualifyFileView />} />
        <Route path="move" element={<MoveFilesView />} />
      </Route>
      <Route path="trash" element={<FileTypeTrashView />}>
        <Route path="file/:fileId" element={<FilesViewerFileTypeList />} />
        <Route path="file/:fileId/revision" element={<FileHistory />} />
        <Route path="destroy" element={<TrashDestroyView />} />
      </Route>
    </Route>

    <Route element={<Layout />}>
      <Route path="upload" element={<UploaderComponent />} />
      {flag('drive.file-picker-demo.enabled') && (
        <Route path="file-picker-demo" element={<FilePickerDemoView />} />
      )}
      <Route path="/files/:folderId" element={<FilesRedirect />} />
      <Route path="/" element={<Index />} />

      <Route
        path="folder"
        element={<Navigate to={ROOT_DIR_ID} replace={true} />}
      />
      <Route path="folder/:folderId" element={<DriveFolderView />}>
        <Route
          path="file/:fileId"
          element={<OutletWrapper Component={FilesViewerDrive} />}
        >
          <Route path="v/revision" element={<FileHistory />} />
          <Route path="v/share" element={<ShareFileView />} />
          <Route path="v/move" element={<MoveFilesView isOpenInViewer />} />
          <Route path="v/duplicate" element={<FolderDuplicateView />} />
          <Route path="v/ai/paywall" element={<AIAssistantPaywallView />} />
        </Route>
        <Route path="file/:fileId/revision" element={<FileHistory />} />
        <Route path="file/:fileId/share" element={<ShareFileView />} />
        <Route path="file/:fileId/qualify" element={<QualifyFileView />} />
        <Route path="paywall" element={<OnlyOfficePaywallView />} />
        <Route path="share" element={<ShareDisplayedFolderView />} />
        <Route path="move" element={<MoveFilesView />} />
        <Route path="duplicate" element={<FolderDuplicateView />} />
      </Route>

      {!flag('drive.hide-nextcloud-dev') ? (
        <>
          <Route
            path="nextcloud/:sourceAccount"
            element={<NextcloudFolderView />}
          >
            <Route path="move" element={<NextcloudMoveView />} />
            <Route path="delete" element={<NextcloudDeleteView />} />
            <Route path="duplicate" element={<NextcloudDuplicateView />} />
          </Route>
          <Route
            path="nextcloud/:sourceAccount/trash"
            element={<NextcloudTrashView />}
          >
            <Route path="empty" element={<NextcloudTrashEmptyView />} />
            <Route path="destroy" element={<NextcloudDestroyView />} />
          </Route>
        </>
      ) : null}

      {sharedDrivesEnabled ? sharedDriveRoutes() : null}

      {recentRoute('recent')}
      {recentRoute(CREATED_BY_ME_ROUTE, true)}

      <Route
        path="trash"
        element={<Navigate to={TRASH_DIR_ID} replace={true} />}
      />

      <Route path="trash/:folderId" element={<TrashFolderView />}>
        <Route path="file/:fileId" element={<FilesViewerTrash />} />
        <Route path="file/:fileId/revision" element={<FileHistory />} />
        <Route path="empty" element={<TrashEmptyView />} />
        <Route path="destroy" element={<TrashDestroyView />} />
      </Route>

      <Route path="sharings">
        <Route index element={<LegacySharingsRedirect />} />
        {[SHARING_TAB_WITH_ME, SHARING_TAB_BY_ME, SHARING_TAB_DRIVES].map(tab =>
          sharingsTabRoute(tab, sharedDrivesEnabled)
        )}
        <Route path="*" element={<LegacySharingsRedirect />} />
      </Route>

      {getOnlyOfficeRoutes()}

      {getEditorRoutes()}

      <Route path="file/:fileId" element={<FileOpenerExternal />} />

      <Route path="search" element={<SearchView />} />

      <Route path="favorites" element={<FavoritesView />}>
        <Route path="file/:fileId/revision" element={<FileHistory />} />
        <Route path="file/:fileId/share" element={<ShareFileView />} />
        <Route path="file/:fileId/qualify" element={<QualifyFileView />} />
        <Route path="share" element={<ShareDisplayedFolderView />} />
        <Route path="move" element={<MoveFilesView />} />
      </Route>

      {filteredBarRoutes}
    </Route>
  </SentryRoutes>
)

const AppRoute = () => <AppRoutes sharedDrivesEnabled={areDrivesAvailable()} />

export default AppRoute
