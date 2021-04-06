import React from 'react'
import SidebarEntry from './SidebarEntry'

const SidebarList = (props) => {
  console.log(props.todolists)
  return (
    <>
      {props.todolists &&
        props.todolists.map((todo) => (
          <SidebarEntry
            handleSetActive={props.handleSetActive}
            activeid={props.activeid}
            id={todo.id}
            key={todo.id}
            name={todo.name}
            _id={todo._id}
            updateListField={props.updateListField}
            updateList={props.updateList}
          />
        ))}
    </>
  )
}

export default SidebarList
