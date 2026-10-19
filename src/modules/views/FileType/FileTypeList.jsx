import React, { createContext, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { FilesViewerLoading } from '@/components/FilesViewerLoading'
import useHead from '@/components/useHead'
import FilesViewer from '@/modules/viewer/FilesViewer'

const FileTypeListContext = createContext(null)

/**
 * Shares the list a file type section shows with its file viewer, so
 * next/previous follow the list on screen without another query.
 *
 * @param {object} props - Component props
 * @param {object} props.result - Query result of the whole section
 * @param {object[]} props.files - Files of the list, in display order
 * @param {string} props.basePath - Path of the section
 */
export const FileTypeListProvider = ({ result, files, basePath, children }) => (
  <FileTypeListContext.Provider value={{ result, files, basePath }}>
    {children}
  </FileTypeListContext.Provider>
)

export const FilesViewerFileTypeList = () => {
  const list = useContext(FileTypeListContext)
  const navigate = useNavigate()
  const { search } = useLocation()
  useHead()

  if (!list?.result?.data) return <FilesViewerLoading />

  const { result, files, basePath } = list
  return (
    <FilesViewer
      files={files.filter(file => file.type !== 'directory')}
      filesQuery={result}
      onClose={() => navigate({ pathname: basePath, search })}
      onChange={fileId =>
        navigate({ pathname: `${basePath}/file/${fileId}`, search })
      }
    />
  )
}
