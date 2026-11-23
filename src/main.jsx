import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Crown, Gem, Globe2, Hammer, HeartHandshake, Menu, Minus, PackageCheck, Plus, Shield, ShoppingBag, ShoppingCart, Swords, Truck, UserRound, UsersRound, X, Zap } from 'lucide-react'
import './style.css'

const IP = 'craftsolar.redstone.tr:25567'
const DISCORD = 'https://discord.gg/X86xYYw73N'
const ADMIN_ROUTE = 'cs-yonetim-7f3c9a2e-archive'
const DELIVERY = 'Satın alınan tüm eşyalar ve rütbeler oyun içi yetkililer tarafından kontrol edilip teslim edilir.'
const products = [
  { id: 'vip', name: 'VIP', price: 10, category: 'Rütbeler', label: 'İlk adım', description: 'CraftSolar dünyasında yerini alırken sana eşlik edecek özel rütbe.', icon: Crown, tone: 'copper' },
  { id: 'solar', name: 'SOLAR', price: 15, category: 'Rütbeler', label: 'Güneşin gücü', description: 'SOLAR rütbesiyle kasabanın hikâyesine kendi rengini kat.', icon: Zap, tone: 'gold' },
  { id: 'solar-plus', name: 'SOLAR+', price: 20, category: 'Rütbeler', label: 'Üst rütbe', description: 'CraftSolar rütbe koleksiyonunun en parlak üyesi.', icon: Gem, tone: 'cream' },
  { id: 'spider', name: 'Örümcek Kılıç', price: 35, category: 'Silahlar', label: 'Özel eşya', description: 'Örümcek temasından ilham alan, envanterine özel kılıç.', icon: Swords, tone: 'violet' },
  { id: 'weakness', name: 'Zayıflık Kılıç', price: 40, category: 'Silahlar', label: 'Özel eşya', description: 'Zayıflık temalı, savaş koleksiyonuna özel kılıç.', icon: Swords, tone: 'mint' },
  { id: 'lightning', name: 'Şimşek Kılıç', price: 45, category: 'Silahlar', label: 'Özel eşya', description: 'Şimşek temalı görünümüyle koleksiyondaki yerini alır.', icon: Zap, tone: 'blue' },
  { id: 'prot5', name: 'Koruma 5 Netherite Set', price: 50, category: 'Setler', label: 'Zırh seti', description: 'Koruma V büyülü tam netherite zırh seti.', icon: Shield, tone: 'purple' },
  { id: 'prot6', name: 'Koruma 6 Netherite Set', price: 55, category: 'Setler', label: 'Zırh seti', description: 'Koruma VI büyülü tam netherite zırh seti.', icon: Shield, tone: 'amber' }
]

const featureItems = [
  { title: 'Gerçek Dünya Haritası', text: 'Stratejik bölgeleri ele geçir, ticaret yollarını kontrol et.', icon: Globe2 },
  { title: 'Oyuncu Ekonomisi', text: 'P2W yok. Emek veren ve ticaret yapan kazanır.', icon: Hammer },
  { title: 'Kuşatma ve Diplomasi', text: 'İttifak kur, savaş ilan et veya barış anlaşması yap.', icon: HeartHandshake },
  { title: 'Birlikte oyna', text: 'Haftalık turnuvalar, KoTH savaşları ve topluluk etkinlikleri.', icon: UsersRound }
]

const readStore = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
const price = amount => `${amount} TL`
const dateText = value => new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

function App() {
  const [page, setPage] = useState(() => location.hash.replace(/^#\/?/, '') || 'home')
  const [users, setUsers] = useState(() => readStore('craftsolar-users', []))
  const [orders, setOrders] = useState(() => readStore('craftsolar-orders', []))
  const [session, setSession] = useState(() => readStore('craftsolar-session', null))
  const [cart, setCart] = useState(() => readStore('craftsolar-cart', []))
  const [category, setCategory] = useState('Tümü')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [authMode, setAuthMode] = useState(null)
  const [authForm, setAuthForm] = useState({ username: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [successOrder, setSuccessOrder] = useState(null)
  const [orderSearch, setOrderSearch] = useState('')

  useEffect(() => { localStorage.setItem('craftsolar-users', JSON.stringify(users)) }, [users])
  useEffect(() => { localStorage.setItem('craftsolar-orders', JSON.stringify(orders)) }, [orders])
  useEffect(() => { localStorage.setItem('craftsolar-session', JSON.stringify(session)) }, [session])
  useEffect(() => { localStorage.setItem('craftsolar-cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => {
    const onHash = () => { setPage(location.hash.replace(/^#\/?/, '') || 'home'); setMobileOpen(false); setProfileOpen(false); window.scrollTo(0, 0) }
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => {
    const activeDialog = Boolean(authMode || selected || successOrder || cartOpen)
    if (!activeDialog) return
    const onKey = event => {
      if (event.key !== 'Escape') return
      setAuthMode(null)
      setSelected(null)
      setSuccessOrder(null)
      setCartOpen(false)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [authMode, selected, successOrder, cartOpen])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0)
  const cartTotal = cart.reduce((sum, line) => sum + (products.find(product => product.id === line.id)?.price ?? 0) * line.quantity, 0)
  const myOrders = orders.filter(order => order.username === session?.username)
  const visibleProducts = useMemo(() => products.filter(item => (category === 'Tümü' || item.category === category) && item.name.toLocaleLowerCase('tr').includes(search.toLocaleLowerCase('tr'))), [category, search])

  const navigate = to => { location.hash = `/${to}`; setMobileOpen(false); setProfileOpen(false) }
  const copyIp = async () => {
    try { await navigator.clipboard.writeText(IP); setCopied(true); setToast('Sunucu adresi kopyalandı'); setTimeout(() => setCopied(false), 1500) }
    catch { setToast(IP) }
  }
  const addToCart = id => {
    setCart(current => current.some(line => line.id === id) ? current.map(line => line.id === id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { id, quantity: 1 }])
    setSelected(null)
    setToast('Ürün sepete eklendi')
  }
  const updateQuantity = (id, amount) => setCart(current => current.map(line => line.id === id ? { ...line, quantity: line.quantity + amount } : line).filter(line => line.quantity > 0))
  const openAuth = mode => { setAuthMode(mode); setAuthError(''); setAuthForm({ username: '', password: '' }); setProfileOpen(false) }
  const submitAuth = event => {
    event.preventDefault()
    const username = authForm.username.trim()
    if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) return setAuthError('Minecraft nicki 3 ile 16 karakter arasında olmalı.')
    if (authForm.password.length < 4) return setAuthError('Şifre en az 4 karakter olmalı.')
    const found = users.find(user => user.username.toLowerCase() === username.toLowerCase())
    if (authMode === 'register') {
      if (found) return setAuthError('Bu Minecraft nickiyle bir hesap zaten var.')
      setUsers(current => [...current, { username, password: authForm.password, createdAt: new Date().toISOString() }])
      setSession({ username })
      setToast(`Hoş geldin, ${username}`)
    } else {
      if (!found || found.password !== authForm.password) return setAuthError('Minecraft nicki veya şifre hatalı.')
      setSession({ username: found.username })
      setToast(`Tekrar hoş geldin, ${found.username}`)
    }
    setAuthMode(null)
  }
  const checkout = () => {
    if (!session) { setCartOpen(false); openAuth('login'); return }
    if (!cart.length || busy) return
    setBusy(true)
    setTimeout(() => {
      const order = { id: `CS-${Date.now().toString(36).toUpperCase()}`, username: session.username, items: cart.map(line => ({ ...line })), total: cartTotal, createdAt: new Date().toISOString(), status: 'Bekliyor' }
      setOrders(current => [order, ...current])
      setCart([])
      setBusy(false)
      setCartOpen(false)
      setSuccessOrder(order)
    }, 1200)
  }
  const logout = () => { setSession(null); setProfileOpen(false); navigate('home'); setToast('Oturum kapatıldı') }
  const changeStatus = (id, status) => setOrders(current => current.map(order => order.id === id ? { ...order, status } : order))

  if (page === ADMIN_ROUTE) return <AdminPage users={users} orders={orders} changeStatus={changeStatus} />

  return <div className="site-shell">
    <div className="topline"><span className="sun-dot" /> CraftSolar Towny dünyasına hoş geldin <a href={DISCORD} target="_blank" rel="noreferrer">Discord’a katıl <ArrowUpRight size={13} /></a></div>
    <header className="header">
      <a href="#/home" className="brand" aria-label="CraftSolar ana sayfa"><img src="/craftsolar-emblem.png" alt="" /><span>CRAFT<span>SOLAR</span><small>GERÇEK TOWNY DENEYİMİ</small></span></a>
      <nav className={mobileOpen ? 'navigation nav-open' : 'navigation'} aria-label="Ana menü">
        <NavLink to="home" page={page} navigate={navigate}>Anasayfa</NavLink>
        <NavLink to="towny" page={page} navigate={navigate}>Towny</NavLink>
        <NavLink to="rehber" page={page} navigate={navigate}>Rehber</NavLink>
        <NavLink to="magaza" page={page} navigate={navigate}>Mağaza</NavLink>
        <NavLink to="sss" page={page} navigate={navigate}>Yardım</NavLink>
      </nav>
      <div className="header-tools">
        <button className="header-icon" onClick={() => setCartOpen(true)} aria-label={`Sepeti aç, ${cartCount} ürün`}><ShoppingCart size={18} />{cartCount > 0 && <span className="cart-badge">{cartCount}</span>}</button>
        {session ? <div className="profile-box"><button className="profile-button" onClick={() => setProfileOpen(!profileOpen)}><span>{session.username.slice(0, 1).toUpperCase()}</span><b>{session.username}</b><ChevronDown size={13} /></button>{profileOpen && <div className="profile-pop"><button onClick={() => navigate('hesabim')}>Siparişlerim <span>{myOrders.length}</span></button><button onClick={logout}>Oturumu kapat</button></div>}</div> : <button className="account-button" onClick={() => openAuth('login')}><UserRound size={16} /><span>Giriş yap</span></button>}
        <button className="menu-toggle" aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</button>
      </div>
    </header>
    <main key={page}>
      {page === 'home' && <HomePage navigate={navigate} copyIp={copyIp} copied={copied} addToCart={addToCart} openProduct={setSelected} orders={orders} />}
      {page === 'towny' && <TownyPage navigate={navigate} copyIp={copyIp} />}
      {page === 'rehber' && <GuidePage navigate={navigate} copyIp={copyIp} />}
      {page === 'magaza' && <StorePage category={category} setCategory={setCategory} search={search} setSearch={setSearch} products={visibleProducts} addToCart={addToCart} openProduct={setSelected} cartCount={cartCount} openCart={() => setCartOpen(true)} />}
      {page === 'sss' && <HelpPage navigate={navigate} />}
      {page === 'hesabim' && <AccountPage session={session} orders={myOrders} openAuth={openAuth} navigate={navigate} logout={logout} />}
      {!['home', 'towny', 'rehber', 'magaza', 'sss', 'hesabim'].includes(page) && <NotFound navigate={navigate} />}
    </main>
    <Footer navigate={navigate} />

    {cartOpen && <><button className="overlay" aria-label="Sepeti kapat" onClick={() => setCartOpen(false)} /><aside className="cart-panel" aria-label="Alışveriş sepeti"><div className="panel-head"><div><small>CRAFTSOLAR MAĞAZA</small><h2>Sepetim <span>({cartCount})</span></h2></div><button className="close-icon" aria-label="Kapat" onClick={() => setCartOpen(false)}><X /></button></div>{cart.length ? <><div className="cart-items">{cart.map(line => { const item = products.find(product => product.id === line.id); if (!item) return null; const Icon = item.icon; return <article className="cart-item" key={line.id}><div className={`cart-art tone-${item.tone}`}><Icon /></div><div className="cart-description"><b>{item.name}</b><span>{price(item.price)} / adet</span><div className="quantity"><button aria-label={`${item.name} adedini azalt`} onClick={() => updateQuantity(item.id, -1)}><Minus size={13} /></button><span>{line.quantity}</span><button aria-label={`${item.name} adedini artır`} onClick={() => updateQuantity(item.id, 1)}><Plus size={13} /></button></div></div><strong className="cart-line-price">{price(item.price * line.quantity)}</strong></article> })}</div><div className="cart-footer"><p><Shield size={15} /> Demo sipariş, gerçek ödeme alınmaz.</p><div className="total-line"><span>Toplam</span><b>{price(cartTotal)}</b></div><button className="button button-orange full-button" disabled={busy} onClick={checkout}>{busy ? 'Sipariş hazırlanıyor…' : 'Satın alımı tamamla'} <ArrowRight size={17} /></button><small>{DELIVERY}</small></div></> : <div className="cart-empty"><ShoppingBag size={31} /><h3>Sepetin boş</h3><p>Mağazadan kasabana uygun bir parça seç.</p><button className="button button-outline" onClick={() => { setCartOpen(false); navigate('magaza') }}>Mağazaya git</button></div>}</aside></>}
    {selected && <ProductDialog product={selected} close={() => setSelected(null)} add={() => addToCart(selected.id)} />}
    {authMode && <AuthDialog mode={authMode} setMode={setAuthMode} form={authForm} setForm={setAuthForm} error={authError} submit={submitAuth} close={() => setAuthMode(null)} />}
    {successOrder && <SuccessDialog order={successOrder} close={() => setSuccessOrder(null)} goOrders={() => { setSuccessOrder(null); navigate('hesabim') }} />}
    {toast && <div className="toast"><Check size={15} />{toast}</div>}
  </div>
}

function NavLink({ to, page, navigate, children }) {
  return <a href={`#/${to}`} className={page === to ? 'nav-link selected' : 'nav-link'} aria-current={page === to ? 'page' : undefined} onClick={event => { event.preventDefault(); navigate(to) }}>{children}</a>
}

function Hero({ eyebrow, title, text, buttons = true, copyIp, copied }) {
  return <section className="hero"><img className="hero-image" src="/craftsolar-banner.png" alt="Gün batımında CraftSolar Towny dünyası" fetchPriority="high" width="1672" height="836" /><div className="hero-cover" /><div className="hero-copy"><span className="hero-eyebrow"><i />{eyebrow}</span><h1>{title}</h1><p>{text}</p>{buttons && <div className="hero-ctas"><a href="#/towny" className="button button-orange">Dünyayı keşfet <ArrowRight size={16} /></a><button className="button button-glass" onClick={copyIp}>{copied ? 'Adres kopyalandı' : IP}<Copy size={15} /></button></div>}</div><span className="hero-coordinate">CRAFTSOLAR <i /> TOWNY DÜNYASI</span></section>
}

function HomePage({ navigate, copyIp, copied, addToCart, openProduct, orders }) {
  return <>
    <Hero eyebrow="BİR KASABA İLE BAŞLAR" title={<>Kasabanı kur.<br /><em>Kıtada yerini al.</em></>} text="Gerçek dünya haritasında ulusunu büyüt, güneşin altındaki yerini al." copyIp={copyIp} copied={copied} />
    <div className="server-ribbon"><div><span className="ribbon-mark"><Globe2 size={19} /></span><span><small>OYUN MODU</small><b>Towny</b></span></div><i /><div><span className="ribbon-mark"><Zap size={19} /></span><span><small>SÜRÜM</small><b>Tüm sürümler uygun</b></span></div><i /><button onClick={copyIp}><span className="ribbon-mark"><Copy size={18} /></span><span><small>{copied ? 'KOPYALANDI' : 'SUNUCU ADRESİ'}</small><b>{IP}</b></span><ArrowUpRight size={16} /></button></div>
    <section className="home-world"><div className="section-picture"><img src="/craftsolar-emblem.png" alt="CraftSolar güneş amblemi" width="2048" height="2048" /><span className="picture-caption">HARİTA / 01</span></div><div className="home-world-copy"><span className="section-label">01 — DÜNYA</span><h2>Haritanın her köşesi<br />yeni bir başlangıç.</h2><p>Towny’de sınırları sen çizersin. Kasabanı kur, komşularınla ticaret yap ve diplomasiyle ulusunu büyüt.</p><div className="mini-features"><div><Globe2 /><span><b>Gerçek dünya haritası</b><small>Stratejik bölgeler, ticaret yolları</small></span></div><div><Swords /><span><b>Kuşatma ve diplomasi</b><small>İttifak, savaş veya barış</small></span></div></div><a href="#/towny" className="inline-link" onClick={event => { event.preventDefault(); navigate('towny') }}>Towny dünyasını tanı <ArrowRight size={15} /></a></div></section>
    <section className="home-shop"><div className="section-heading"><div><span className="section-label">02 — PAZAR YERİ</span><h2>Kasabana küçük bir destek.</h2></div><button className="inline-link" onClick={() => navigate('magaza')}>Tüm ürünler <ArrowRight size={15} /></button></div><div className="featured-grid">{products.slice(0, 4).map(item => <ProductCard key={item.id} product={item} onSelect={() => openProduct(item)} onAdd={() => addToCart(item.id)} />)}</div><p className="delivery-line"><Truck size={16} /> {DELIVERY}</p></section>
    <section className="home-bottom"><div><span className="section-label">03 — TOPLULUK</span><h2>Kasaban seni bekliyor.</h2><p>Kurallar, rehber ve oyuncularla tanışmak için Discord’a katıl.</p></div><a className="button button-dark" href={DISCORD} target="_blank" rel="noreferrer">Discord’a katıl <ArrowUpRight size={16} /></a><a href="#/hesabim" className="sr-only" onClick={event => { event.preventDefault(); navigate('hesabim') }}>Hesabım</a>{orders.length > 0 && <span className="home-order-note">Bu tarayıcıda {orders.length} demo sipariş kaydı var.</span>}</section>
  </>
}

function PageBanner({ number, eyebrow, title, text, children }) {
  return <section className="page-banner"><div className="page-banner-image" /><div className="page-banner-copy"><span className="section-label">{number} — {eyebrow}</span><h1>{title}</h1><p>{text}</p>{children}</div><span className="banner-code">CRAFTSOLAR / {number}</span></section>
}

function TownyPage({ navigate, copyIp }) {
  return <><PageBanner number="01" eyebrow="TOWNY DÜNYASI" title={<>Bir harita.<br /><em>Sınırsız ihtimal.</em></>} text="CraftSolar yalnızca Towny. Gerçek dünya haritasında kasabanı kur, kendi hikâyeni yaz." /><section className="towny-intro"><div className="towny-poster"><img src="/craftsolar-banner.png" alt="CraftSolar Towny dünyasının gün batımı manzarası" width="1672" height="836" /><span>GÜNEŞİN ALTINDAKİ YERİNİ AL</span></div><div className="towny-text"><span className="section-label">BİR DÜNYA, ORTAK HİKÂYELER</span><h2>Gelişmek için<br />birlikte oyna.</h2><p>Kasaba hayatı kaynak toplamaktan fazlası. Komşularınla anlaş, ticaretini büyüt ve kıtanın geleceğinde söz sahibi ol.</p><button className="button button-orange" onClick={copyIp}>Sunucuya bağlan <Copy size={15} /></button></div></section><section className="feature-section"><div className="section-heading"><div><span className="section-label">CRAFTSOLAR’DA</span><h2>Oyunun kendi ritmi.</h2></div><p>Kur, üret, pazarlık et. Dünya senin kararlarınla şekillenir.</p></div><div className="feature-grid">{featureItems.map((item, index) => { const Icon = item.icon; return <article className={`feature-card feature-${index + 1}`} key={item.title}><span className="feature-index">0{index + 1}</span><Icon size={25} /><h3>{item.title}</h3><p>{item.text}</p></article> })}</div></section><Callout navigate={navigate} /></>
}

function GuidePage({ navigate, copyIp }) {
  const steps = [
    { no: '01', title: 'Sunucuya bağlan', text: 'Minecraft Java Edition’ı aç. Sunucu listesine CraftSolar adresini ekle.', icon: Copy, action: true },
    { no: '02', title: 'Dünyayı tanı', text: 'Başlangıç alanında çevreni keşfet ve kasaban için uygun bir yer belirle.', icon: Globe2 },
    { no: '03', title: 'Kasabanı büyüt', text: 'Diğer oyuncularla tanış, kaynaklarını değerlendir ve kasabanın çevresini genişlet.', icon: Hammer },
    { no: '04', title: 'Kıtada söz sahibi ol', text: 'Ticaret, diplomasi ve etkinliklerle ulusunun hikâyesini yaz.', icon: Crown }
  ]
  return <><PageBanner number="02" eyebrow="BAŞLANGIÇ REHBERİ" title={<>İlk günün.<br /><em>İlk kasaban.</em></>} text="CraftSolar’a katılmak kolay. Dört adımda Towny macerana başla." /><section className="guide-section"><div className="guide-track">{steps.map(step => { const Icon = step.icon; return <article className="guide-step" key={step.no}><span className="guide-number">{step.no}</span><div className="guide-icon"><Icon size={21} /></div><div><h2>{step.title}</h2><p>{step.text}</p>{step.action && <button className="inline-link" onClick={copyIp}>IP adresini kopyala <Copy size={14} /></button>}</div></article> })}</div><aside className="guide-aside"><img src="/craftsolar-emblem.png" alt="CraftSolar" width="2048" height="2048" /><span className="section-label">SUNUCU BİLGİSİ</span><h2>Java Edition<br />Tüm sürümler uygun</h2><button className="button button-orange" onClick={copyIp}>CraftSolar’a bağlan <ArrowRight size={15} /></button><p>Soru mu var? Topluluğa katıl, oyunculara danış.</p><a href={DISCORD} target="_blank" rel="noreferrer" className="inline-link">Discord desteği <ArrowUpRight size={15} /></a></aside></section><Callout navigate={navigate} /></>
}

function StorePage({ category, setCategory, search, setSearch, products: visibleProducts, addToCart, openProduct, cartCount, openCart }) {
  return <><PageBanner number="03" eyebrow="CRAFTSOLAR MAĞAZA" title={<>Kasabanın<br /><em>ihtiyaçları.</em></>} text="Rütbeler, özel kılıçlar ve netherite setler. Her ürün, yetkililer tarafından oyun içinde teslim edilir."><button className="button button-orange" onClick={openCart}><ShoppingCart size={16} /> Sepetim ({cartCount})</button></PageBanner><section className="store-page"><div className="store-controls"><div className="category-list" aria-label="Ürün kategorisi">{['Tümü', 'Rütbeler', 'Silahlar', 'Setler'].map(item => <button key={item} className={category === item ? 'category-button category-active' : 'category-button'} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search-box"><span>ÜRÜN ARA</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Örn. SOLAR" /></label></div>{visibleProducts.length ? <div className="store-grid">{visibleProducts.map(item => <ProductCard key={item.id} product={item} onSelect={() => openProduct(item)} onAdd={() => addToCart(item.id)} />)}</div> : <div className="empty-state"><ShoppingBag size={27} /><h2>Bu aramada ürün yok.</h2><p>Başka bir ürün adı dene veya kategori filtresini kaldır.</p></div>}<div className="store-delivery"><Truck size={22} /><div><b>Oyun içi teslimat</b><p>{DELIVERY}</p></div></div><p className="demo-note">Bu mağaza şu anda önizleme modunda. Siparişler simüle edilir ve ödeme alınmaz.</p></section></>
}

function HelpPage({ navigate }) {
  const questions = [
    ['CraftSolar hangi oyun modunda?', 'CraftSolar yalnızca Towny sunucusudur.'],
    ['Sunucuya hangi sürümle girebilirim?', 'Tüm sürümler uygun olarak sunulmuştur. Java Edition kullan.'],
    ['Satın aldığım ürün nasıl teslim edilir?', 'Siparişler demo olarak kaydedilir. Gerçek siparişlerde eşyalar ve rütbeler oyun içi yetkililer tarafından teslim edilir.'],
    ['Site üzerinden gerçek ödeme alınıyor mu?', 'Hayır. Bu site önizleme sürümüdür. Satın alma akışı çalışıyor gibi görünür, ancak gerçek ödeme alınmaz.'],
    ['Minecraft kullanıcı adım önemli mi?', 'Evet. Hesap açarken kullandığın ad, Minecraft nickinle birebir aynı olmalı. Teslimatlar bu isme yapılır.']
  ]
  const [open, setOpen] = useState(0)
  return <><PageBanner number="04" eyebrow="YARDIM MERKEZİ" title={<>Aklındaki<br /><em>sorular.</em></>} text="Başlamadan önce en çok merak edilenler. Daha fazla yardım için Discord’dayız." /><section className="faq-section"><div className="faq-list">{questions.map(([question, answer], index) => <article className={open === index ? 'faq-item faq-open' : 'faq-item'} key={question}><button aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)}><span>{question}</span><Plus size={17} /></button>{open === index && <p>{answer}</p>}</article>)}</div><aside className="support-card"><span className="support-icon"><HeartHandshake size={25} /></span><span className="section-label">TOPLULUK DESTEĞİ</span><h2>Bir oyuncuya<br />danış.</h2><p>Towny, kasaban veya sunucu hakkında sohbet etmek için Discord’a gel.</p><a className="button button-orange" href={DISCORD} target="_blank" rel="noreferrer">Discord’a katıl <ArrowUpRight size={16} /></a><button className="text-button" onClick={() => navigate('rehber')}>Başlangıç rehberi <ArrowRight size={14} /></button></aside></section></>
}

function AccountPage({ session, orders, openAuth, navigate, logout }) {
  if (!session) return <section className="account-empty"><UserRound size={32} /><span className="section-label">CRAFTSOLAR HESABIN</span><h1>Önce giriş yap.</h1><p>Sipariş geçmişini görmek için demo hesabına giriş yap veya yeni hesap oluştur.</p><div><button className="button button-orange" onClick={() => openAuth('login')}>Giriş yap</button><button className="button button-outline" onClick={() => openAuth('register')}>Hesap oluştur</button></div></section>
  return <><PageBanner number="05" eyebrow="HESABIM" title={<>Selam,<br /><em>{session.username}.</em></>} text="Bu tarayıcıdaki siparişlerini ve teslimat durumlarını buradan takip edebilirsin."><button className="button button-outline" onClick={logout}>Oturumu kapat</button></PageBanner><section className="account-orders"><div className="section-heading"><div><span className="section-label">SİPARİŞ GEÇMİŞİ</span><h2>Siparişlerin</h2></div><span className="order-total-count">{orders.length} SİPARİŞ</span></div>{orders.length ? orders.map(order => <OrderCard key={order.id} order={order} />) : <div className="empty-state"><PackageCheck size={28} /><h2>Henüz sipariş yok.</h2><p>Mağazaya göz at, kasaban için bir parça seç.</p><button className="button button-orange" onClick={() => navigate('magaza')}>Mağazaya git <ArrowRight size={15} /></button></div>}</section></>
}

function ProductCard({ product, onSelect, onAdd }) {
  const Icon = product.icon
  return <article className="product-card"><button className={`product-art tone-${product.tone}`} onClick={onSelect} aria-label={`${product.name} detayları`}><span className="product-label">{product.label}</span><span className="product-code">CS / {product.id.toUpperCase()}</span><span className="product-icon"><Icon size={40} strokeWidth={1.5} /></span><span className="product-art-base" /><span className="art-coordinate">CRAFTSOLAR GOODS</span></button><div className="product-meta"><div><small>{product.category}</small><button className="product-title" onClick={onSelect}>{product.name}</button></div><strong>{price(product.price)}</strong></div><div className="product-actions"><button onClick={onSelect}>Detaylar <ArrowRight size={14} /></button><button onClick={onAdd} aria-label={`${product.name} ürününü sepete ekle`}><Plus size={16} /><span>Sepete ekle</span></button></div></article>
}

function ProductDialog({ product, close, add }) {
  const Icon = product.icon
  return <div className="dialog-backdrop" onMouseDown={event => event.target === event.currentTarget && close()}><section className="product-dialog" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title"><button className="close-icon dialog-close" aria-label="Pencereyi kapat" onClick={close}><X /></button><div className={`dialog-art tone-${product.tone}`}><Icon size={52} /><span>{product.category} / CRAFTSOLAR</span></div><div className="dialog-copy"><span className="section-label">{product.label}</span><h2 id="product-dialog-title">{product.name}</h2><p>{product.description}</p><div className="dialog-delivery"><Truck size={17} />{DELIVERY}</div><div className="dialog-buy"><strong>{price(product.price)}</strong><button className="button button-orange" onClick={add}>Sepete ekle <Plus size={16} /></button></div><small>Demo sipariştir. Gerçek ödeme alınmaz.</small></div></section></div>
}

function AuthDialog({ mode, setMode, form, setForm, error, submit, close }) {
  return <div className="dialog-backdrop" onMouseDown={event => event.target === event.currentTarget && close()}><section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="close-icon dialog-close" aria-label="Pencereyi kapat" onClick={close}><X /></button><img src="/craftsolar-emblem.png" alt="" width="2048" height="2048" /><span className="section-label">CRAFTSOLAR / HESAP</span><h2 id="auth-title">{mode === 'register' ? 'Dünyada yerini al.' : 'Tekrar hoş geldin.'}</h2><p>{mode === 'register' ? 'Siparişlerini takip etmek için demo hesabını oluştur.' : 'Siparişlerini görmek için giriş yap.'}</p><div className="nick-reminder"><b><UserRound size={15} /> Minecraft nicki ile kayıt ol</b><span>Kullanıcı adın oyun içi nickinle birebir aynı olmalı. Teslimatlar bu isme yapılır.</span></div><form onSubmit={submit}><label>MINECRAFT NICK<input autoComplete="username" maxLength={16} required value={form.username} onChange={event => setForm({ ...form, username: event.target.value })} placeholder="Oyundaki kullanıcı adın" /></label><label>ŞİFRE<input autoComplete={mode === 'register' ? 'new-password' : 'current-password'} type="password" minLength={4} required value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="En az 4 karakter" /></label>{error && <span className="form-error" role="alert">{error}</span>}<button className="button button-orange full-button">{mode === 'register' ? 'Hesap oluştur' : 'Giriş yap'} <ArrowRight size={16} /></button></form><div className="auth-switch">{mode === 'register' ? 'Zaten hesabın var mı?' : 'CraftSolar’da yeni misin?'} <button onClick={() => setMode(mode === 'register' ? 'login' : 'register')}>{mode === 'register' ? 'Giriş yap' : 'Hesap oluştur'}</button></div><small className="local-note">Demo bilgileri yalnızca bu tarayıcıda saklanır.</small></section></div>
}

function SuccessDialog({ order, close, goOrders }) {
  return <div className="dialog-backdrop"><section className="success-dialog" role="dialog" aria-modal="true"><button className="close-icon dialog-close" aria-label="Pencereyi kapat" onClick={close}><X /></button><div className="success-symbol"><PackageCheck size={30} /></div><span className="section-label">SİPARİŞ / {order.id}</span><h2>Siparişin alındı.</h2><p>{order.username}, siparişin demo olarak oluşturuldu. Gerçek ödeme alınmadı.</p><div className="success-total"><span>SİPARİŞ TUTARI</span><b>{price(order.total)}</b></div><p className="success-delivery">{DELIVERY}</p><button className="button button-orange full-button" onClick={goOrders}>Siparişlerime git <ArrowRight size={16} /></button></section></div>
}

function OrderCard({ order }) {
  return <article className="account-order"><div className="account-order-icon"><PackageCheck size={18} /></div><div className="account-order-data"><b>{order.items.map(line => `${products.find(item => item.id === line.id)?.name} ×${line.quantity}`).join(', ')}</b><span>{order.id} · {dateText(order.createdAt)}</span></div><strong>{price(order.total)}</strong><span className={order.status === 'Teslim Edildi' ? 'status status-done' : 'status'}>{order.status}</span></article>
}

function Callout({ navigate }) {
  return <section className="callout"><img src="/craftsolar-emblem.png" alt="" width="2048" height="2048" /><div><span className="section-label">SENİ BEKLİYORUZ</span><h2>Güneşin altında yerini al.</h2><p>Sunucuya katıl, kendi Towny hikâyeni başlat.</p></div><button className="button button-orange" onClick={() => navigate('rehber')}>Nasıl katılırım? <ArrowRight size={15} /></button></section>
}

function NotFound({ navigate }) {
  return <section className="account-empty"><span className="section-label">404 / HARİTA DIŞI</span><h1>Bu sayfa burada yok.</h1><p>Yolunu kaybettiysen ana meydana dön.</p><button className="button button-orange" onClick={() => navigate('home')}>Anasayfaya dön</button></section>
}

function Footer({ navigate }) {
  return <footer className="footer"><div className="footer-main"><a href="#/home" className="footer-brand"><img src="/craftsolar-emblem.png" alt="" width="2048" height="2048" /><span>CRAFT<span>SOLAR</span><small>GERÇEK TOWNY DENEYİMİ</small></span></a><p>Kendi kasabanı kur, ulusunu büyüt ve kıtanın tek hâkimi ol.</p><a className="footer-discord" href={DISCORD} target="_blank" rel="noreferrer">Discord’a katıl <ArrowUpRight size={15} /></a></div><div className="footer-links"><span>CRAFTSOLAR TOWNY</span><button onClick={() => navigate('towny')}>Towny dünyası</button><button onClick={() => navigate('rehber')}>Başlangıç rehberi</button><button onClick={() => navigate('magaza')}>Mağaza</button><button onClick={() => navigate('sss')}>Yardım merkezi</button></div><div className="footer-bottom"><span>© 2026 CRAFTSOLAR TOWNY</span><span>Bağımsız bir Minecraft sunucusudur, Mojang Studios ile bağlantılı değildir.</span></div></footer>
}

function AdminPage({ users, orders, changeStatus }) {
  const [query, setQuery] = useState('')
  const turnover = orders.reduce((sum, order) => sum + order.total, 0)
  return <main className="admin-page"><header className="admin-header"><a href="#/home" className="footer-brand"><img src="/craftsolar-emblem.png" alt="" width="2048" height="2048" /><span>CRAFT<span>SOLAR</span><small>YÖNETİM</small></span></a><button className="button button-outline" onClick={() => { location.hash = '/home' }}>Paneli kapat <X size={15} /></button></header><div className="admin-content"><div className="section-label">CRAFTSOLAR / YÖNETİM PANELİ</div><h1>Sipariş kontrolü</h1><p>Bu panel yalnızca bu tarayıcıdaki demo kayıtlarını gösterir.</p><div className="admin-metrics"><article><span>KULLANICI</span><b>{users.length}</b></article><article><span>SİPARİŞ</span><b>{orders.length}</b></article><article><span>SİMÜLE CİRO</span><b>{price(turnover)}</b></article><article><span>BEKLEYEN</span><b>{orders.filter(order => order.status === 'Bekliyor').length}</b></article></div><section className="admin-orders"><div><h2>Siparişler</h2><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Oyuncu veya ürün ara" /></div>{orders.length ? orders.filter(order => `${order.username} ${order.items.map(line => products.find(item => item.id === line.id)?.name).join(' ')}`.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'))).map(order => <article className="admin-order" key={order.id}><span>{order.id}</span><b>{order.username}</b><div>{order.items.map(line => <small key={line.id}>{products.find(item => item.id === line.id)?.name} ×{line.quantity}</small>)}</div><strong>{price(order.total)}</strong><span className="status">{order.status}</span><button className="button button-outline" onClick={() => changeStatus(order.id, order.status === 'Bekliyor' ? 'Teslim Edildi' : 'Bekliyor')}>{order.status === 'Bekliyor' ? 'Teslim edildi' : 'Geri al'}</button></article>) : <p className="empty-admin">Henüz demo sipariş yok.</p>}</section><section className="admin-users"><h2>Kayıtlı kullanıcılar ({users.length})</h2>{users.length ? users.map(user => <span key={user.username}>{user.username} · {new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(new Date(user.createdAt))}</span>) : <p>Henüz kullanıcı yok.</p>}</section></div></main>
}

createRoot(document.getElementById('root')).render(<App />)
