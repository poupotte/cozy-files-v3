import { useQuery } from 'cozy-client'

import { useFilteredRecents } from '@/modules/views/Recent/useFilteredRecents'
import { buildRecentByClassQuery } from '@/queries'

/**
 * Recent files of a file type page, filtered like the Recent view: the type
 * classifier of the Type filter is applied on top of the class query so both
 * views agree on what a document, spreadsheet or presentation is.
 */
export const useFileTypeFiles = ({ fileType, page, filters }) => {
  const query = buildRecentByClassQuery(page.classes)
  const result = useQuery(query.definition, query.options)

  return {
    result,
    ...useFilteredRecents({
      result,
      filters: { ...filters, type: fileType }
    })
  }
}
