import { Footer } from "../../components/layout/Footer"
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader"


const Chat = () => {
    return (
        <>
            <UsuarioHeader />
            <main className="min-h-screen pt-20 bg-secondary">
                <h1 className="pl-10 text-white text-xl">Mensajes</h1>
                <div className="w-full bg-primary flex">
                    <img src="" alt="" />
                </div>
            </main>
            <Footer />
        </>

    )
}

export default Chat