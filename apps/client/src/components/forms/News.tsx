import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, TextField } from '@mui/material'
import { newsSchema } from '@packages/schemas/news'
import type { newsData } from '@packages/schemas/news'
import trpc from '$lib/trpc'

export default function NewsForm() {
  const [data, setData] = useState<newsData>()

  const { register, handleSubmit } = useForm<newsData>({
    resolver: zodResolver(newsSchema),
  })

  const mutation = trpc.news.insert.useMutation()

  const onSubmit = (newsData: newsData) => {
    mutation.mutate(newsData, {
      onSuccess(newData) {
        if (newData) {
          setData(newData)
        }
      },
    })
  }

  return (
    <>
      <Box sx={{ maxWidth: 300, mx: 'auto' }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField {...register('title')} label="title" fullWidth margin="dense" />
          <TextField {...register('body')} label="body" fullWidth margin="normal" />
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </Box>
      </Box>
      <Box component="pre">{data && JSON.stringify(data, null, 2)}</Box>
    </>
  )
}
