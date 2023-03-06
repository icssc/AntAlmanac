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

  const query = trpc.notifications.find.useQuery('714')

  const mutation = trpc.notifications.insert.useMutation()

  const onSubmit = (formData: notificationsData) => {
    mutation.mutate(formData)
  }

  return (
    <>
      <Box sx={{ maxWidth: 300, mx: 'auto' }}>
        <Typography variant="h4" color="primary">
          Notifications Form
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField {...register('course')} label="Course (year, quarter, sectionCode)" fullWidth margin="dense" />
          <TextField {...register('userId')} label="Phone Number" fullWidth margin="normal" />
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </Box>
      </Box>
      <Box sx={{ whiteSpace: 'pre' }}>{JSON.stringify(query.data, null, 2)}</Box>
    </>
  )
}
