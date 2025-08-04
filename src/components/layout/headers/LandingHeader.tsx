
import { Link } from 'react-router'
import logoZarp from '../../../assets/Logo/logoZarp.png'
import { ButtonPrimary } from '../../ui/buttons/ButtonPrimary'
import { useState } from 'react'
import { LoginModal } from '../../auth/LoginModal'


export const LandingHeader = () => {

  const [modalAbierto, setModalAbierto] = useState<boolean>(false);

  function abrirModal() {
    setModalAbierto(true)
  }

  function cerrarModal() {
    setModalAbierto(false);
  }

  return (
    <header className='h-20 w-full px-2 flex justify-between items-center fixed top-0 left-0 z-20 md:px-5 '>
        <Link to={"/"}><img src={logoZarp} alt="Logo de Zarp" className='h-30 w-20 object-contain md:h-35 md:w-30 cursor-pointer' /></Link>
        <ButtonPrimary className='px-2 duration-300 hover:cursor-pointer hover:scale-105 md:w-35' onClick={abrirModal} />

        {modalAbierto && (
          <LoginModal onClose={cerrarModal}/>
        )}
    </header>
  )
}

