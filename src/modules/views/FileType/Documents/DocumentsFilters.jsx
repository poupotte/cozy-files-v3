import React from 'react'

import { useI18n } from 'twake-i18n'

import { DOCUMENT_FILTERS } from './documentKinds'
import styles from './documents.styl'

/**
 * Filters of the recent documents, as the tabs of the Mail.ru Documents:
 * all of them, then each kind of document.
 *
 * @param {object} props - Component props
 * @param {string} props.value - Selected filter, one of DOCUMENT_FILTERS
 * @param {Function} props.onChange - Selects a filter
 */
export const DocumentsFilters = ({ value, onChange }) => {
  const { t } = useI18n()

  return (
    <div
      role="group"
      aria-label={t('DocumentsHome.filters')}
      className={styles['documentsFilters']}
    >
      {DOCUMENT_FILTERS.map(filter => (
        <button
          key={filter}
          type="button"
          aria-pressed={value === filter}
          className={styles['documentsFilters-chip']}
          onClick={() => onChange(filter)}
          data-testid={`documents-filter-${filter}`}
        >
          {t(`DocumentsHome.filter.${filter}`)}
        </button>
      ))}
    </div>
  )
}
