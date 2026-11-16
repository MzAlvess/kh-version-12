import { Header } from './layout/Header/Header'
import { RadioPanel } from './layout/RadioPanel/RadioPanel'
import { Footer } from './layout/Footer/Footer'
import { Home } from './pages/Home'

// Dados de exemplo — o backend substitui pelos dados reais da sessão / rádio.
const user = { nick: 'DinhuLOL', fichas: 600 }
const radio = {
  locutor: 'Dinho...lol',
  programa: 'Show do Coelho',
  musica: 'Exclusivo.mp3 - Emilia feat. Tropkillaz',
}

export default function App() {
  return (
    <>
      <Header user={user} />
      <RadioPanel {...radio} />
      <Home />
      <Footer />
    </>
  )
}
