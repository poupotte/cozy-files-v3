import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useQuery } from 'cozy-client'

import { useCreatedByMe } from './createdByMe'
import { useFilteredRecents } from './useFilteredRecents'
import { useRecentFilters } from './useRecentFilters'

import { FilesViewerLoading } from '@/components/FilesViewerLoading'
import useHead from '@/components/useHead'
import { CREATED_BY_ME_ROUTE } from '@/constants/config'
import FilesViewer from '@/modules/viewer/FilesViewer'
import { buildRecentQuery } from '@/queries'

const FilesViewerRecent = ({ createdByMe = false }) => {
  const filesQuery = buildRecentQuery()
  const results = useQuery(filesQuery.definition, filesQuery.options)
  const navigate = useNavigate()
  const { search } = useLocation()
  const { filters } = useRecentFilters()
  // Keep next/previous within the files the filtered list shows.
  const { filteredResult } = useFilteredRecents({ result: results, filters })
  const listResult = useCreatedByMe(filteredResult, createdByMe)
  const basePath = createdByMe ? `/${CREATED_BY_ME_ROUTE}` : '/recent'
  useHead()

  if (results.data) {
    const viewableFiles = listResult.data
    return (
      <FilesViewer
        files={viewableFiles}
        filesQuery={results}
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

export default FilesViewerRecent
