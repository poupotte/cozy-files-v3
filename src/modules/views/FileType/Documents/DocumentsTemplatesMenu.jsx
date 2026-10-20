import React from 'react'

import Popover from 'cozy-ui/transpiled/react/Popover'

import { DocumentsTemplates } from './DocumentsTemplates'
import styles from './documents.styl'

/**
 * Templates of a kind of document, in a menu over the page, anchored to the
 * element that opened it.
 *
 * @param {object} props - Component props
 * @param {object|null} props.menu - Open menu, { fileType, anchorEl }, or null
 * @param {Function} props.onClose - Closes the menu
 * @param {object} [props.anchorOrigin] - Point of the anchor the menu opens
 *   from, its bottom right by default
 * @param {object} [props.transformOrigin] - Point of the menu set there
 */
export const DocumentsTemplatesMenu = ({
  menu,
  onClose,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  transformOrigin = { vertical: 'top', horizontal: 'right' }
}) => (
  <Popover
    open={Boolean(menu)}
    anchorEl={menu?.anchorEl}
    onClose={onClose}
    anchorOrigin={anchorOrigin}
    transformOrigin={transformOrigin}
  >
    {menu && (
      <div
        className={styles['documentsTemplatesMenu']}
        data-testid="documents-templates-menu"
      >
        <DocumentsTemplates key={menu.fileType} fileType={menu.fileType} />
      </div>
    )}
  </Popover>
)
