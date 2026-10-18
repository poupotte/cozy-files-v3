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

// Pages opened by the Home entrypoints (see manifest.webapp): the recent
// files of one type, with a Create button for that type only.
// - classes: io.cozy.files classes queried for the type, or
// - mimes: their mime types, for a type with no class of its own
// - canCreate: whether a file of the type can be created and edited
// - createPath: route creating a file of the type in a folder
// - appIcon, appTextIcon: shown in the bar instead of the Drive ones
// - appName: product name of the empty page welcome
// - folderName: default path of the folder new files are created in
export const FILE_TYPE_PAGES = {
  text: {
    classes: ['text', 'document'],
    canCreate: canWriteOfficeDocument,
    createPath: folderId => `/onlyoffice/create/${folderId}/text`,
    appIcon: DocApp,
    appTextIcon: DocAppText,
    appName: 'Twake Doc',
    folderName: 'Doc'
  },
  sheet: {
    classes: ['spreadsheet', 'sheet'],
    canCreate: canWriteOfficeDocument,
    createPath: folderId => `/onlyoffice/create/${folderId}/spreadsheet`,
    appIcon: SpreadsheetApp,
    appTextIcon: SpreadsheetAppText,
    appName: 'Twake Spreadsheet',
    folderName: 'Spreadsheet'
  },
  slide: {
    classes: ['slide', 'presentation'],
    canCreate: canWriteOfficeDocument,
    createPath: folderId => `/onlyoffice/create/${folderId}/slide`,
    appIcon: PresentationApp,
    appTextIcon: PresentationAppText,
    appName: 'Twake Presentation',
    folderName: 'Presentation'
  },
  excalidraw: {
    mimes: [EXCALIDRAW_MIME],
    canCreate: isExcalidrawEnabled,
    createPath: folderId => `/excalidraw/create/${folderId}`,
    appIcon: BoardApp,
    appTextIcon: BoardAppText,
    appName: 'Twake Board',
    folderName: 'Board'
  }
}

export const getFileTypePage = fileType => FILE_TYPE_PAGES[fileType] ?? null

export const getFileTypePath = fileType => `/type/${fileType}`
