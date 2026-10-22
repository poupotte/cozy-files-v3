import get from 'lodash/get'

import { SETTINGS_DIR_PATH } from '@/constants/config'

// Folders the stack creates at the root without an app reference.
const APP_DIR_PATHS = ['/Photos', SETTINGS_DIR_PATH]

/**
 * Whether a root folder belongs to an app rather than to the user: apps
 * (Notes, Administrative, the file type pages…) reference their folder.
 * @param {object} file - An io.cozy.files doc
 * @returns {bool}
 */
export const isAppFolder = file => {
  if (file.type !== 'directory') return false
  const references = get(file, 'relationships.referenced_by.data') || []
  return (
    references.some(reference => reference.type === 'io.cozy.apps') ||
    APP_DIR_PATHS.includes(file.path)
  )
}

/**
 * Keeps the root items of a section: the app folders in From apps, everything
 * else in My Drive.
 * @param {array} queryResults - cozy-client query results (folders, files)
 * @param {bool} fromApps - Whether the section is From apps
 * @returns {array} query results with the items of the section only
 */
export const filterRootItems = (queryResults, fromApps) =>
  queryResults.map(result => {
    if (!result?.data) return result
    const data = result.data.filter(file => isAppFolder(file) === fromApps)
    return { ...result, data, count: data.length }
  })
