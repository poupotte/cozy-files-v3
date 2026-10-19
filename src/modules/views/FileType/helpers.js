import {
  BoardApp,
  BoardAppText,
  DocApp,
  DocAppText,
  PresentationApp,
  PresentationAppText,
  SpreadsheetApp,
  SpreadsheetAppText
} from '@/components/Icons/FileTypeApps'
import {
  EXCALIDRAW_MIME,
  isExcalidrawEnabled
} from '@/modules/views/Excalidraw/helpers'
import { canWriteOfficeDocument } from '@/modules/views/OnlyOffice/helpers'

// The Office pages share their home and their pick of the list or grid view,
// the list being their default.
const OFFICE_HOME = {
  home: 'office',
  defaultViewType: 'list',
  viewTypeSetting: 'preferredOfficeViewType'
}

// Pages opened by the Home entrypoints (see manifest.webapp): the recent
// files of one type, with a Create button for that type only.
// - classes: io.cozy.files classes queried for the type, or
// - mimes: their mime types, for a type with no class of its own
// - canCreate: whether a file of the type can be created and edited
// - createPath: route creating a file of the type in a folder
// - appIcon, appTextIcon: shown in the bar instead of the Drive ones
// - appName: product name of the empty page welcome
// - folderName: default path of the folder new files are created in
// - folderDecorations: color and icon the folder is customized with, as the
//   Personalize folder action does, so it looks like its app
// - defaultViewType, viewTypeSetting: list or grid view shown until one is
//   picked, and the settings attribute the pick of these pages is saved in
// - home: the home the page opens on, 'board' or 'office', with templates
//   and the latest files as tiles showing their content (see Board/ and
//   Office/), its recent files moving to a section of their own
export const FILE_TYPE_PAGES = {
  text: {
    classes: ['text', 'document'],
    canCreate: canWriteOfficeDocument,
    createPath: folderId => `/onlyoffice/create/${folderId}/text`,
    appIcon: DocApp,
    appTextIcon: DocAppText,
    appName: 'Twake Doc',
    folderName: 'Doc',
    folderDecorations: {
      color: '#0076ED',
      icon: 'Text',
      icon_color: '#FFFFFF'
    },
    ...OFFICE_HOME
  },
  sheet: {
    classes: ['spreadsheet', 'sheet'],
    canCreate: canWriteOfficeDocument,
    createPath: folderId => `/onlyoffice/create/${folderId}/spreadsheet`,
    appIcon: SpreadsheetApp,
    appTextIcon: SpreadsheetAppText,
    appName: 'Twake Spreadsheet',
    folderName: 'Spreadsheet',
    folderDecorations: {
      color: '#0D9E30',
      icon: 'Grid',
      icon_color: '#FFFFFF'
    },
    ...OFFICE_HOME
  },
  slide: {
    classes: ['slide', 'presentation'],
    canCreate: canWriteOfficeDocument,
    createPath: folderId => `/onlyoffice/create/${folderId}/slide`,
    appIcon: PresentationApp,
    appTextIcon: PresentationAppText,
    appName: 'Twake Presentation',
    folderName: 'Presentation',
    folderDecorations: {
      color: '#FF9500',
      icon: 'PieChart',
      icon_color: '#FFFFFF'
    },
    ...OFFICE_HOME
  },
  excalidraw: {
    mimes: [EXCALIDRAW_MIME],
    canCreate: isExcalidrawEnabled,
    createPath: folderId => `/excalidraw/create/${folderId}`,
    appIcon: BoardApp,
    appTextIcon: BoardAppText,
    appName: 'Twake Board',
    folderName: 'Board',
    folderDecorations: { color: '#6965DB', icon: 'Pen', icon_color: '#FFFFFF' },
    defaultViewType: 'grid',
    viewTypeSetting: 'preferredBoardViewType',
    home: 'board'
  }
}

export const getFileTypePage = fileType => FILE_TYPE_PAGES[fileType] ?? null

// Sections of a file type page, as the Drive ones but for files of the type.
export const FILE_TYPE_SECTION_RECENT = ''
// Recent files of a page that opens on its home
export const FILE_TYPE_SECTION_RECENT_LIST = 'recent'
export const FILE_TYPE_SECTION_CREATED_BY_ME = 'created-by-me'
export const FILE_TYPE_SECTION_SHARINGS = 'sharings'
export const FILE_TYPE_SECTION_TRASH = 'trash'

export const getFileTypePath = (
  fileType,
  section = FILE_TYPE_SECTION_RECENT
) => (section ? `/type/${fileType}/${section}` : `/type/${fileType}`)

/**
 * Section of the file type page a path belongs to, or null outside of them.
 */
export const getFileTypeSectionFromPath = pathname => {
  const match = pathname.match(/^\/type\/[^/]+(?:\/([^/]+))?/)
  if (!match) return null
  const section = match[1]
  return [
    FILE_TYPE_SECTION_RECENT_LIST,
    FILE_TYPE_SECTION_CREATED_BY_ME,
    FILE_TYPE_SECTION_SHARINGS,
    FILE_TYPE_SECTION_TRASH
  ].includes(section)
    ? section
    : FILE_TYPE_SECTION_RECENT
}
