import cx from 'classnames'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { useClient } from 'cozy-client'
import { useI18n } from 'twake-i18n'

import styles from './office.styl'
import {
  DOC_KIND,
  SHEET_KIND,
  SLIDE_KIND,
  getOfficePreviewKind,
  readOfficePreview
} from './officePreview'
import { useIsNearViewport } from '../useIsNearViewport'

import logger from '@/lib/logger'
import FileIconMime from '@/modules/filelist/icons/FileIconMime'
import { fetchFileBinary } from '@/modules/views/editor/helpers'

// Previews already read, by file id and revision, so going back to the page
// or scrolling does not download every file again.
const previewCache = new Map()

const fetchPreview = (client, file, kind) => {
  const key = `${file._id}:${file.md5sum ?? file.updated_at}`
  if (!previewCache.has(key)) {
    previewCache.set(
      key,
      fetchFileBinary(client, file._id, file.driveId)
        .then(response => response.arrayBuffer())
        .then(buffer => readOfficePreview(buffer, kind))
        .catch(error => {
          previewCache.delete(key)
          throw error
        })
    )
  }
  return previewCache.get(key)
}

const useObjectUrl = blob => {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob])

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])

  return url
}

const COLUMN_LETTERS = ['A', 'B', 'C', 'D', 'E']

const DocContent = ({ preview }) => {
  const [title, ...lines] = preview.lines
  return (
    <div className={styles['officePreview-page']}>
      {title && <p className={styles['officePreview-docTitle']}>{title}</p>}
      {lines.map((line, index) => (
        <p key={index} className={styles['officePreview-docLine']}>
          {line}
        </p>
      ))}
    </div>
  )
}

const SheetContent = ({ preview }) => {
  const { t } = useI18n()
  return (
    <>
      <table className={styles['officePreview-sheet']}>
        <thead>
          <tr>
            <th />
            {COLUMN_LETTERS.map(letter => (
              <th key={letter}>{letter}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {preview.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th>{rowIndex + 1}</th>
              {row.map((value, columnIndex) => (
                <td key={columnIndex}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {preview.sheetCount > 1 && (
        <span className={styles['officePreview-badge']}>
          {t('OfficeHome.sheet_count', { smart_count: preview.sheetCount })}
        </span>
      )}
    </>
  )
}

const SlideContent = ({ preview }) => {
  const { t } = useI18n()
  const thumbnailUrl = useObjectUrl(preview.thumbnail)
  return (
    <>
      {thumbnailUrl ? (
        <img
          className={styles['officePreview-slideImage']}
          src={thumbnailUrl}
          alt=""
        />
      ) : (
        <p className={styles['officePreview-slideTitle']}>{preview.title}</p>
      )}
      {preview.slideCount > 0 && (
        <span className={styles['officePreview-badge']}>
          {t('OfficeHome.slide_count', { smart_count: preview.slideCount })}
        </span>
      )}
    </>
  )
}

const CONTENT_BY_KIND = {
  [DOC_KIND]: DocContent,
  [SHEET_KIND]: SheetContent,
  [SLIDE_KIND]: SlideContent
}

/**
 * Miniature of a template, drawn from its content rather than a file.
 *
 * @param {object} props - Component props
 * @param {string} props.fileType - Type of the page (text, sheet or slide)
 * @param {object} props.preview - Preview of the template, from
 *   makeOfficeTemplatePreview
 * @param {string} [props.shape] - Shape of the tile, the one of the type by
 *   default
 */
export const OfficeTemplatePreview = ({
  fileType,
  preview,
  shape = fileType
}) => {
  const Content = CONTENT_BY_KIND[fileType]
  return (
    <div
      className={cx(styles['officePreview'], styles[`officePreview--${shape}`])}
    >
      <Content preview={preview} />
    </div>
  )
}

/**
 * Miniature of an Office file, read from its content once the tile shows on
 * screen: the first lines of a document, the first cells of a spreadsheet,
 * the first slide of a presentation. Files whose content cannot be read
 * (OpenDocument, too big…) show their icon.
 *
 * @param {object} props - Component props
 * @param {object} props.file - The io.cozy.files doc
 * @param {string} props.shape - Kind of the page, giving the tile its shape
 * @param {string} [props.className] - Extra class, to size the miniature
 */
export const OfficePreview = ({ file, shape, className }) => {
  const client = useClient()
  const containerRef = useRef(null)
  const isVisible = useIsNearViewport(containerRef)
  const kind = getOfficePreviewKind(file)
  const [preview, setPreview] = useState(null)
  const [status, setStatus] = useState(kind ? 'loading' : 'empty')

  useEffect(() => {
    if (!kind || !isVisible) return
    let isMounted = true
    const load = async () => {
      try {
        const result = await fetchPreview(client, file, kind)
        if (!isMounted) return
        setPreview(result)
        setStatus('loaded')
      } catch (error) {
        logger.warn('Could not read the office file preview', error)
        if (isMounted) setStatus('empty')
      }
    }
    load()
    return () => {
      isMounted = false
    }
    // The list gives a new file object on each render: read again only when
    // the file itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, kind, isVisible, file._id, file.md5sum, file.updated_at])

  const Content = CONTENT_BY_KIND[kind]

  return (
    <div
      ref={containerRef}
      className={cx(
        styles['officePreview'],
        styles[`officePreview--${shape}`],
        className
      )}
      data-status={status}
      data-testid="office-preview"
    >
      {status === 'loaded' && Content ? (
        <Content preview={preview} />
      ) : status === 'empty' ? (
        <span className={styles['officePreview-icon']}>
          <FileIconMime file={file} size={48} />
        </span>
      ) : null}
    </div>
  )
}
