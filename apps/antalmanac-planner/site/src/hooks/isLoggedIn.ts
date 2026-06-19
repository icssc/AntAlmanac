import { useAppSelector } from '../store/hooks';

export function useIsLoggedIn() {
  return useAppSelector((state) => !!state.user.user);
}
