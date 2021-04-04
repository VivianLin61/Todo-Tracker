import React from 'react'

import { WButton, WRow, WCol } from 'wt-frontend'

const TableHeader = (props) => {
  const buttonStyle = props.disabled
    ? ' table-header-button-disabled '
    : 'table-header-button '
  const clickDisabled = () => {}
  const handleSortByDescription = () => {
    props.sortItem('description')
  }
  const handleSortByStatus = () => {
    props.sortItem('status')
  }

  const handleSortByDueDate = () => {
    props.sortItem('due_date')
  }

  const handleSortByAssignedTo = () => {
    props.sortItem('assigned_to')
  }

  const handleCloseList = () => {
    props.closeList()
  }
  return (
    <WRow className='table-header'>
      <WCol size='3'>
        <WButton
          onClick={handleSortByDescription}
          className='table-header-section'
          wType='texted'
        >
          Task
        </WButton>
      </WCol>

      <WCol size='2'>
        <WButton
          onClick={handleSortByDueDate}
          className='table-header-section'
          wType='texted'
        >
          Due Date
        </WButton>
      </WCol>

      <WCol size='2'>
        <WButton
          onClick={handleSortByStatus}
          className='table-header-section'
          wType='texted'
        >
          Status
        </WButton>
      </WCol>

      <WCol size='2'>
        <WButton
          className='table-header-section'
          wType='texted'
          onClick={handleSortByAssignedTo}
        >
          Assigned To
        </WButton>
      </WCol>

      <WCol size='3'>
        <div className='table-header-buttons'>
          <WButton
            id={'undo-button'}
            className='sidebar-buttons undo-redo disable-list-item-control'
            onClick={props.undo}
            wType='texted'
            clickAnimation='ripple-light'
            shape='rounded'
          >
            <i className='material-icons'>undo</i>
          </WButton>
          <WButton
            id={'redo-button'}
            className='sidebar-buttons undo-redo disable-list-item-control'
            onClick={props.redo}
            wType='texted'
            clickAnimation='ripple-light'
            shape='rounded'
          >
            <i className='material-icons'>redo</i>
          </WButton>
          <WButton
            onClick={props.disabled ? clickDisabled : props.addItem}
            wType='texted'
            className={`${buttonStyle}`}
          >
            <i className='material-icons'>add_box</i>
          </WButton>
          <WButton
            onClick={props.disabled ? clickDisabled : props.setShowDelete}
            wType='texted'
            className={`${buttonStyle}`}
          >
            <i className='material-icons'>delete_outline</i>
          </WButton>
          <WButton
            onClick={
              props.disabled
                ? clickDisabled
                : () => {
                    handleCloseList()
                  }
            }
            wType='texted'
            className={`${buttonStyle}`}
          >
            <i className='material-icons'>close</i>
          </WButton>
        </div>
      </WCol>
    </WRow>
  )
}

export default TableHeader
