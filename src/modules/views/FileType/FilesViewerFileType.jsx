import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { getFileTypePage, getFileTypePath } from './helpers'
import { useFileTypeFiles } from './useFileTypeFiles'
import { useRecentFilters } from '../Recent/useRecentFilters'

import { FilesViewerLoading } from '@/components/FilesViewerLoading'
import useHead from '@/components/useHead'
import FilesViewer from '@/modules/viewer/FilesViewer'

const FILE_TYPE_PAGE_FILTERS = ['contact']

const FilesViewerFileType = () => {
  const { fileType } = useParams()
  const page = getFileTypePage(fileType)
  const navigate = useNavigate()
  const { search } = useLocation()
  const { filters } = useRecentFilters(FILE_TYPE_PAGE_FILTERS)
  // FileTypeView already redirected unknown types, so page is set here.
  const { result, filteredResult } = useFileTypeFiles({
    fileType,
    page,
    filters
  })
  useHead()
  const basePath = getFileTypePath(fileType)

  if (result.data) {
    return (
      <FilesViewer
        files={filteredResult.data}
        filesQuery={result}
        onClose={() => navigate({ pathname: basePath, search })}
        onChange={fileId =>
          navigate({ pathname: `${basePath}/file/${fileId}`, search })
        }
      />
    )
  } else {
    return <FilesViewerLoading />
  }
}

export default FilesViewerFileType
