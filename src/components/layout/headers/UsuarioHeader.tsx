import { Link } from "react-router-dom"
import logoZarp from '../../../assets/Logo/logoZarp.png'
import { ImUser } from "react-icons/im";
import { ButtonPrimary } from '../../ui/buttons/ButtonPrimary'

export const UsuarioHeader = () => {
    return (
        <>
            <header className='bg-primary h-15 w-full px-2 flex justify-between items-center fixed top-0 left-0 z-20 md:px-5'>
                <Link to={"/"}><img src={logoZarp} alt="Logo de Zarp" className='h-30 w-20 object-contain md:h-35 md:w-30 cursor-pointer' /></Link>

                <div className="flex gap-2 items-center">
                    <ButtonPrimary text="Convertirse en Propietario" maxWidth="max-w-[190px]" className="px-2" />
                    <ImUser color="white" fontSize={25}/>
                </div>
            </header>
        </>
    )
}

