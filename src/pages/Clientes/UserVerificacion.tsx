import { UsuarioHeader } from '../../components/layout/headers/UsuarioHeader';
import { Footer } from '../../components/layout/Footer';
import { FaRegImage } from "react-icons/fa6";
import { ButtonSecondary } from '../../components/ui/buttons/ButtonSecondary';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { uploadImageCloudinary } from '../../helpers/cloudinary';
import type { VerificacionClienteDTO } from '../../types/entities/verificacionCliente/VerificacionClienteDTO';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const UserVerificiacion = () => {
  const usuario = useSelector((state: any) => state.user);
  const navigate = useNavigate();

  const fotoFrontalRef = useRef<HTMLInputElement>(null);
  const fotodniFrontalRef = useRef<HTMLInputElement>(null);
  const fotodniTraseraRef = useRef<HTMLInputElement>(null);

  const [fotoFrontal, setFotoFrontal] = useState<File | null>(null);
  const [fotoDocumentoFrontal, setFotoDocumentoFrontal] = useState<File | null>(null);
  const [fotoDocumentoTrasero, setFotoDocumentoTrasero] = useState<File | null>(null);

  const [previewFrontal, setPreviewFrontal] = useState<string | null>(null);
  const [previewDniFrontal, setPreviewDniFrontal] = useState<string | null>(null);
  const [previewDniTrasera, setPreviewDniTrasera] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      if (!fotoFrontal || !fotoDocumentoFrontal || !fotoDocumentoTrasero) {
        toast.error("Debes adjuntar las 3 fotos (selfie, DNI frente y DNI dorso).");
        return;
      }

      const folder = `verificaciones/${usuario.id}`;

      const urlSelfie = await uploadImageCloudinary(fotoFrontal, folder, `selfie_${usuario.id}_${Date.now()}`);
      const urlDniFront = await uploadImageCloudinary(fotoDocumentoFrontal, folder, `dni_front_${usuario.id}_${Date.now()}`);
      const urlDniBack = await uploadImageCloudinary(fotoDocumentoTrasero, folder, `dni_back_${usuario.id}_${Date.now()}`);

      const verificacion: VerificacionClienteDTO = {
        fotoFrontal: { urlImagen: urlSelfie },
        fotoDocumentoFrontal: { urlImagen: urlDniFront },
        fotoDocumentoTrasero: { urlImagen: urlDniBack },
        clienteId: usuario.id, // asegurate que sea número, no string
      };

      console.log("Voy a enviar:", verificacion);

      const response = await fetch(`${import.meta.env.VITE_APIBASE}/api/verificacionClientes/save`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${usuario.token}`
        },
        body: JSON.stringify(verificacion)
      });

      if (!response.ok) {
        let msg = "Error al enviar verificación.";
        try {
          const data = await response.json();
          msg = data?.message || msg;
        } catch {
          const text = await response.text();
          if (text) msg = text;
        }
        toast.error(msg);
        return;
      }

      toast.success("Subida de Documentos completada. Aguarda la verificación.");
      setTimeout(() => navigate('/Inicio'), 3000);
    } catch (error: any) {
      toast.error("Error al subir imágenes: " + (error?.message || "Desconocido"));
    }
  };


  return (
    <>
      <UsuarioHeader />
      <div className='min-h-screen w-full pt-20 bg-secondary flex flex-col items-center'>
        <h1 className="text-2xl text-center text-white md:mb-5">Verificar Documentación</h1>

        <section className='flex flex-col mt-5 text-white gap-10'>
          <article className='px-4 py-2 bg-tertiary flex w-4/5 m-auto items-center justify-between rounded-lg h-15 cursor-pointer' onClick={() => fotoFrontalRef.current?.click()}>
            <div className='flex items-center gap-5'>
              <FaRegImage size={30} color='white' />
              <p className='text-md'>Adjuntar foto frontal</p>
            </div>
            {previewFrontal && (
              <img src={previewFrontal} alt="preview" className="w-12 h-12 object-cover rounded" />
            )}
            <input type="file" ref={fotoFrontalRef} accept='image/*' className='hidden'
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setFotoFrontal(file);
                setPreviewFrontal(file ? URL.createObjectURL(file) : null);
              }}
            />
          </article>

          <article className='px-4 py-2 bg-tertiary flex w-4/5 m-auto items-center justify-between rounded-lg h-15 cursor-pointer' onClick={() => fotodniFrontalRef.current?.click()}>
            <div className='flex items-center gap-5'>
              <FaRegImage size={60} color='white' />
              <p className='text-xs'>Adjuntar foto de la parte frontal del Documento</p>
            </div>
            {previewDniFrontal && (
              <img src={previewDniFrontal} alt="preview" className="w-12 h-12 object-cover rounded" />
            )}
            <input type="file" ref={fotodniFrontalRef} accept='image/*' className='hidden'
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setFotoDocumentoFrontal(file);
                setPreviewDniFrontal(file ? URL.createObjectURL(file) : null);
              }}
            />
          </article>

          <article className='px-4 py-2 bg-tertiary flex w-4/5 m-auto items-center justify-between rounded-lg h-15 cursor-pointer' onClick={() => fotodniTraseraRef.current?.click()} >
            <div className='flex items-center gap-5'>
              <FaRegImage size={60} color='white' />
              <p className='text-xs'>Adjuntar foto de la parte trasera del Documento</p>
            </div>
            {previewDniTrasera && (
              <img src={previewDniTrasera} alt="preview" className="w-12 h-12 object-cover rounded" />
            )}
            <input type="file" ref={fotodniTraseraRef} accept='image/*' className='hidden' onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setFotoDocumentoTrasero(file);
              setPreviewDniTrasera(file ? URL.createObjectURL(file) : null);
            }}
            />
          </article>
        </section>

        <p className='w-60 text-justify h-auto text-white mt-5 text-xs'>Las fotos serán analizadas por un profesional y decidirá si coincide la persona del documento con la selfie</p>

        <ButtonSecondary text='Enviar' className='mt-5' fontWeight='font-medium' fontSize='text-md' maxWidth='w-[120px]' onClick={handleSubmit} />
      </div>
      <Footer />
    </>
  );
};

export default UserVerificiacion;
