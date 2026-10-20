import { Q } from 'cozy-client'
import {
  splitFilename,
  uploadFileWithConflictStrategy
} from 'cozy-client/dist/models/file'

import { getBoardTemplate, makeTemplateElements } from '../Board/boardTemplates'
import { applyOfficeTemplate } from '../Office/officeTemplates'
import { ensureFileTypeFolder } from '../fileTypeFolder'

import { TRASH_DIR_PATH } from '@/constants/config'
import logger from '@/lib/logger'
import {
  EXCALIDRAW_EXTENSION,
  EXCALIDRAW_MIME,
  makeEmptyScene
} from '@/modules/views/Excalidraw/helpers'
import { restoreExcalidrawMime } from '@/modules/views/Excalidraw/restoreExcalidrawMime'
import {
  makeExtByClass,
  makeMimeByClass
} from '@/modules/views/OnlyOffice/helpers'

// Files saved as templates by the user, as the Google Docs "Submit template"
// of the template gallery: a copy of the file, in a Templates folder of the
// type folder, referenced so that it is found wherever the user moves it.

export const getUserTemplateReference = fileType => ({
  _type: 'io.cozy.apps',
  _id: `io.cozy.apps/drive/${fileType}/template`
})

// A template of the page the user edited is a template the user saved that
// takes its place, found by a second reference naming it.
const getReplacedTemplateReference = (fileType, templateId) => ({
  _type: 'io.cozy.apps',
  _id: `${getUserTemplateReference(fileType)._id}/${templateId}`
})

const getReferences = file =>
  file.referenced_by ?? file.relationships?.referenced_by?.data ?? []

/**
 * Id of the template of the page a template the user saved takes the place
 * of, or null when it is a template of their own.
 * @param {object} file - A template the user saved
 * @param {string} fileType - Type of the page
 * @returns {string|null}
 */
export const getReplacedTemplateId = (file, fileType) => {
  const prefix = `${getUserTemplateReference(fileType)._id}/`
  const reference = getReferences(file).find(
    ({ type, id }) => type === 'io.cozy.apps' && id?.startsWith(prefix)
  )
  return reference ? reference.id.slice(prefix.length) : null
}

const getTemplateReferences = (file, fileType) => {
  const templateId = getReplacedTemplateId(file, fileType)
  return [
    getUserTemplateReference(fileType),
    ...(templateId ? [getReplacedTemplateReference(fileType, templateId)] : [])
  ]
}

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
const copyFreely = async (client, fileId, name, dirId) => {
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

// A board copy gets back the type a renamed board lost, keeping the
// references of the copy.
const copyWithFreeName = async (client, fileId, name, dirId) => {
  const copy = await copyFreely(client, fileId, name, dirId)
  try {
    return { ...copy, ...(await restoreExcalidrawMime(client, copy)) }
  } catch (error) {
    logger.warn('Could not restore the type of the board copy', error)
    return copy
  }
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

// OnlyOffice class of the blank file of an Office page.
const OFFICE_CLASS_BY_FILE_TYPE = {
  text: 'text',
  sheet: 'spreadsheet',
  slide: 'slide'
}

// Content of an empty file of the type, the blank OnlyOffice file or an
// empty scene for a board, or of a template of the page.
const makeTemplateFile = async (client, fileType, templateId, t) => {
  const fileClass = OFFICE_CLASS_BY_FILE_TYPE[fileType]
  if (!fileClass) {
    const scene = makeEmptyScene(client.getStackClient().uri)
    const template = getBoardTemplate(templateId)
    if (template) scene.elements = await makeTemplateElements(template, t)
    return {
      content: JSON.stringify(scene),
      extension: EXCALIDRAW_EXTENSION,
      contentType: EXCALIDRAW_MIME
    }
  }
  const extension = makeExtByClass(fileClass)
  const response = await fetch(`/onlyOffice/${fileClass}.${extension}`)
  if (!response.ok) throw new Error(`No blank ${fileClass} file`)
  const blank = await response.arrayBuffer()
  return {
    content: templateId
      ? applyOfficeTemplate(blank, fileType, templateId, t)
      : blank,
    extension,
    contentType: makeMimeByClass(fileClass)
  }
}

// Name of a template of the page, as its tile shows it.
const getTemplateName = (fileType, templateId, t) =>
  OFFICE_CLASS_BY_FILE_TYPE[fileType]
    ? t(`OfficeHome.templates.${templateId}.name`)
    : t(`BoardHome.templates.${templateId}.name`)

/**
 * Creates a template of a type, to be filled in its editor: an empty one, as
 * the "New template" of the Google Docs template gallery, or a copy of a
 * template of the page, which then takes its place.
 * @param {object} options - Options
 * @param {string} [options.templateId] - Template of the page to copy
 * @returns {Promise<object>} The template
 */
export const createUserTemplate = async ({
  client,
  fileType,
  page,
  t,
  templateId = null
}) => {
  const folder = await ensureUserTemplatesFolder(client, fileType, page, t)
  const { content, extension, contentType } = await makeTemplateFile(
    client,
    fileType,
    templateId,
    t
  )
  const name = templateId
    ? getTemplateName(fileType, templateId, t)
    : t('UserTemplates.new_name')
  const { data } = await uploadFileWithConflictStrategy(client, content, {
    name: `${name}.${extension}`,
    dirId: folder._id,
    conflictStrategy: 'rename',
    contentType
  })
  const template = { ...data, _id: data._id ?? data.id, _type: 'io.cozy.files' }
  await client
    .collection('io.cozy.files')
    .addReferencedBy(template, [
      getUserTemplateReference(fileType),
      ...(templateId
        ? [getReplacedTemplateReference(fileType, templateId)]
        : [])
    ])
  return template
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
      .removeReferencedBy(file, getTemplateReferences(file, fileType))
  }
  return file
}
