import cx from 'classnames'
import React, { useMemo } from 'react'

import { useClient } from 'cozy-client'
import { useAlert } from 'cozy-ui/transpiled/react/providers/Alert'
import { useI18n } from 'twake-i18n'

import { UserTemplateTile, UserTemplateTiles } from './UserTemplateTiles'
import { useHiddenTemplates } from './useHiddenTemplates'
import { useUserTemplates } from './useUserTemplates'
import { getReplacedTemplateId } from './userTemplates'
import { BoardPreview } from '../Board/BoardPreview'
import boardStyles from '../Board/board.styl'
import { OfficePreview } from '../Office/OfficePreview'
import officeStyles from '../Office/office.styl'
import { useCreateFileTypeFile } from '../useCreateFileTypeFile'

import logger from '@/lib/logger'

/**
 * Templates of a file type page, as its Create block offers them: the
 * templates of the page the user did not remove, the copies the user edited
 * in their place, the templates the user saved, and a tile creating one.
 *
 * @param {string} fileType - Type of the page
 * @param {object} page - The file type page
 * @param {object} [options] - Options
 * @param {string} [options.shape] - Shape of the tiles, the one of the type
 *   by default
 * @returns {object} createFile and isCreating of the page,
 *   templateStripProps for OfficeCreateStrip or BoardCreateStrip, and
 *   refreshTemplates to call once a template is saved
 */
export const useTemplateStrip = (fileType, page, { shape = fileType } = {}) => {
  const client = useClient()
  const { t } = useI18n()
  const { showAlert } = useAlert()
  const userTemplates = useUserTemplates(fileType)
  const hiddenTemplates = useHiddenTemplates(fileType)
  const {
    createFile,
    createFromTemplateFile,
    createTemplate,
    editTemplate,
    isCreating
  } = useCreateFileTypeFile(fileType, page)
  const isOffice = page.home === 'office'

  const alertError = (message, error) => {
    logger.error(message, error)
    showAlert({ message: t('UserTemplates.remove_error'), severity: 'error' })
  }

  const removeUserTemplate = async template => {
    try {
      await client.collection('io.cozy.files').destroy(template)
    } catch (error) {
      alertError('Could not remove the user template', error)
    }
    userTemplates.refresh()
  }

  const hidePageTemplate = async templateId => {
    try {
      await hiddenTemplates.hide(templateId)
    } catch (error) {
      alertError('Could not remove the template', error)
    }
  }

  const restorePageTemplates = async () => {
    try {
      await hiddenTemplates.restore()
    } catch (error) {
      logger.error('Could not restore the templates', error)
      showAlert({
        message: t('UserTemplates.restore_error'),
        severity: 'error'
      })
    }
  }

  // A template of the page the user edited shows its copy in its place,
  // the latest one if several.
  const { customizedTemplates, ownTemplates } = useMemo(() => {
    const customized = new Map()
    const own = []
    for (const template of userTemplates.templates) {
      const templateId = getReplacedTemplateId(template, fileType)
      if (templateId && !customized.has(templateId)) {
        customized.set(templateId, template)
      } else {
        own.push(template)
      }
    }
    return { customizedTemplates: customized, ownTemplates: own }
  }, [userTemplates.templates, fileType])

  const userTemplateTileProps = {
    renderPreview: template =>
      isOffice ? (
        <OfficePreview file={template} shape={shape} />
      ) : (
        <BoardPreview file={template} />
      ),
    onCreate: createFromTemplateFile,
    onEdit: editTemplate,
    onRemove: removeUserTemplate,
    isCreating
  }
  const canCreateTemplate = page.canCreate()

  const templateStripProps = {
    userTemplates: (
      <UserTemplateTiles
        templates={ownTemplates}
        newTemplateClassName={
          isOffice
            ? cx(
                officeStyles['officeBlank'],
                officeStyles[`officePreview--${shape}`]
              )
            : boardStyles['boardTemplate-blank']
        }
        onCreateTemplate={canCreateTemplate ? createTemplate : undefined}
        {...userTemplateTileProps}
      />
    ),
    onEditTemplate: canCreateTemplate ? createTemplate : undefined,
    hiddenTemplateIds: hiddenTemplates.hiddenIds,
    onRemoveTemplate: hidePageTemplate,
    onRestoreTemplates: restorePageTemplates,
    renderCustomizedTemplate: templateId => {
      const template = customizedTemplates.get(templateId)
      return template ? (
        <UserTemplateTile
          key={templateId}
          template={template}
          {...userTemplateTileProps}
        />
      ) : null
    }
  }

  return {
    createFile,
    isCreating,
    templateStripProps,
    refreshTemplates: userTemplates.refresh
  }
}
