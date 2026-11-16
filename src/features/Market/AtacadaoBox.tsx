import { Box } from '../../components/Box/Box'
import { useAsync } from '../../hooks/useAsync'
import { formatDate } from '../../services/habbo'
import { getMarketListings, getMarketStatus, MARKET_URL, type MarketListing } from '../../services/kihabbo'
import styles from './AtacadaoBox.module.css'

const SHOWN = 3

async function loadMarket(signal: AbortSignal) {
  const status = await getMarketStatus(signal)
  const open = status.enabled && status.tradingOpen
  const listings = open ? await getMarketListings({ page: 1, limit: SHOWN }, signal) : { items: [], total: 0 }
  return { status, open, listings }
}

/** Atacadão = mercado da Kihabbo (/v1/market). Comprar exige login, então o botão leva ao mercado do site. */
export function AtacadaoBox() {
  const { data, error, loading, reload } = useAsync('market', loadMarket)

  return (
    <Box
      id="atacadao"
      variant="dark"
      title="Atacadão"
      accent="green"
      hideNav
      onRefresh={reload}
      minBodyHeight={200}
      footer={
        <a href={MARKET_URL} target="_blank" rel="noopener noreferrer" className={styles.footerBtn}>
          Ver todos
        </a>
      }
    >
      <div className={styles.panel}>
        {error ? (
          <p className={styles.empty}>Não foi possível carregar o mercado.</p>
        ) : loading || !data ? (
          <p className={styles.empty}>Carregando...</p>
        ) : !data.open ? (
          <div className={styles.closed}>
            <span className={styles.closedIcon} aria-hidden="true">
              {/* ícone do mobi "Cadeado da Amizade" (valentines_lovelock) do Habbo */}
              <img src="/assets/ui/cadeado.png" alt="" className="pixel" />
            </span>
            <strong>Mercado fechado</strong>
            <p>{data.status.pauseReason || 'O mercado está fechado no momento.'}</p>
          </div>
        ) : data.listings.items.length ? (
          <ul className={styles.list}>
            {data.listings.items.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Nenhum item à venda no momento.</p>
        )}
      </div>
    </Box>
  )
}

function ListingCard({ item }: { item: MarketListing }) {
  return (
    <li className={styles.card}>
      <span className={styles.image}>
        {item.imageUrl ? <img src={item.imageUrl} alt="" loading="lazy" className="pixel" /> : <img src="/assets/ui/caixa-ajuda.png" alt="" className="pixel" />}
      </span>
      <span className={styles.info}>
        <strong title={item.name}>{item.name}</strong>
        {item.createdAt && <span className={styles.date}>{formatDate(item.createdAt)}</span>}
        {item.price !== null && (
          <span className={styles.price}>
            <span className={styles.coin} aria-hidden="true">
              F
            </span>
            {item.price.toLocaleString('pt-BR')} {item.price === 1 ? 'moeda' : 'moedas'}
            {item.quantity && item.quantity > 1 ? ` · ${item.quantity} un.` : ''}
          </span>
        )}
        <a href={MARKET_URL} target="_blank" rel="noopener noreferrer" className={styles.buy}>
          Comprar
        </a>
      </span>
    </li>
  )
}
