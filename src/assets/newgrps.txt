import { useInputValidation } from '6pp' // Correct this path
import { Button, Dialog, DialogTitle, Skeleton, Stack, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import Useritem from '../components/shared/Useritem'
import { sampleUsers } from '../constants/sampleData'
import { useDispatch, useSelector } from 'react-redux'
import { useAvailableFriendsQuery, useNewGroupMutation } from '../redux/api/api'
import { useAsyncMutation, useErrors } from '../hooks/hook'
import { setIsNewGroup } from '../redux/reducer/misc'
import toast from 'react-hot-toast'

function NewGroup() {
  const dispatch = useDispatch()
  const { isNewGroup } = useSelector((state) => state.misc);
  const { isError, isLoading, data, error } = useAvailableFriendsQuery()
  console.log('s', data)

  const errors = [
    {
      isError, error
    }
  ]

  useErrors(errors)

  const [selectedMembers, setSelectedMembers] = useState([])
  const [newGroup, newGroupLoading] = useAsyncMutation(useNewGroupMutation)
  const groupName = useInputValidation('')

  const selectMemberHandler = (id) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter((currElem) => currElem !== id) : [...prev, id])
  }

  const submitHandler = () => {
    if (!groupName.value) return toast.error("Group name is required");

    if (selectedMembers.length < 2)
      return toast.error("Please select at least 3 members");

    newGroup("Creating New Group...", {
      name: groupName.value,
      members: selectedMembers,
    });

    closeHandler();
  }

  const closeHandler = () => {
    dispatch(setIsNewGroup(false));
  };

  return (
    <Dialog open={isNewGroup} onClose={closeHandler}>
      <Stack p={{ xs: "1rem", sm: "2rem" }} maxWidth={"25rem"} spacing={'2rem'}>
        <DialogTitle textAlign={'center'} variant='h4'>New Group</DialogTitle>

        <TextField label='Group Name' value={groupName.value} onChange={groupName.changeHandler} />
        <Typography>Members</Typography>

        <Stack>
          {isLoading ? <Skeleton /> :
            data?.friends?.map((user) => (
              <Useritem user={user} key={user._id} handler={selectMemberHandler} isAdded={selectedMembers.includes(user._id)} />
            ))
          }
        </Stack>

        <Stack direction={'row'} justifyContent={'space-between'}>
          <Button variant='text' color='error' onClick={closeHandler} disabled={newGroupLoading}>Cancel</Button>
          <Button variant='contained' onClick={submitHandler} disabled={newGroupLoading}>Create</Button>
        </Stack>
      </Stack>
    </Dialog>
  )
}

export default NewGroup
