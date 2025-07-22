import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";

export const LoginModal = () => {
  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40">
        <div className="w-6/7 m-auto  max-w-md fixed h-6/8  lg:h-6/9 inset-0 flex flex-col pl-4 pr-4 items-start  bg-primary z-50 text-white rounded-lg ">
          <FaTimes className="relative self-end text-gray-400 mt-4 text-lg transition-colors cursor-pointer hover:text-white" />
          <h2 className="font-semibold text-xl">Iniciar Sesion</h2>
          <p className="text-xs">Vamos inicia sesion!</p>

          <form action="" className="flex flex-col mt-4 justify-start w-full gap-3">
            <label>Correo Electronico</label>
            <input type="email" name="" id="" placeholder="malanteo@gmail.com" className="border-b-tertiary border-b-2 outline-0" />

            <label>Contraseña</label>
            <input type="password" name="" id="" placeholder="Contraseña123" className="border-b-tertiary border-b-2 outline-0" />

            <button type="submit" className="h-10 rounded-lg w-3/5 m-auto mt-5 bg-secondary cursor-pointer text-lg transition-colors hover:bg-tertiary">CONTINUAR</button>

            <button type="submit" className="h-10 rounded-lg w-3/5 m-auto bg-white text-black">Sign in with Google</button>
            <p className="text-center text-xs">¿No tenés cuenta? Registrate</p>
          </form>

        </div>
      </div>
    </>
  )
}

