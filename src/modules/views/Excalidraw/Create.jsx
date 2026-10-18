import React from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'

import Dialog, { DialogContent } from 'cozy-ui/transpiled/react/Dialog'
import Spinner from 'cozy-ui/transpiled/react/Spinner'

import Oops from '@/components/Error/Oops'
import { makeExcalidrawFileRoute } from '@/modules/views/Excalidraw/helpers'
import { useCreateFile } from '@/modules/views/Excalidraw/useCreateFile'

const Create = ({ isPublic = false }) => {
  const { folderId, driveId = undefined } = useParams()
  // Where the creation was asked from, to go back there rather than to the
  // folder of the new drawing.
  const [searchParams] = useSearchParams()
  const redirectLink = searchParams.get('redirectLink')
  const { status, fileId } = useCreateFile(folderId, driveId)

  if (status === 'error') {
    return <Oops />
  }

  if (status === 'loaded' && fileId) {
    const url = makeExcalidrawFileRoute(fileId, {
      driveId,
      ...(redirectLink
        ? { fromRedirect: redirectLink }
        : {
            fromPathname: driveId
              ? `/shareddrive/${driveId}/${folderId}`
              : `/folder/${folderId}`
          }),
      fromPublicFolder: isPublic
    })
    return <Navigate to={url} replace />
  }

  return (
    <Dialog open={true} fullScreen transitionDuration={0}>
      <DialogContent className="u-flex u-flex-column u-flex-items-center u-flex-justify-center">
        <Spinner size="xxlarge" middle={true} />
      </DialogContent>
    </Dialog>
  )
}

export default React.memo(Create)
