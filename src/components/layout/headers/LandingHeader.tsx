
import logoZarp from '../../../assets/logoZarp.png'
import { ButtonPrimary } from '../../ui/buttons/ButtonPrimary'

export const LandingHeader = () => {
  return (
    <header className='h-20 w-full px-2 flex justify-between items-center fixed top-0 left-0 z-20 md:px-5'>
        <img src={logoZarp} alt="Logo de Zarp" className='h-30 w-20 object-contain md:h-35 md:w-30' />
        <ButtonPrimary className='px-2 duration-300 hover:cursor-pointer hover:scale-105 md:w-35  ' />
    </header>
  )
}

