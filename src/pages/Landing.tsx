
import { LandingHeader } from '../components/layout/headers/LandingHeader'
import VideoMobile  from '../assets/Videos/videoFondoCelular.mp4'
import VideoDesktop from '../assets/Videos/videoFondoPC.mp4'
import { ButtonPrimary } from '../components/ui/buttons/ButtonPrimary'

const Landing = () => {
  return (
    <>
    {/* HERO */}
      <section className='relative min-h-screen w-full overflow-hidden'>
        <div className='absolute inset-0 bg-transparent z-10 top-40 left-10 md:top-50 md:left-30 md:w-100'>
          <h2 className='text-white text-4xl w-60 md:w-100 md:text-6xl'>Encuentra tu hogar en cada destino</h2>
        </div>

        <div className='absolute inset-0 bg-transparent z-10 top-3/4 mx-auto w-fit'>
          <ButtonPrimary className='px-5 duration-300 hover:cursor-pointer hover:scale-105 md:w-35  ' text='VER MAS' />
        </div>

        <video autoPlay loop muted className='absolute inset-0 w-full h-full object-cover z-0 sm:hidden'>
          <source src={VideoMobile} type='video/mp4' />
        </video>
        <video autoPlay loop muted className='absolute inset-0 w-full h-full object-cover z-0 hidden sm:block'>
          <source src={VideoDesktop} type='video/mp4' />
        </video>
      </section>
      <LandingHeader />

      {/* PROPIEDADES DESTACADAS */}
    </>
  )
}

export default Landing