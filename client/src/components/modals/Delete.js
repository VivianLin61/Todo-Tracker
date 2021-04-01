import React, { useState } from 'react'

import { WModal, WMHeader, WMMain, WButton, WMFooter } from 'wt-frontend'

const Delete = (props) => {
  const handleDelete = async () => {
    props.deleteList(props.activeid)
    props.setShowDelete(false)
  }

  return (
    <div>
      <WModal
        className='delete-modal'
        visible={props.setShowDelete}
        cover={true}
        animation='slide-fade-top'
      >
        <WMHeader
          className='modal-header'
          onClose={() => props.setShowDelete(false)}
        >
          Delete List?
        </WMHeader>
        <WMFooter float='center'>
          <WButton
            className='modal-button cancel-button'
            onClick={() => props.setShowDelete(false)}
            wType='texted'
          >
            Cancel
          </WButton>
          <label className='col-spacer'>&nbsp;</label>
          <WButton
            className='modal-button'
            onClick={handleDelete}
            clickAnimation='ripple-light'
            hoverAnimation='darken'
            shape='rounded'
            color='danger'
          >
            Delete
          </WButton>
        </WMFooter>
      </WModal>
    </div>
  )
}

export default Delete
