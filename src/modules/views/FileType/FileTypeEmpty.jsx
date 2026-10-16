import { Icon, Plus } from '@linagora/twake-icons'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useClient } from 'cozy-client'
import Button from 'cozy-ui/transpiled/react/Buttons'
import Empty from 'cozy-ui/transpiled/react/Empty'
import { useI18n } from 'twake-i18n'

import { findFileTypeFolder } from './fileTypeFolder'
import styles from './styles.styl'

import { ROOT_DIR_ID } from '@/constants/config'

// Welcome page shown while the user has no file of the type, on the model of
// the Twake Notes empty list: the Drive link opens the folder of the type
// when it exists.
export const FileTypeEmpty = ({ fileType, page, onCreate, isCreating }) => {
  const { t } = useI18n()
  const client = useClient()
  const [folderId, setFolderId] = useState(ROOT_DIR_ID)

  useEffect(() => {
    let isMounted = true
    const findFolder = async () => {
      try {
        const folder = await findFileTypeFolder(client, fileType)
        if (isMounted && folder) setFolderId(folder._id)
      } catch {
        // Keep the root folder link
      }
    }
    findFolder()
    return () => {
      isMounted = false
    }
  }, [client, fileType])

  return (
    <div className={styles['fileTypeEmpty']}>
      <Empty
        data-testid="file-type-empty"
        icon={page.appIcon}
        title={t('FileTypeView.empty.welcome', { app: page.appName })}
        text={
          <span className="u-mb-half">
            {t(`FileTypeView.empty.after_created.${fileType}`)}
            <Link to={`/folder/${folderId}`}>Twake Drive</Link>.
          </span>
        }
      >
        <Button
          className="u-mt-1"
          startIcon={<Icon icon={Plus} size={12} />}
          label={t(`FileTypeView.empty.create.${fileType}`)}
          busy={isCreating}
          onClick={onCreate}
        />
      </Empty>
    </div>
  )
}
