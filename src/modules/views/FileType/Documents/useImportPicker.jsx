import React, { useRef } from 'react'

import styles from './documents.styl'

// Files offered by the Import button: the ones of the page.
const IMPORT_ACCEPT =
  '.doc,.docx,.odt,.rtf,.txt,.xls,.xlsx,.ods,.csv,.ppt,.pptx,.odp,.pdf'

/**
 * File picker of the Documents page, giving the files picked as dropped ones.
 * @param {Function} onImport - Uploads the files, as dropped
 * @returns {{ openPicker: Function, pickerInput: React.ReactNode }}
 */
export const useImportPicker = onImport => {
  const inputRef = useRef(null)

  const handleFiles = event => {
    const files = Array.from(event.target.files ?? [])
    onImport(files.map(file => ({ file, isDirectory: false })))
    // The same files can be picked again.
    event.target.value = ''
  }

  return {
    openPicker: () => inputRef.current?.click(),
    pickerInput: (
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={IMPORT_ACCEPT}
        className={styles['documentsCreate-input']}
        onChange={handleFiles}
        data-testid="documents-import-input"
      />
    )
  }
}
