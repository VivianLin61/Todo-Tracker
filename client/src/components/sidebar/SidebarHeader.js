import React from 'react'
import { WButton, WRow, WCol } from 'wt-frontend'

const SidebarHeader = (props) => {
  console.log(props.activeid)
  return (
    <WRow className='sidebar-header'>
      <WCol size='7'>
        <WButton
          wType='texted'
          hoverAnimation='text-primary'
          className='sidebar-header-name'
        >
          Todolists
        </WButton>
      </WCol>

      <WCol size='5'>
        {props.auth && (
          <div className='sidebar-options'>
            <WButton
              className={
                props.activeid
                  ? 'sidebar-buttons disable-add-list'
                  : 'sidebar-buttons'
              }
              onClick={props.createNewList}
              clickAnimation='ripple-light'
              shape='rounded'
              color={props.activeid ? ' ' : 'primary'}
            >
              <i className='material-icons'>add</i>
            </WButton>
          </div>
        )}
      </WCol>
    </WRow>
  )
}

export default SidebarHeader
