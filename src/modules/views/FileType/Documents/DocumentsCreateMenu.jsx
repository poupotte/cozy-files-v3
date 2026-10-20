import React, { useState } from 'react'

import ListItemIcon from 'cozy-ui/transpiled/react/ListItemIcon'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'
import Menu from 'cozy-ui/transpiled/react/Menu'
import MenuItem from 'cozy-ui/transpiled/react/MenuItem'
import { useI18n } from 'twake-i18n'

import { useCreateDocument } from './useCreateDocument'
import { getFileTypePage } from '../helpers'

/**
 * Create button of the Documents page, opening a menu of the kinds of
 * document it creates.
 *
 * @param {object} props - Component props
 * @param {string[]} props.createTypes - Pages whose files can be created
 * @param {Function} props.renderButton - Button, from its onClick and busy
 */
export const DocumentsCreateMenu = ({ createTypes, renderButton }) => {
  const { t } = useI18n()
  const [anchorEl, setAnchorEl] = useState(null)
  const { createDocument, isCreating } = useCreateDocument()

  return (
    <>
      {renderButton({
        onClick: event => setAnchorEl(event.currentTarget),
        busy: isCreating
      })}
      <Menu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        {createTypes.map(fileType => {
          const AppIcon = getFileTypePage(fileType).appIcon
          return (
            <MenuItem
              key={fileType}
              onClick={() => {
                setAnchorEl(null)
                createDocument(fileType)
              }}
              data-testid={`documents-menu-${fileType}`}
            >
              <ListItemIcon>
                <AppIcon width={20} height={20} />
              </ListItemIcon>
              <ListItemText primary={t(`DocumentsHome.create.${fileType}`)} />
            </MenuItem>
          )
        })}
      </Menu>
    </>
  )
}
