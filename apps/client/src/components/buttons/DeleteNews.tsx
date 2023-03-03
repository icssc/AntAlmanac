import { Button } from '@mui/material'
import trpc from '$lib/trpc'

export default function DeleteNewsButton() {
  const mutation = trpc.news.deleteAll.useMutation()

  const deleteNews = () => {
    mutation.mutate()
  }

  return (
    <Button onClick={deleteNews} variant="contained">
      Delete News
    </Button>
  )
}
