import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { PETERPORTAL_WEBSOC_ENDPOINT, WEBSOC_ENDPOINT } from '$lib/api/endpoints'
import type { WebsocResponse } from '$types/peterportal'

type WebsocQueryOptions = UseQueryOptions<WebsocResponse, any, WebsocResponse, any>

export default function useWebsocQuery(params: Record<string, string>, options?: WebsocQueryOptions) {
  const query = useQuery([PETERPORTAL_WEBSOC_ENDPOINT, ...Object.keys(params), ...Object.values(params)], {
    ...options,
    async queryFn() {
      const urlParams = new URLSearchParams(params)
      const url = `${PETERPORTAL_WEBSOC_ENDPOINT}?${urlParams.toString()}`
      try {
        const response = (await fetch(url).then((r) => r.json())) as WebsocResponse
        return response
      } catch {
        const backupResponse = (await fetch(WEBSOC_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        }).then((res) => res.json())) as WebsocResponse
        return backupResponse
      }
    },
  })
  return query
}
