
import logo from '../../assets/Logo/logoZarp.png'

import { FaXTwitter, FaInstagram, FaFacebookF    } from "react-icons/fa6";
export const Footer = () => {
  return (
    <div className="w-full bg-primary text-white  flex justify-between items-center">
        <p className='self-end'>Zarp 2025©</p>
        <img src={logo} alt="Logo Zarp" className='w-20 h-auto' />
        <div className='flex gap-2 pr-2 sm:gap-5'>
            <FaXTwitter className='text-white  text-xl cursor-pointer sm:text-2xl'/>
            <FaFacebookF     className='text-white  text-xl cursor-pointer sm:text-2xl'  />
            <FaInstagram  className='text-white text-xl cursor-pointer sm:text-2xl' />
        </div>
    </div>
  )
}
