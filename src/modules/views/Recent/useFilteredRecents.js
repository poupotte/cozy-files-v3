import { useMemo } from 'react'

import { useSharingContext } from 'cozy-sharing'

import { isSharingsEntryMatchingFilters } from '@/modules/views/Sharings/matchSharingsFilters'
import { getContactFilterDataByEntryTab } from '@/modules/views/Sharings/sharingContactFilter'
import { getSharingsTabForEntry } from '@/modules/views/Sharings/useFilteredSharings'

const NO_RECIPIENTS = () => []
const ALWAYS_OWNER = () => true

const getDocId = item => item._id ?? item.id

/**
 * Applies the Sharings view file type and contact filters to the Recent list.
 *
 * Each recent entry is classified like in the Sharings view (shared with me,
 * shared by me, team drive), so the contact filter offers the same people for
 * a given document in both views. Entries that are not shared have no contact.
 */
export const useFilteredRecents = ({ result, filters }) => {
  const {
    getRecipients = NO_RECIPIENTS,
    isOwner = ALWAYS_OWNER,
    allLoaded
  } = useSharingContext()

  return useMemo(() => {
    const entries = (result?.data ?? []).map(entry =>
      entry._id ? entry : { ...entry, _id: getDocId(entry) }
    )
    const contactFilterData = getContactFilterDataByEntryTab(
      entries,
      entry => getSharingsTabForEntry(entry, isOwner),
      getRecipients
    )
    const hasActiveFilters = Object.values(filters).some(v => v !== null)
    if (!hasActiveFilters) {
      return {
        contactFilterOptions: contactFilterData.options,
        filteredResult: result
      }
    }

    const data = (result?.data ?? []).filter((entry, index) =>
      isSharingsEntryMatchingFilters(entry, filters, {
        contactValues: contactFilterData.contactValuesByEntryId.get(
          entries[index]._id
        )
      })
    )
    return {
      contactFilterOptions: contactFilterData.options,
      filteredResult: { ...result, data, count: data.length }
    }
    // allLoaded: recipients become available once sharings are loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, filters, getRecipients, isOwner, allLoaded])
}
