import React from 'react'
import {
  useNavigate,
  useParams,
  useSearchParams,
  Navigate
} from 'react-router-dom'

import Dialog, { DialogContent } from 'cozy-ui/transpiled/react/Dialog'
import Spinner from 'cozy-ui/transpiled/react/Spinner'

import Oops from '@/components/Error/Oops'
import {
  canWriteOfficeDocument,
  makeOnlyOfficeFileRoute
} from '@/modules/views/OnlyOffice/helpers'
import useCreateFile from '@/modules/views/OnlyOffice/useCreateFile'

const Create = ({ isPublic = false }) => {
  const navigate = useNavigate()
  const { folderId, fileClass, driveId = undefined } = useParams()
  // Where the creation was asked from, to go back there rather than to the
  // folder of the new document.
  const [searchParams] = useSearchParams()
  const redirectLink = searchParams.get('redirectLink')
  const { status, fileId } = useCreateFile(
    folderId,
    fileClass,
    driveId,
    searchParams.get('template')
  )
  const folderPath = `/folder/${folderId}`

  if (!canWriteOfficeDocument()) {
    return (
      <Navigate
        to={
          driveId
            ? `/onlyoffice/${driveId}/${folderId}/paywall`
            : `${folderPath}/paywall`
        }
      />
    )
  }

  if (status === 'error') {
    return <Oops />
  }

  if (status === 'loaded' && fileId) {
    const url = makeOnlyOfficeFileRoute(fileId, {
      fromCreate: true,
      ...(redirectLink
        ? { fromRedirect: redirectLink }
        : {
            fromPathname: driveId
              ? `/shareddrive/${driveId}/${folderId}`
              : folderPath
          }),
      fromPublicFolder: isPublic,
      driveId
    })
    return navigate(url, {
      replace: true
    })
  }

  return (
    <Dialog open={true} fullScreen transitionDuration={0}>
      <DialogContent className="u-flex u-flex-column u-flex-items-center u-flex-justify-center">
        <>
          <Spinner
            size="xxlarge"
            middle={true}
            loadingType="onlyOfficeCreateInProgress"
          />
        </>
      </DialogContent>
    </Dialog>
  )
}

export default React.memo(Create)
