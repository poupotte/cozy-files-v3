import React from 'react'

import Tab from 'cozy-ui/transpiled/react/Tab'
import Tabs from 'cozy-ui/transpiled/react/Tabs'
import useBreakpoints from 'cozy-ui/transpiled/react/providers/Breakpoints'
import { useI18n } from 'twake-i18n'

import { ROOT_TAB_APPS, ROOT_TAB_MINE } from './helpers'

const TAB_ITEMS = [
  { value: ROOT_TAB_MINE, labelKey: 'toolbar.root_tab_mine' },
  { value: ROOT_TAB_APPS, labelKey: 'toolbar.root_tab_apps' }
]

/**
 * Segmented control splitting the root between the user's items and the
 * app folders, styled like the Sharings tabs.
 *
 * @param {object} props - Component props
 * @param {string} props.tab - Active ROOT_TAB_* slug
 * @param {(tab: string) => void} props.onChange - Called with the tab slug
 * @param {string} [props.className] - Extra class for the Tabs root
 * @returns {JSX.Element} The rendered component
 */
const RootTabs = ({ tab, onChange, className }) => {
  const { isMobile } = useBreakpoints()
  const { t } = useI18n()

  // MUI emits null when re-clicking the active button of an exclusive
  // group and re-fires onChange for the active Tab.
  const handleChange = (_, value) => {
    if (value !== null && value !== tab) {
      onChange(value)
    }
  }

  const variantProps = isMobile
    ? { narrowed: true, textColor: 'primary', indicatorColor: 'primary' }
    : { segmented: true }

  return (
    <Tabs
      value={tab}
      onChange={handleChange}
      aria-label={t('toolbar.root_tabs')}
      className={className}
      {...variantProps}
    >
      {TAB_ITEMS.map(({ value, labelKey }) => (
        <Tab
          key={value}
          value={value}
          label={t(labelKey)}
          data-testid={`root-tab-${value}`}
        />
      ))}
    </Tabs>
  )
}

export default RootTabs
