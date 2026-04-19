import { useSessionStore } from '$stores/SessionStore';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NewUserPage = () => {
    const navigate = useNavigate();
    const setIsNewUser = useSessionStore((state) => state.setIsNewUser);

    useEffect(() => {
        setIsNewUser(true);
        navigate('/', { replace: true });
    }, [navigate, setIsNewUser]);
    return null;
};
export default NewUserPage;
