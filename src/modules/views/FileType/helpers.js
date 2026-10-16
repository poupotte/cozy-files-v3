import {
  DocApp,
  DocAppText,
  PresentationApp,
  PresentationAppText,
  SpreadsheetApp,
  SpreadsheetAppText
} from '@/components/Icons/FileTypeApps'

// Pages opened by the Home office entrypoints (see manifest.webapp): the
// recent files of one type, with a Create button for that type only.
// - classes: io.cozy.files classes queried for the type
// - createClass: fileClass of the /onlyoffice/create route
// - appIcon, appTextIcon: shown in the bar instead of the Drive ones
// - appName: product name of the empty page welcome
// - folderName: default path of the folder new files are created in
export const FILE_TYPE_PAGES = {
  text: {
    classes: ['text', 'document'],
    createClass: 'text',
    appIcon: DocApp,
    appTextIcon: DocAppText,
    appName: 'Twake Doc',
    folderName: 'Doc'
  },
  sheet: {
    classes: ['spreadsheet', 'sheet'],
    createClass: 'spreadsheet',
    appIcon: SpreadsheetApp,
    appTextIcon: SpreadsheetAppText,
    appName: 'Twake Spreadsheet',
    folderName: 'Spreadsheet'
  },
  slide: {
    classes: ['slide', 'presentation'],
    createClass: 'slide',
    appIcon: PresentationApp,
    appTextIcon: PresentationAppText,
    appName: 'Twake Presentation',
    folderName: 'Presentation'
  }
}

export const getFileTypePage = fileType => FILE_TYPE_PAGES[fileType] ?? null

export const getFileTypePath = fileType => `/type/${fileType}`
