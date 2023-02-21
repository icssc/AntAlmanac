import { useQuery } from '@tanstack/react-query'
import { LOOKUP_NOTIFICATIONS_ENDPOINT } from '$lib/api/endpoints'

interface NotificationItem {
  courseTitle: string
  sectionCode: string
}

interface NotificationAPIResponse {
  smsNotificationList: NotificationItem[]
}

/**
 * query wrapper to get notifications status
 */
export default function useNotificationsQuery() {
  const query = useQuery({
    queryKey: [LOOKUP_NOTIFICATIONS_ENDPOINT],
    enabled: false,
    async queryFn() {
      const storedPhoneNumber = typeof Storage !== 'undefined' ? localStorage.getItem('phoneNumber') : null

      if (!storedPhoneNumber) {
        return {
          phoneNumber: '',
          smsNotificationList: [],
        }
      }

      const response = (await fetch(LOOKUP_NOTIFICATIONS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: storedPhoneNumber.replace(/ /g, '') }),
      }).then((res) => res.json())) as NotificationAPIResponse

      return {
        phoneNumber: storedPhoneNumber,
        smsNotificationList: response.smsNotificationList,
      }
    },
  })
  return query
}
