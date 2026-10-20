import React from 'react'

import { useI18n } from 'twake-i18n'

import { OfficeCreateStrip } from '../Office/OfficeCreateStrip'
import { useTemplateStrip } from '../UserTemplates/useTemplateStrip'
import { getFileTypePage } from '../helpers'

/**
 * Templates of the Doc, Spreadsheet or Presentation page, shown under the
 * create buttons of the Documents page when the arrow of one is clicked, as
 * their own Create block offers them, in the tiles of the Documents page.
 * The blank file is the create button itself.
 *
 * @param {object} props - Component props
 * @param {string} props.fileType - Page whose templates are offered
 */
export const DocumentsTemplates = ({ fileType }) => {
  const { t } = useI18n()
  const { createFile, isCreating, templateStripProps } = useTemplateStrip(
    fileType,
    getFileTypePage(fileType),
    { shape: 'document' }
  )

  return (
    <OfficeCreateStrip
      fileType={fileType}
      shape="document"
      withBlank={false}
      title={t(`DocumentsHome.templates_title.${fileType}`)}
      onCreate={createFile}
      isCreating={isCreating}
      {...templateStripProps}
    />
  )
}
