import { Icon, Copy } from '@linagora/twake-icons'
import React, { forwardRef } from 'react'

import { splitFilename } from 'cozy-client/dist/models/file'
import ActionsMenuItem from 'cozy-ui/transpiled/react/ActionsMenu/ActionsMenuItem'
import ListItemIcon from 'cozy-ui/transpiled/react/ListItemIcon'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'

import { isUserTemplate, saveAsUserTemplate } from './userTemplates'

import logger from '@/lib/logger'

/**
 * Action of the file type pages saving a copy of a file as a template, which
 * the Create block of the page then offers.
 */
export const saveAsTemplate = ({
  t,
  client,
  showAlert,
  fileType,
  page,
  onSaved
}) => {
  const label = t('UserTemplates.save')

  return {
    name: 'saveAsTemplate',
    label,
    icon: Copy,
    allowInfectedFiles: false,
    displayCondition: docs =>
      docs.length === 1 &&
      docs[0].type === 'file' &&
      !docs[0].driveId &&
      !isUserTemplate(docs[0], fileType),
    action: async ([file]) => {
      try {
        await saveAsUserTemplate({ client, file, fileType, page, t })
        showAlert({
          message: t('UserTemplates.saved', {
            name: splitFilename(file).filename
          }),
          severity: 'success'
        })
        onSaved()
      } catch (error) {
        logger.error('Could not save the file as a template', error)
        showAlert({ message: t('UserTemplates.save_error'), severity: 'error' })
      }
    },
    Component: forwardRef(function SaveAsTemplate(props, ref) {
      return (
        <ActionsMenuItem {...props} ref={ref}>
          <ListItemIcon>
            <Icon icon={Copy} />
          </ListItemIcon>
          <ListItemText primary={label} />
        </ActionsMenuItem>
      )
    })
  }
}
