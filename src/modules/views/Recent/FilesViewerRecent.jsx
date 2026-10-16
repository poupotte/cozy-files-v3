import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useQuery } from 'cozy-client'

import { useFilteredRecents } from './useFilteredRecents'
import { useRecentFilters } from './useRecentFilters'

import { FilesViewerLoading } from '@/components/FilesViewerLoading'
import useHead from '@/components/useHead'
import FilesViewer from '@/modules/viewer/FilesViewer'
import { buildRecentQuery } from '@/queries'

const FilesViewerRecent = () => {
  const filesQuery = buildRecentQuery()
  const results = useQuery(filesQuery.definition, filesQuery.options)
  const navigate = useNavigate()
  const { search } = useLocation()
  const { filters } = useRecentFilters()
  // Keep next/previous within the files the filtered list shows.
  const { filteredResult } = useFilteredRecents({ result: results, filters })
  useHead()

  if (results.data) {
    const viewableFiles = filteredResult.data
    return (
      <FilesViewer
        files={viewableFiles}
        filesQuery={results}
        onClose={() => navigate({ pathname: '/recent', search })}
        onChange={fileId =>
          navigate({ pathname: `/recent/file/${fileId}`, search })
        }
      />
    )
  } else {
    return <FilesViewerLoading />
  }
}

export default FilesViewerRecent
