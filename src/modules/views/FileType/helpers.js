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
// - folderDecorations: color and icon the folder is customized with, as the
//   Personalize folder action does, so it looks like its app
export const FILE_TYPE_PAGES = {
  text: {
    classes: ['text', 'document'],
    canCreate: canWriteOfficeDocument,
    createPath: folderId => `/onlyoffice/create/${folderId}/text`,
    appIcon: DocApp,
    appTextIcon: DocAppText,
    appName: 'Twake Doc',
    folderName: 'Doc',
    folderDecorations: { color: '#0076ED', icon: 'Text', icon_color: '#FFFFFF' }
  },
  sheet: {
    classes: ['spreadsheet', 'sheet'],
    canCreate: canWriteOfficeDocument,
    createPath: folderId => `/onlyoffice/create/${folderId}/spreadsheet`,
    appIcon: SpreadsheetApp,
    appTextIcon: SpreadsheetAppText,
    appName: 'Twake Spreadsheet',
    folderName: 'Spreadsheet',
    folderDecorations: { color: '#0D9E30', icon: 'Grid', icon_color: '#FFFFFF' }
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
    }
  },
  excalidraw: {
    mimes: [EXCALIDRAW_MIME],
    canCreate: isExcalidrawEnabled,
    createPath: folderId => `/excalidraw/create/${folderId}`,
    appIcon: BoardApp,
    appTextIcon: BoardAppText,
    appName: 'Twake Board',
    folderName: 'Board',
    folderDecorations: { color: '#6965DB', icon: 'Pen', icon_color: '#FFFFFF' }
  }
}

export const getFileTypePage = fileType => FILE_TYPE_PAGES[fileType] ?? null

export const getFileTypePath = fileType => `/type/${fileType}`
