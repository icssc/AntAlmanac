import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, TextField, Typography } from '@mui/material'
import { notificationsSchema } from '@packages/schemas/notifications'
import type { notificationsData } from '@packages/schemas/notifications'
import trpc from '$lib/trpc'

export default function NotificationsForm() {
  const { register, handleSubmit } = useForm<notificationsData>({
    resolver: zodResolver(notificationsSchema),
  })

  const mutation = trpc.notifications.insert.useMutation()

  const onSubmit = (formData: notificationsData) => {
    mutation.mutate(formData, {
      onSuccess(response) {
        console.log({ response })
      },
    })
  }

  return (
    <>
      <Box sx={{ maxWidth: 300, mx: 'auto' }}>
        <Typography variant="h4" color="primary">Notifications Form</Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField {...register('sectionCode')} label="Section Code" fullWidth margin="dense" />
          <TextField {...register('courseTitle')} label="Course Title" fullWidth margin="normal" />
          <TextField {...register('phoneNumber')} label="Phone Number" fullWidth margin="normal" />
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </Box>
      </Box>
    </>
  )
}
