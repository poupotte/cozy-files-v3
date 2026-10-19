import { Q } from 'cozy-client'
import { splitFilename } from 'cozy-client/dist/models/file'

import { ensureFileTypeFolder } from '../fileTypeFolder'

import { TRASH_DIR_PATH } from '@/constants/config'

// Files saved as templates by the user, as the Google Docs "Submit template"
// of the template gallery: a copy of the file, in a Templates folder of the
// type folder, referenced so that it is found wherever the user moves it.

export const getUserTemplateReference = fileType => ({
  _type: 'io.cozy.apps',
  _id: `io.cozy.apps/drive/${fileType}/template`
})

const getReferences = file =>
  file.referenced_by ?? file.relationships?.referenced_by?.data ?? []

/**
 * Whether a file is a template the user saved, so that it is offered in the
 * Create block rather than listed with the other files.
 * @param {object} file - An io.cozy.files doc
 * @param {string} fileType - Type of the page
 * @returns {boolean}
 */
export const isUserTemplate = (file, fileType) => {
  const { _id } = getUserTemplateReference(fileType)
  return getReferences(file).some(
    reference => reference.type === 'io.cozy.apps' && reference.id === _id
  )
}

const isInTrash = file =>
  Boolean(file.path?.startsWith(`${TRASH_DIR_PATH}/`)) || file.trashed

/**
 * Templates the user saved for a type, the latest first.
 * @param {object} client - CozyClient
 * @param {string} fileType - Type of the page
 * @returns {Promise<object[]>}
 */
export const fetchUserTemplates = async (client, fileType) => {
  const { included = [] } = await client.query(
    Q('io.cozy.files').referencedBy(getUserTemplateReference(fileType))
  )
  return included
    .map(file => ({ ...file, ...file.attributes, _id: file._id ?? file.id }))
    .filter(file => file.type === 'file' && !isInTrash(file))
    .sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''))
}

const isConflict = error => error?.status === 409 || /409/.test(error?.message)

// Copies a file, adding (2), (3)… to its name while the folder already has
// one of that name.
const copyWithFreeName = async (client, fileId, name, dirId) => {
  const { filename, extension } = splitFilename({ name, type: 'file' })
  for (let index = 1; index <= 20; index++) {
    const candidate = index === 1 ? name : `${filename} (${index})${extension}`
    try {
      const { data } = await client
        .collection('io.cozy.files')
        .copy(fileId, candidate, dirId)
      return data
    } catch (error) {
      if (!isConflict(error)) throw error
    }
  }
  throw new Error('No free name to copy the file')
}

const ensureUserTemplatesFolder = async (client, fileType, page, t) => {
  const typeFolder = await ensureFileTypeFolder(client, fileType, page)
  const path = `${typeFolder.path}/${t('UserTemplates.folder')}`
  const collection = client.collection('io.cozy.files')
  try {
    const { data } = await collection.statByPath(path)
    return data
  } catch {
    const { data } = await collection.createDirectoryByPath(path)
    return data
  }
}

/**
 * Saves a copy of a file as a template of its type.
 * @returns {Promise<object>} The template
 */
export const saveAsUserTemplate = async ({
  client,
  file,
  fileType,
  page,
  t
}) => {
  const folder = await ensureUserTemplatesFolder(client, fileType, page, t)
  const template = await copyWithFreeName(
    client,
    file._id,
    file.name,
    folder._id
  )
  await client
    .collection('io.cozy.files')
    .addReferencedBy(template, [getUserTemplateReference(fileType)])
  return template
}

/**
 * Creates a file of the type from a template the user saved: a copy of it in
 * the type folder, which is not a template.
 * @returns {Promise<object>} The new file
 */
export const createFromUserTemplate = async ({
  client,
  template,
  fileType,
  page
}) => {
  const folder = await ensureFileTypeFolder(client, fileType, page)
  const file = await copyWithFreeName(
    client,
    template._id,
    template.name,
    folder._id
  )
  // The copy keeps the references of the template.
  if (isUserTemplate(file, fileType)) {
    await client
      .collection('io.cozy.files')
      .removeReferencedBy(file, [getUserTemplateReference(fileType)])
  }
  return file
}
