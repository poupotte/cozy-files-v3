import React from 'react'

import FileImageLoader from 'cozy-ui-plus/dist/FileImageLoader'

import styles from '@/styles/filelist.styl'

import { isDriveBackedFile } from '@/modules/filelist/helpers'
import FileIconMime from '@/modules/filelist/icons/FileIconMime'
import FileIconShortcut from '@/modules/filelist/icons/FileIconShortcut'
import { isExcalidraw } from '@/modules/views/Excalidraw/helpers'
import { BoardPreview } from '@/modules/views/FileType/Board/BoardPreview'
import { OfficePreview } from '@/modules/views/FileType/Office/OfficePreview'
import { getOfficePreviewKind } from '@/modules/views/FileType/Office/officePreview'

const FileIcon = ({ file, size, viewType = 'list' }) => {
  const isImage = file.class === 'image'
  const isShortcut = file.class === 'shortcut' && !isDriveBackedFile(file)
  const officeKind = getOfficePreviewKind(file)
  // A board shows its drawing in the grid, as on the Board page.
  if (viewType === 'grid' && isExcalidraw(file))
    return (
      <BoardPreview
        file={file}
        className={styles['fil-file-thumbnail-board']}
      />
    )
  // A document, spreadsheet or presentation shows its content, as on the
  // Office pages.
  if (viewType === 'grid' && officeKind)
    return (
      <OfficePreview
        file={file}
        shape={officeKind}
        className={styles['fil-file-thumbnail-office']}
      />
    )
  if (isImage || file.class === 'pdf')
    return (
      <FileImageLoader
        key={file._id}
        file={file}
        linkType={viewType === 'grid' ? 'small' : 'tiny'}
        render={src => (
          <img
            src={src}
            width={size || 32}
            height={size || 32}
            className={styles['fil-file-thumbnail-image']}
          />
        )}
        renderFallback={() => <FileIconMime file={file} size={size} />}
      />
    )
  else if (isShortcut) return <FileIconShortcut file={file} size={size} />
  else return <FileIconMime file={file} size={size} />
}

export default FileIcon
