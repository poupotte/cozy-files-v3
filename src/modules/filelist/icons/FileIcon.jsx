import React from 'react'

import FileImageLoader from 'cozy-ui-plus/dist/FileImageLoader'

import styles from '@/styles/filelist.styl'

import { isDriveBackedFile } from '@/modules/filelist/helpers'
import FileIconMime from '@/modules/filelist/icons/FileIconMime'
import FileIconShortcut from '@/modules/filelist/icons/FileIconShortcut'
import { isExcalidraw } from '@/modules/views/Excalidraw/helpers'
import { BoardPreview } from '@/modules/views/FileType/Board/BoardPreview'

const FileIcon = ({ file, size, viewType = 'list' }) => {
  const isImage = file.class === 'image'
  const isShortcut = file.class === 'shortcut' && !isDriveBackedFile(file)
  // A board shows its drawing in the grid, as on the Board page.
  if (viewType === 'grid' && isExcalidraw(file))
    return (
      <BoardPreview
        file={file}
        className={styles['fil-file-thumbnail-board']}
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
