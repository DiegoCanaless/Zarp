import { Footer } from "../../components/layout/Footer"
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader"


const BandejaChats = () => {
    return (
        <>
            <UsuarioHeader />
            <main className="min-h-screen pt-20 bg-secondary">
                <h1 className="pl-10 text-white text-xl">Mensajes</h1>
            </main>
            <Footer />
        </>
    )
}

export default BandejaChats