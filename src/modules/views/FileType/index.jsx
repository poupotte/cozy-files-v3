import cx from 'classnames'
import React, { useCallback, useMemo, useState } from 'react'
import { Navigate, Outlet, useParams } from 'react-router-dom'

import flag from 'cozy-flags'
import {
  useSharingContext,
  useNativeFileSharing,
  shareNative
} from 'cozy-sharing'
import { makeActions } from 'cozy-ui/transpiled/react/ActionsMenu/Actions'

import { BoardCreateStrip } from './Board/BoardCreateStrip'
import { BoardGrid } from './Board/BoardGrid'
import { BoardPreview } from './Board/BoardPreview'
import boardStyles from './Board/board.styl'
import { DocumentCard } from './Documents/DocumentCard'
import { DocumentsCreateStrip } from './Documents/DocumentsCreateStrip'
import { DocumentsFilters } from './Documents/DocumentsFilters'
import { filterDocuments } from './Documents/documentKinds'
import { useCreateDocument } from './Documents/useCreateDocument'
import { FileTypeDropzone } from './FileTypeDropzone'
import { FileTypeEmpty } from './FileTypeEmpty'
import { FileTypeHeader } from './FileTypeHeader'
import { FileTypeListProvider } from './FileTypeList'
import { OfficeCard } from './Office/OfficeCard'
import { OfficeCreateStrip } from './Office/OfficeCreateStrip'
import { OfficePreview } from './Office/OfficePreview'
import officeStyles from './Office/office.styl'
import {
  UserTemplateTile,
  UserTemplateTiles
} from './UserTemplates/UserTemplateTiles'
import { saveAsTemplate } from './UserTemplates/saveAsTemplate'
import { useHiddenTemplates } from './UserTemplates/useHiddenTemplates'
import { useUserTemplates } from './UserTemplates/useUserTemplates'
import {
  getReplacedTemplateId,
  isUserTemplate
} from './UserTemplates/userTemplates'
import {
  FILE_TYPE_SECTION_CREATED_BY_ME,
  FILE_TYPE_SECTION_RECENT,
  FILE_TYPE_SECTION_RECENT_LIST,
  getFileTypePage,
  getFileTypePath
} from './helpers'
import { useCreateFileTypeFile } from './useCreateFileTypeFile'
import { useFileTypeFavicon } from './useFileTypeFavicon'
import { useFileTypeFiles } from './useFileTypeFiles'
import { useFileTypeUpload } from './useFileTypeUpload'
import FolderView from '../Folder/FolderView'
import FolderViewBody from '../Folder/FolderViewBody'
import FolderViewBodyVz from '../Folder/virtualized/FolderViewBody'

import useHead from '@/components/useHead'
import { RECENT_FOLDER_ID } from '@/constants/config'
import { useFolderSort } from '@/hooks'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import logger from '@/lib/logger'
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

// Latest files shown on the home of a page, the others are in Recent
const HOME_LIMIT = 8

const FileTypeViewContent = ({ fileType, page, createdByMe, isHome }) => {
  const base = useFolderViewBase()
  const sharingContext = useSharingContext()
  const { allLoaded, refresh, isOwner, byDocId } = sharingContext
  const nativeSharing = useNativeFileSharing()
  // A page with a home opens on it: its templates and the latest files as
  // tiles showing their content, never the welcome page.
  const home = isHome ? page.home : null
  const isOnHome = Boolean(home)
  const titleKey = createdByMe
    ? 'title_created_by_me'
    : isOnHome
      ? 'title_home'
      : 'title'
  const title = base.t(`FileTypeView.${titleKey}.${fileType}`)
  useHead({ title })
  useFileTypeFavicon(fileType)
  const [sortOrder, setSortOrder, isSettingsLoaded] =
    useFolderSort(RECENT_FOLDER_ID)

  const { result, filteredResult: typedFiles } = useFileTypeFiles({
    fileType,
    page
  })
  // The templates the user saved are offered by the Create block, not listed.
  const typedResult = useMemo(
    () => ({
      ...typedFiles,
      data: (typedFiles.data ?? []).filter(
        file =>
          !(page.createTypes ?? [fileType]).some(type =>
            isUserTemplate(file, type)
          )
      )
    }),
    [typedFiles, fileType, page]
  )
  const userTemplates = useUserTemplates(fileType)
  const hiddenTemplates = useHiddenTemplates(fileType)
  // The files dropped on the page show once uploaded.
  const refreshFiles = useCallback(() => result.fetch(), [result])
  const filteredResult = useCreatedByMe(typedResult, createdByMe)
  const recentSection = isHome
    ? FILE_TYPE_SECTION_RECENT
    : FILE_TYPE_SECTION_RECENT_LIST
  const basePath = getFileTypePath(
    fileType,
    createdByMe ? FILE_TYPE_SECTION_CREATED_BY_ME : recentSection
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
  const {
    createFile,
    createFromTemplateFile,
    createTemplate,
    editTemplate,
    isCreating
  } = useCreateFileTypeFile(fileType, page)

  // The Documents page creates the files of the Office pages, in their
  // folders, and imports any document in its own.
  const { createDocument, isCreating: isCreatingDocument } = useCreateDocument()
  const importDocuments = useFileTypeUpload(fileType, page, refreshFiles)
  const [documentFilter, setDocumentFilter] = useState('all')

  const removeUserTemplate = async template => {
    try {
      await base.client.collection('io.cozy.files').destroy(template)
    } catch (error) {
      logger.error('Could not remove the user template', error)
      base.showAlert({
        message: base.t('UserTemplates.remove_error'),
        severity: 'error'
      })
    }
    userTemplates.refresh()
  }

  const hidePageTemplate = async templateId => {
    try {
      await hiddenTemplates.hide(templateId)
    } catch (error) {
      logger.error('Could not remove the template', error)
      base.showAlert({
        message: base.t('UserTemplates.remove_error'),
        severity: 'error'
      })
    }
  }

  const restorePageTemplates = async () => {
    try {
      await hiddenTemplates.restore()
    } catch (error) {
      logger.error('Could not restore the templates', error)
      base.showAlert({
        message: base.t('UserTemplates.restore_error'),
        severity: 'error'
      })
    }
  }

  // A template of the page the user edited shows its copy in its place,
  // the latest one if several.
  const { customizedTemplates, ownTemplates } = useMemo(() => {
    const customized = new Map()
    const own = []
    for (const template of userTemplates.templates) {
      const templateId = getReplacedTemplateId(template, fileType)
      if (templateId && !customized.has(templateId)) {
        customized.set(templateId, template)
      } else {
        own.push(template)
      }
    }
    return { customizedTemplates: customized, ownTemplates: own }
  }, [userTemplates.templates, fileType])

  const userTemplateTileProps = {
    renderPreview: template =>
      home === 'office' ? (
        <OfficePreview file={template} shape={fileType} />
      ) : (
        <BoardPreview file={template} />
      ),
    onCreate: createFromTemplateFile,
    onEdit: editTemplate,
    onRemove: removeUserTemplate,
    isCreating
  }
  const canCreateTemplate = page.canCreate()

  const templateStripProps = {
    userTemplates: (
      <UserTemplateTiles
        templates={ownTemplates}
        newTemplateClassName={
          home === 'office'
            ? cx(
                officeStyles['officeBlank'],
                officeStyles[`officePreview--${fileType}`]
              )
            : boardStyles['boardTemplate-blank']
        }
        onCreateTemplate={canCreateTemplate ? createTemplate : undefined}
        {...userTemplateTileProps}
      />
    ),
    onEditTemplate: canCreateTemplate ? createTemplate : undefined,
    hiddenTemplateIds: hiddenTemplates.hiddenIds,
    onRemoveTemplate: hidePageTemplate,
    onRestoreTemplates: restorePageTemplates,
    renderCustomizedTemplate: templateId => {
      const template = customizedTemplates.get(templateId)
      return template ? (
        <UserTemplateTile
          key={templateId}
          template={template}
          {...userTemplateTileProps}
        />
      ) : null
    }
  }

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
    selectAll: () => base.toggleSelectAllItems(filteredResult?.data || []),
    fileType,
    page,
    onSaved: userTemplates.refresh
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
      ...(page.home && !page.createTypes ? [saveAsTemplate, hr] : []),
      trash
    ],
    actionsOptions
  )

  return (
    <FolderView>
      <FileTypeDropzone
        fileType={fileType}
        page={page}
        onUploaded={refreshFiles}
        className={base.isMobile ? '' : 'u-pt-1'}
      >
        {(showHeader || (isOnHome && !isFirstLoad)) && (
          <FileTypeHeader
            title={title}
            fileType={fileType}
            page={page}
            isMobile={base.isMobile}
            withViewSwitcher={!isOnHome}
          />
        )}
        {isOnHome ? (
          <div className={boardStyles['boardHome']}>
            {home === 'documents' ? (
              <DocumentsCreateStrip
                createTypes={page.createTypes}
                onCreate={createDocument}
                onImport={importDocuments}
                canCreate={page.canCreate()}
                isCreating={isCreatingDocument}
              />
            ) : home === 'office' ? (
              <OfficeCreateStrip
                fileType={fileType}
                onCreate={createFile}
                isCreating={isCreating}
                {...templateStripProps}
              />
            ) : (
              <BoardCreateStrip
                onCreate={createFile}
                isCreating={isCreating}
                {...templateStripProps}
              />
            )}
            <BoardGrid
              result={result}
              files={
                home === 'documents'
                  ? filterDocuments(filteredResult.data ?? [], documentFilter)
                  : (filteredResult.data ?? [])
              }
              actions={actions}
              title={base.t('BoardHome.list_title')}
              limit={HOME_LIMIT}
              {...(home === 'documents' && {
                Card: DocumentCard,
                toolbar: (
                  <DocumentsFilters
                    value={documentFilter}
                    onChange={setDocumentFilter}
                  />
                ),
                emptyLabel: base.t(`DocumentsHome.no_file.${documentFilter}`)
              })}
              {...(home === 'office' && {
                Card: OfficeCard,
                cardProps: { fileType },
                emptyLabel: base.t(`OfficeHome.no_file.${fileType}`)
              })}
              seeAllPath={getFileTypePath(
                fileType,
                FILE_TYPE_SECTION_RECENT_LIST
              )}
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
      </FileTypeDropzone>
    </FolderView>
  )
}

/**
 * Recent files of the type, or the ones I created among them.
 *
 * @param {object} props - Component props
 * @param {boolean} [props.createdByMe=false] - Whether to keep my files only
 * @param {boolean} [props.isHome=false] - Whether this is the page itself,
 *   the board home of a board page
 */
export const FileTypeView = ({ createdByMe = false, isHome = false }) => {
  const { fileType } = useParams()
  const page = getFileTypePage(fileType)

  if (!page) return <Navigate to="/recent" replace={true} />

  return (
    <FileTypeViewContent
      fileType={fileType}
      page={page}
      createdByMe={createdByMe}
      isHome={isHome}
    />
  )
}

export default FileTypeView
