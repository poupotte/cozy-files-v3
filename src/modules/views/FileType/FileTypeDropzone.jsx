import cx from 'classnames'
import React from 'react'
import { useDrop } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import { useDropzone } from 'react-dropzone'

import flag from 'cozy-flags'
import { Content } from 'cozy-ui/transpiled/react/Layout'
import useBreakpoints from 'cozy-ui/transpiled/react/providers/Breakpoints'

import { useFileTypeUpload } from './useFileTypeUpload'

import styles from '@/styles/dropzone.styl'

import DropzoneTeaser from '@/modules/upload/DropzoneTeaser'

const hasOnlyFiles = dataTransfer =>
  Array.from(dataTransfer?.items ?? []).every(item => item.kind === 'file')

// Items dropped through react-dnd: the folders are told by their entry.
const getDndEntries = item => {
  const items = Array.from(item.dataTransfer?.items ?? [])
  if (items.length > 0 && items[0].webkitGetAsEntry) {
    return items.map(entry => ({
      file: entry.getAsFile(),
      isDirectory: entry.webkitGetAsEntry()?.isDirectory === true
    }))
  }
  return Array.from(item.files ?? []).map(file => ({
    file,
    isDirectory: false
  }))
}

// With the virtualized list, react-dnd handles the drops of the whole app, as
// in the Drive folders (see DropzoneDnD).
const DndDropzone = ({ upload, teaserFolder, className, children }) => {
  const [{ isActive }, dropRef] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      canDrop: item => hasOnlyFiles(item.dataTransfer),
      drop: item => {
        upload(getDndEntries(item))
      },
      collect: monitor => ({
        isActive: monitor.isOver() && monitor.canDrop()
      })
    }),
    [upload]
  )

  return (
    <Content
      ref={dropRef}
      className={cx(className, { [styles['fil-dropzone-active']]: isActive })}
    >
      {isActive && <DropzoneTeaser currentFolder={teaserFolder} />}
      {children}
    </Content>
  )
}

const FilesDropzone = ({ upload, teaserFolder, className, children }) => {
  const { getRootProps, isDragActive } = useDropzone({
    onDrop: (files, _, evt) => {
      if (!hasOnlyFiles(evt?.dataTransfer)) return
      upload(files.map(file => ({ file, isDirectory: false })))
    },
    noClick: true,
    noKeyboard: true
  })

  return (
    <Content
      className={cx(className, {
        [styles['fil-dropzone-active']]: isDragActive
      })}
      {...getRootProps()}
    >
      {isDragActive && <DropzoneTeaser currentFolder={teaserFolder} />}
      {children}
    </Content>
  )
}

/**
 * Content of a file type page on which files of its type can be dropped from
 * the computer, to be uploaded in its folder. Files of another type are
 * refused with an alert.
 *
 * @param {object} props - Component props
 * @param {string} props.fileType - Type of the page
 * @param {object} props.page - The file type page
 * @param {Function} [props.onUploaded] - Called once each file is uploaded
 * @param {string} [props.className] - Class of the content
 */
export const FileTypeDropzone = ({
  fileType,
  page,
  onUploaded,
  className,
  children
}) => {
  const { isMobile } = useBreakpoints()
  const upload = useFileTypeUpload(fileType, page, onUploaded)
  const Dropzone =
    flag('drive.virtualization.enabled') && !isMobile
      ? DndDropzone
      : FilesDropzone

  return (
    <Dropzone
      upload={upload}
      teaserFolder={{ name: page.appName }}
      className={className}
    >
      {children}
    </Dropzone>
  )
}
