import { ButtonSecondary } from '../../components/ui/buttons/ButtonSecondary'
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getRoleHome } from '../../helpers/getRoleHome';
import { selectIsAuthenticated, selectUserRol } from "../../reducer/user/userSlice";

const Error = () => {
    const navigate = useNavigate();
    const isAuth = useSelector(selectIsAuthenticated);
    const role = useSelector(selectUserRol);

    const handleGoHome = () => {
        const target = getRoleHome(role, isAuth);
        navigate(target, { replace: true });
    };


    return (
        <div className='bg-secondary flex flex-col items-center justify-center h-screen w-full'>
            <h1 className='text-white text-2xl sm:text-4xl mb-5'>Error 404: Page Not Found</h1>
            <ButtonSecondary onClick={handleGoHome} className='px-10' maxWidth='w-[200px]' text='Volver al Inicio' height='h-[40px]' fontSize='text-md' fontWeight='font-semibold' />
        </div>
    )
}

export default Error