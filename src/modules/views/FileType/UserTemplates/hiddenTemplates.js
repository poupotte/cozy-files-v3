import { Q } from 'cozy-client'

import { DOCTYPE_FILES_SETTINGS } from '@/lib/doctypes'

// The templates of the pages the user removed, by type, kept in the Drive
// settings as the view of each page: { text: ['report'], excalidraw: [] }.
const SETTING_KEY = 'hiddenFileTypeTemplates'

const fetchSettings = async client => {
  const { data } = await client.query(Q(DOCTYPE_FILES_SETTINGS))
  return data?.[0] ?? null
}

/**
 * Ids of the templates of a page the user removed.
 * @param {object} client - CozyClient
 * @param {string} fileType - Type of the page
 * @returns {Promise<string[]>}
 */
export const fetchHiddenTemplateIds = async (client, fileType) => {
  const settings = await fetchSettings(client)
  return settings?.attributes?.[SETTING_KEY]?.[fileType] ?? []
}

/**
 * Saves the ids of the templates of a page the user removed.
 * @param {object} client - CozyClient
 * @param {string} fileType - Type of the page
 * @param {string[]} templateIds - Removed templates, none to show them all
 */
export const saveHiddenTemplateIds = async (client, fileType, templateIds) => {
  const settings = await fetchSettings(client)
  const attributes = settings?.attributes ?? {}
  await client.save({
    ...(settings ?? { _type: DOCTYPE_FILES_SETTINGS }),
    attributes: {
      ...attributes,
      [SETTING_KEY]: { ...attributes[SETTING_KEY], [fileType]: templateIds }
    }
  })
}
