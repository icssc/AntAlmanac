import { authClient } from '$lib/auth/authClient';

export function useAuth() {
    const { data, isPending, error, refetch } = authClient.useSession();

    return {
        isLoggedIn: !!data,
        isLoading: isPending,
        user: data?.user ?? null,
        session: data?.session ?? null,
        userId: data?.user.id ?? null,
        error,
        refetch,
    };
}

export function getAuthState() {
    const sessionState = authClient.$store.atoms.session.get();

    return {
        isLoggedIn: !!sessionState.data,
        user: sessionState.data?.user ?? null,
        userId: sessionState.data?.user.id ?? null,
        session: sessionState.data?.session ?? null,
        isPending: sessionState.isPending,
    };
}
