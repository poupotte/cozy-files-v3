import React from 'react'

import FileImageLoader from 'cozy-ui-plus/dist/FileImageLoader'

import { getDocumentKind } from './documentKinds'
import styles from './documents.styl'
import { OfficeCard } from '../Office/OfficeCard'
import officeStyles from '../Office/office.styl'

import FileIconMime from '@/modules/filelist/icons/FileIconMime'

// First page of a PDF, from the thumbnail of the stack.
const PdfPreview = ({ file }) => (
  <div
    className={`${officeStyles['officePreview']} ${officeStyles['officePreview--document']}`}
    data-testid="pdf-preview"
  >
    <FileImageLoader
      file={file}
      linkType="medium"
      render={src => (
        <img className={styles['documentCard-pdf']} src={src} alt="" />
      )}
      renderFallback={() => (
        <span className={officeStyles['officePreview-icon']}>
          <FileIconMime file={file} size={48} />
        </span>
      )}
    />
  </div>
)

/**
 * Tile of a document of the Documents page, of the same shape for every kind
 * of document, showing its content as the tiles of its own page.
 *
 * @param {object} props - Component props
 * @param {object} props.file - The io.cozy.files doc
 * @param {object[]} props.actions - Actions of the page, from makeActions
 */
export const DocumentCard = ({ file, actions }) => {
  const kind = getDocumentKind(file)

  if (kind === 'pdf') {
    return (
      <OfficeCard
        file={file}
        actions={actions}
        fileType="text"
        shape="document"
        preview={<PdfPreview file={file} />}
      />
    )
  }
  return (
    <OfficeCard
      file={file}
      actions={actions}
      fileType={['sheet', 'slide'].includes(kind) ? kind : 'text'}
      shape="document"
    />
  )
}
