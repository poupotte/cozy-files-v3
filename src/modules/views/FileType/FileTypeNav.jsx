import {
  Icon,
  ClockOutline,
  FromUser,
  Plus,
  ShareExternal,
  Trash
} from '@linagora/twake-icons'
import React from 'react'

import Button from 'cozy-ui/transpiled/react/Buttons'
import UINav from 'cozy-ui/transpiled/react/Nav'
import { useI18n } from 'twake-i18n'

import { getFileTypeSharingsPath } from './FileTypeSharingsView'
import {
  FILE_TYPE_SECTION_CREATED_BY_ME,
  FILE_TYPE_SECTION_SHARINGS,
  FILE_TYPE_SECTION_TRASH,
  getFileTypePath
} from './helpers'
import { useCreateFileTypeFile } from './useCreateFileTypeFile'

import { useNavContext } from '@/modules/navigation/NavContext'
import { NavItem } from '@/modules/navigation/NavItem'

const SECTIONS = [
  FILE_TYPE_SECTION_CREATED_BY_ME,
  FILE_TYPE_SECTION_SHARINGS,
  FILE_TYPE_SECTION_TRASH
]

const isInSection = (pathname, fileType, section) => {
  const path = getFileTypePath(fileType, section)
  return pathname === path || pathname.startsWith(`${path}/`)
}

/**
 * Create button of the sidebar of a file type page, creating a file of the
 * type instead of opening the Drive add menu.
 */
export const FileTypeCreateButton = ({ fileType, page }) => {
  const { t } = useI18n()
  const { createFile, isCreating } = useCreateFileTypeFile(fileType, page)

  return (
    <div className="u-mh-1 u-mt-half">
      <Button
        className="u-w-100 u-bdrs-6 u-mt-half u-mb-half u-fz-small"
        variant="primary"
        startIcon={<Icon icon={Plus} size={12} />}
        label={t('toolbar.menu_create')}
        busy={isCreating}
        onClick={createFile}
      />
    </div>
  )
}

/**
 * Sidebar of a file type page: the Drive sections, for files of the type.
 */
export const FileTypeNav = ({ fileType }) => {
  const clickState = useNavContext()

  return (
    <UINav>
      <NavItem
        to={getFileTypePath(fileType)}
        icon={<Icon icon={ClockOutline} />}
        label="recent"
        isActive={pathname =>
          isInSection(pathname, fileType) &&
          !SECTIONS.some(section => isInSection(pathname, fileType, section))
        }
        clickState={clickState}
      />
      <NavItem
        to={getFileTypePath(fileType, FILE_TYPE_SECTION_CREATED_BY_ME)}
        icon={<Icon icon={FromUser} />}
        label="created_by_me"
        isActive={pathname =>
          isInSection(pathname, fileType, FILE_TYPE_SECTION_CREATED_BY_ME)
        }
        clickState={clickState}
      />
      <NavItem
        to={getFileTypeSharingsPath(fileType)}
        icon={<Icon icon={ShareExternal} />}
        label="sharings"
        isActive={pathname =>
          isInSection(pathname, fileType, FILE_TYPE_SECTION_SHARINGS)
        }
        clickState={clickState}
      />
      <NavItem
        to={getFileTypePath(fileType, FILE_TYPE_SECTION_TRASH)}
        icon={<Icon icon={Trash} />}
        label="trash"
        isActive={pathname =>
          isInSection(pathname, fileType, FILE_TYPE_SECTION_TRASH)
        }
        clickState={clickState}
      />
    </UINav>
  )
}
