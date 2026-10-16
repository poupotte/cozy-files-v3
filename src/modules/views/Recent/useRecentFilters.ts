import type { UseSharingsFiltersResult } from '@/modules/views/Sharings/useSharingsFilters'
import { useUrlFilters } from '@/modules/views/Sharings/useSharingsFilters'

// Same filters and look as the Sharings view, minus the modification date:
// the Recent list is already about recent activity.
const RECENT_FILTERS: readonly string[] = ['type', 'contact']

export function useRecentFilters(
  supportedFilters: readonly string[] = RECENT_FILTERS
): UseSharingsFiltersResult {
  return useUrlFilters(supportedFilters)
}
