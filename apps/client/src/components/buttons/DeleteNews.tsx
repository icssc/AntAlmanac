import { useCallback } from 'react'
import { Button } from '@mui/material'
import trpc from '$lib/trpc'

export default function DeleteNewsButton() {
  const mutation = trpc.news.deleteAll.useMutation()

  const deleteNews = useCallback(() => {
    mutation.mutate()
  }, [mutation])

  return (
    <Button onClick={deleteNews} variant="contained">
      Delete News
    </Button>
  )
}
