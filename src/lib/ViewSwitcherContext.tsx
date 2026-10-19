import React, { useState, useContext, createContext, useEffect } from 'react'

import { useClient, Q } from 'cozy-client'

import logger from './logger'

import { DOCTYPE_FILES_SETTINGS } from '@/lib/doctypes'
import { usePublicContext } from '@/modules/public/PublicProvider'

interface QueryResult {
  data: [
    {
      attributes: Record<string, string | undefined>
    }
  ]
}
// Constants
const DEFAULT_VIEW_TYPE = 'list'
const DEFAULT_SETTING_KEY = 'preferredDriveViewType'

interface ViewSwitcherContextProps {
  viewType: string
  switchView: (viewTypeParam: string) => Promise<void>
}

const ViewSwitcherContext = createContext<ViewSwitcherContextProps>({
  viewType: DEFAULT_VIEW_TYPE,
  switchView: async () => Promise.resolve()
})

interface ViewSwitcherContextProviderProps {
  /** Settings attribute the preference is saved in, one per kind of page. */
  settingKey?: string
  /** View shown until a preference is saved. */
  defaultViewType?: string
}

const ViewSwitcherContextProvider: React.FC<
  ViewSwitcherContextProviderProps
> = ({
  children,
  settingKey = DEFAULT_SETTING_KEY,
  defaultViewType = DEFAULT_VIEW_TYPE
}) => {
  const client = useClient()
  const { isPublic } = usePublicContext()
  const [viewType, setViewType] = useState(defaultViewType)

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (!client || isPublic) return

      try {
        const result = (await client.query(
          Q(DOCTYPE_FILES_SETTINGS)
        )) as QueryResult

        if (!result?.data) return

        const preferred = result?.data?.[0]?.attributes?.[settingKey]

        setViewType(preferred || defaultViewType)
      } catch (error) {
        logger.error('Failed to load settings:', error)
        setViewType(defaultViewType)
      }
    }

    void load()
  }, [client, isPublic, settingKey, defaultViewType])

  const switchView = async (viewTypeParam: string): Promise<void> => {
    setViewType(viewTypeParam)
    if (!client) {
      logger.warn('Client not available')

      return
    }

    if (isPublic) {
      logger.warn('Cannot persist view: in public view')

      return
    }

    try {
      const { data } = (await client.query(
        Q(DOCTYPE_FILES_SETTINGS)
      )) as QueryResult

      if (!data) {
        logger.warn('Settings not found')

        return
      }

      const existing = data[0]

      await client.save({
        ...(existing || { _type: DOCTYPE_FILES_SETTINGS }),
        attributes: {
          ...(existing?.attributes || {}),
          [settingKey]: viewTypeParam
        }
      })
    } catch (error) {
      logger.error('Failed to save view preference:', error)
    }
  }

  return (
    <ViewSwitcherContext.Provider value={{ viewType, switchView }}>
      {children}
    </ViewSwitcherContext.Provider>
  )
}

const useViewSwitcherContext = (): ViewSwitcherContextProps =>
  useContext(ViewSwitcherContext)

export {
  ViewSwitcherContext,
  ViewSwitcherContextProvider,
  useViewSwitcherContext
}
