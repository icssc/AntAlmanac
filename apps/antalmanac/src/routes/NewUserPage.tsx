import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSessionStore } from '$stores/SessionStore';

const NewUserPage = () => {
    const navigate = useNavigate();
    const setIsNewUser = useSessionStore((state) => state.setIsNewUser);

    useEffect(() => {
        setIsNewUser(true);
        navigate('/');
    }, [navigate, setIsNewUser]);
    return null;
};
export default NewUserPage;
