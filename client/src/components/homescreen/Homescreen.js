import React, { useState, useEffect } from 'react'
import Logo from '../navbar/Logo'
import NavbarOptions from '../navbar/NavbarOptions'
import MainContents from '../main/MainContents'
import SidebarContents from '../sidebar/SidebarContents'
import Login from '../modals/Login'
import Delete from '../modals/Delete'
import CreateAccount from '../modals/CreateAccount'
import { GET_DB_TODOS } from '../../cache/queries'
import * as mutations from '../../cache/mutations'
import { useMutation, useQuery } from '@apollo/client'
import { WNavbar, WSidebar, WNavItem } from 'wt-frontend'
import { WLayout, WLHeader, WLMain, WLSide } from 'wt-frontend'
import {
  UpdateListField_Transaction,
  UpdateListItems_Transaction,
  ReorderItems_Transaction,
  SortItems_Transaction,
  EditItem_Transaction,
} from '../../utils/jsTPS'
import WInput from 'wt-frontend/build/components/winput/WInput'
import { NetworkStatus } from '@apollo/client'

const Homescreen = (props) => {
  let todolists = []
  const [updateList, toggleUpdateList] = useState(false)
  const [activeList, setActiveList] = useState({})
  const [showDelete, toggleShowDelete] = useState(false)
  const [showLogin, toggleShowLogin] = useState(false)
  const [showCreate, toggleShowCreate] = useState(false)

  const [ReorderTodoItems] = useMutation(mutations.REORDER_ITEMS)
  const [UpdateTodoItemField] = useMutation(mutations.UPDATE_ITEM_FIELD)
  const [UpdateTodolistField] = useMutation(mutations.UPDATE_TODOLIST_FIELD)
  const [DeleteTodolist] = useMutation(mutations.DELETE_TODOLIST)
  const [DeleteTodoItem] = useMutation(mutations.DELETE_ITEM)
  const [AddTodolist] = useMutation(mutations.ADD_TODOLIST)
  const [AddTodoItem] = useMutation(mutations.ADD_ITEM)
  const [SortTodoItems] = useMutation(mutations.SORT_ITEMS)
  const [SetActiveToTop] = useMutation(mutations.SET_TO_TOP)

  const { loading, error, data, refetch } = useQuery(GET_DB_TODOS)
  if (loading) {
    console.log(loading, 'loading')
  }
  if (error) {
    console.log(error, 'error')
  }
  if (data) {
    todolists = data.getAllTodos
  }

  const auth = props.user === null ? false : true

  useEffect(() => {
    document.addEventListener('keyup', keyboardUndoRedo, false)
    return () => {
      document.removeEventListener('keyup', keyboardUndoRedo, false)
    }
  })

  const keyboardUndoRedo = (e) => {
    if (e.ctrlKey && e.key === 'z') {
      tpsUndo()
    } else if (e.ctrlKey && e.key === 'y') {
      tpsRedo()
    }
  }
  const refetchTodos = async (refetch) => {
    const { loading, error, data } = await refetch()
    if (data) {
      todolists = data.getAllTodos
      if (activeList._id) {
        let tempID = activeList._id
        let list = todolists.find((list) => list._id === tempID)
        setActiveList(list)
      }
    }
  }

  const tpsUndo = async () => {
    const retVal = await props.tps.undoTransaction()
    refetchTodos(refetch)
    if (props.tps.getUndoSize() === 0) {
      document
        .getElementById('undo-button')
        .classList.add('disable-list-item-control')
    }
    enableRedo()
    return retVal
  }

  const tpsRedo = async () => {
    const retVal = await props.tps.doTransaction()
    refetchTodos(refetch)
    if (props.tps.getRedoSize() === 0) {
      document
        .getElementById('redo-button')
        .classList.add('disable-list-item-control')
    }
    enableUndo()
    return retVal
  }

  // Creates a default item and passes it to the backend resolver.
  // The return id is assigned to the item, and the item is appended
  //  to the local cache copy of the active todolist.
  const addItem = async () => {
    let list = activeList
    const items = list.items
    const lastID = items.length >= 1 ? items[items.length - 1].id + 1 : 0
    const newItem = {
      _id: '',
      id: lastID,
      description: 'No Description',
      due_date: 'No Date',
      // assigned_to: props.user._id,
      assigned_to: 'Not Assigned To',
      completed: false,
    }
    let opcode = 1
    let itemID = newItem._id
    let listID = activeList._id
    let transaction = new UpdateListItems_Transaction(
      listID,
      itemID,
      newItem,
      opcode,
      AddTodoItem,
      DeleteTodoItem
    )
    props.tps.addTransaction(transaction)
    tpsRedo()
    enableUndo()
  }

  const deleteItem = async (item, index) => {
    let listID = activeList._id
    let itemID = item._id
    let opcode = 0
    let itemToDelete = {
      _id: item._id,
      id: item.id,
      description: item.description,
      due_date: item.due_date,
      assigned_to: item.assigned_to,
      completed: item.completed,
    }
    let transaction = new UpdateListItems_Transaction(
      listID,
      itemID,
      itemToDelete,
      opcode,
      AddTodoItem,
      DeleteTodoItem,
      index
    )
    props.tps.addTransaction(transaction)
    tpsRedo()
    enableUndo()
  }

  const editItem = async (itemID, field, value, prev) => {
    let flag = 0
    if (field === 'completed') flag = 1
    let listID = activeList._id
    let transaction = new EditItem_Transaction(
      listID,
      itemID,
      field,
      prev,
      value,
      flag,
      UpdateTodoItemField
    )
    props.tps.addTransaction(transaction)
    tpsRedo()
    enableUndo()
  }

  const reorderItem = async (itemID, dir) => {
    let listID = activeList._id
    let transaction = new ReorderItems_Transaction(
      listID,
      itemID,
      dir,
      ReorderTodoItems
    )
    props.tps.addTransaction(transaction)
    tpsRedo()
    enableUndo()
  }

  const sortItem = async (field) => {
    let listID = activeList._id
    let transaction = new SortItems_Transaction(listID, field, SortTodoItems)
    props.tps.addTransaction(transaction)
    tpsRedo()
    enableUndo()
  }

  const createNewList = async () => {
    const length = todolists.length
    const id =
      length >= 1
        ? todolists[length - 1].id + Math.floor(Math.random() * 100 + 1)
        : 1
    let list = {
      _id: '',
      id: id,
      name: 'Untitled',
      owner: props.user._id,
      items: [],
      active: false,
    }
    const { data } = await AddTodolist({
      variables: { todolist: list },
      refetchQueries: [{ query: GET_DB_TODOS }],
    })
    await refetchTodos(refetch)
    if (data) {
      let _id = data.addTodolist
      handleSetActive(_id)
    }
    props.tps.clearAllTransactions()
    document
      .getElementById('undo-button')
      .classList.add('disable-list-item-control')
    document
      .getElementById('redo-button')
      .classList.add('disable-list-item-control')
  }

  const deleteList = async (_id) => {
    DeleteTodolist({
      variables: { _id: _id },
      refetchQueries: [{ query: GET_DB_TODOS }],
    })
    refetch()
    setActiveList({})
  }

  const updateListField = async (_id, field, value, prev) => {
    let transaction = new UpdateListField_Transaction(
      _id,
      field,
      prev,
      value,
      UpdateTodolistField
    )
    props.tps.addTransaction(transaction)
    tpsRedo()
    enableUndo()
  }

  const updateTopList = async (_id) => {
    // const todo = todolists.find((todo) => todo.id === id || todo._id === id)
    await SetActiveToTop({
      variables: { _id: _id, owner: props.user._id },
      refetchQueries: [{ query: GET_DB_TODOS }],
    })
  }

  const handleSetActive = (id) => {
    const todo = todolists.find((todo) => todo.id === id || todo._id === id)
    updateTopList(todo._id)
    setActiveList(todo)
    props.tps.clearAllTransactions()
    document
      .getElementById('undo-button')
      .classList.add('disable-list-item-control')
    document
      .getElementById('redo-button')
      .classList.add('disable-list-item-control')
  }

  const closeList = () => {
    props.tps.clearAllTransactions()
    document
      .getElementById('undo-button')
      .classList.add('disable-list-item-control')
    document
      .getElementById('redo-button')
      .classList.add('disable-list-item-control')
    setActiveList({})
  }
  /*
		Since we only have 3 modals, this sort of hardcoding isnt an issue, if there
		were more it would probably make sense to make a general modal component, and
		a modal manager that handles which to show.
	*/
  const setShowLogin = () => {
    toggleShowDelete(false)
    toggleShowCreate(false)
    toggleShowLogin(!showLogin)
  }

  const setShowCreate = () => {
    toggleShowDelete(false)
    toggleShowLogin(false)
    toggleShowCreate(!showCreate)
  }

  const setShowDelete = () => {
    toggleShowCreate(false)
    toggleShowLogin(false)
    toggleShowDelete(!showDelete)
  }

  const enableUndo = () => {
    document
      .getElementById('undo-button')
      .classList.remove('disable-list-item-control')
  }

  const enableRedo = () => {
    document
      .getElementById('redo-button')
      .classList.remove('disable-list-item-control')
  }

  return (
    <WLayout wLayout='header-lside'>
      <WLHeader>
        <WNavbar color='colored'>
          <ul>
            <WNavItem>
              <Logo className='logo' />
            </WNavItem>
          </ul>
          <ul>
            <NavbarOptions
              fetchUser={props.fetchUser}
              auth={auth}
              setShowCreate={setShowCreate}
              setShowLogin={setShowLogin}
              refetchTodos={refetch}
              setActiveList={setActiveList}
            />
          </ul>
        </WNavbar>
      </WLHeader>

      <WLSide side='left'>
        <WSidebar>
          {activeList ? (
            <SidebarContents
              todolists={todolists}
              activeid={activeList.id}
              auth={auth}
              handleSetActive={handleSetActive}
              createNewList={createNewList}
              undo={tpsUndo}
              redo={tpsRedo}
              updateListField={updateListField}
              updateList={updateList}
            />
          ) : (
            <></>
          )}
        </WSidebar>
      </WLSide>
      <WLMain>
        {activeList ? (
          <div className='container-secondary'>
            <MainContents
              addItem={addItem}
              deleteItem={deleteItem}
              editItem={editItem}
              reorderItem={reorderItem}
              sortItem={sortItem}
              setShowDelete={setShowDelete}
              activeList={activeList}
              undo={tpsUndo}
              redo={tpsRedo}
              setActiveList={setActiveList}
              closeList={closeList}
            />
          </div>
        ) : (
          <div className='container-secondary' />
        )}
      </WLMain>

      {showDelete && (
        <Delete
          deleteList={deleteList}
          activeid={activeList._id}
          setShowDelete={setShowDelete}
        />
      )}

      {showCreate && (
        <CreateAccount
          fetchUser={props.fetchUser}
          setShowCreate={setShowCreate}
        />
      )}

      {showLogin && (
        <Login
          fetchUser={props.fetchUser}
          refetchTodos={refetch}
          setShowLogin={setShowLogin}
        />
      )}
    </WLayout>
  )
}

export default Homescreen
