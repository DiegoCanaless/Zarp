
import { LandingHeader } from '../../components/layout/headers/LandingHeader'
import VideoMobile from '../../assets/Videos/videoFondoCelular.mp4'
import VideoDesktop from '../../assets/Videos/videoFondoPC.mp4'
import { ButtonPrimary } from '../../components/ui/buttons/ButtonPrimary'
import { CardPropiedadDestacada } from '../../components/landing/CardPropiedadDestacada'
import imagen1 from '../../assets/Imagenes/PropiedadDestacada1.jpg'
import imagen2 from '../../assets/Imagenes/PropiedadDestacada2.jpg'
import imagen3 from '../../assets/Imagenes/PropiedadDestacada3.jpg'
import testimonio1 from '../../assets/Imagenes/TestimonioPropietario.jpg'
import testimonio2 from '../../assets/Imagenes/TestimonioUsuario.jpg'
import { FaStar } from "react-icons/fa";
import { Footer } from '../../components/layout/Footer'


const Landing = () => {

  let puntuacion = [<FaStar key={1} className="text-yellow-400 md:text-lg" />, <FaStar key={2} className="text-yellow-400 md:text-lg" />, <FaStar key={3} className="text-yellow-400 md:text-lg" />, <FaStar key={4} className="text-yellow-400 md:text-lg" />, <FaStar key={5} className="text-yellow-400 md:text-lg" />]




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


      <main>
        {/* PROPIEDADES DESTACADAS */}
        <section className='flex flex-col items-center justify-center bg-secondary'>
          <h2 className='font-Tertiary text-2xl py-5 text-center text-white'>Propiedades Destacadas</h2>
          <CardPropiedadDestacada titulo='NR Apart San Diego 403 - Casa Presidencial' imagen={imagen1} habitaciones='3 huéspedes 1 dormitorio 2 camas 1 baño' precio='$90.000' noches='2 noches' puntuacion={5} />
          <CardPropiedadDestacada titulo='NR Apart San Diego 403 - Casa Presidencial' imagen={imagen2} habitaciones='3 huéspedes 1 dormitorio 2 camas 1 baño' precio='$90.000' noches='2 noches' puntuacion={4} />
          <CardPropiedadDestacada titulo='NR Apart San Diego 403 - Casa Presidencial' imagen={imagen3} habitaciones='3 huéspedes 1 dormitorio 2 camas 1 baño' precio='$90.000' noches='2 noches' puntuacion={3} />

        </section>

        {/* COMO FUNCIONA */}
        <section className="flex flex-col items-center justify-center bg-secondary py-10">
          <h2 className="font-Tertiary text-2xl py-5 text-center text-white">
            COMO FUNCIONA
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center w-full px-5 text-white text-center gap-8 md:gap-16">
            <div className="flex flex-col items-start text-start">
              <h4 className="text-lg font-medium mb-5 md:mb-10 lg:text-2xl">Huespedes</h4>
              <ul className="text-white text-sm space-y-2 list-disc list-inside md:list-outside sm:text-md lg:text-lg">
                <li>Busca tu destino ideal</li>
                <li>Reserva con tranquilidad</li>
                <li>Vive la experiencia</li>
              </ul>
            </div>

            <div className="hidden md:block h-32 w-px bg-white"></div>
            <div className="block md:hidden w-4/5 h-px bg-white my-4"></div>

            <div className="flex flex-col items-start text-start">
              <h4 className="text-lg font-medium mb-5 md:mb-10 lg:text-2xl">Propietarios</h4>
              <ul className="text-white text-sm space-y-2 list-disc list-inside md:list-outside sm:text-md lg:text-lg">
                <li>Publica tu propiedad en 10 min.</li>
                <li>Controla fechas y precios.</li>
                <li>Recibe pagos seguros.</li>
              </ul>
            </div>
          </div>
        </section>


        {/* TESTIMONIOS */}

        <section className="flex flex-col items-center justify-center bg-secondary py-10 px-5">
          <h2 className="font-Tertiary text-2xl py-5 text-center text-white">Testimonios</h2>

          
          <div className='flex flex-col items-center gap-5 justify-center w-full'>
            {/* Testimonio 1 */}
            <div className="w-full max-w-2xl mx-auto lg:max-w-3xl bg-primary rounded-lg flex flex-col sm:flex-row text-white font-regular px-4 py-4 sm:gap-4 sm:px-0 sm:py-0 shadow-lg">
              {/* Imagen visible solo en pantallas pequeñas y mayores */}
              <div className="sm:block hidden sm:w-1/3 rounded-tl-lg rounded-bl-lg overflow-hidden">
                <img src={testimonio2} alt="Testimonio Mauricio Macri" className="object-cover h-full w-full" />
              </div>

              {/* Contenido */}
              <div className="w-full sm:w-2/3 flex flex-col justify-center sm:py-4 sm:pr-4">
                <h2 className="text-xl font-semibold">Benicio Rueda</h2>
                <h5 className="text-gray-300 mb-3">Propietario</h5>
                <p className="mb-4 text-sm sm:text-base leading-relaxed">
                  "Publicar mi apartamento fue increíblemente sencillo. En menos de 15 minutos estaba activo, y en el primer mes tuve 3 reservas. ¡Los pagos llegaron puntuales y sin complicaciones!"
                </p>
                <div className="flex gap-1 items-center mb-2">
                  {puntuacion.map((star, index) => (
                    <span key={index}>{star}</span>
                  ))}
                </div>
              </div>
            </div>


            {/* Testimonio 2 */}

            <div className="w-full gap-30 max-w-2xl mx-auto lg:max-w-3xl bg-primary rounded-lg flex flex-col sm:flex-row text-white font-regular px-4 py-4 sm:gap-4 sm:px-0 sm:py-0 shadow-lg">
              <div className="w-full sm:w-2/3 flex flex-col justify-center sm:py-4 sm:pl-4">
                <h2 className="text-xl font-semibold">Margarita Soliz</h2>
                <h5 className="text-gray-300 mb-3">Huésped</h5>
                <p className="mb-4 text-sm sm:text-base leading-relaxed">"Alquilé un loft con terraza en el centro. El dueño dejó recomendaciones locales geniales y el check-in fue súper ágil. ¡Sentí que vivía allí, no como un turista más!"</p>
                <div className="flex gap-1 items-center mb-2">
                  {puntuacion.map((star, index) => (
                    <span key={index}>{star}</span>
                  ))}
                </div>
              </div>

              {/* Imagen visible solo en pantallas pequeñas y mayores */}
              <div className="sm:block hidden sm:w-1/3 rounded-tr-lg rounded-br-lg overflow-hidden">
                <img src={testimonio1} alt="Testimonio Mauricio Macri" className="object-cover h-full w-full" />
              </div>
            </div>
          </div>
        </section>
    </main >

    <Footer/>
    </>
  )
}

export default Landing