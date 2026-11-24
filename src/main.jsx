import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, Clipboard, Crown, FileText, Gem, Globe2, Headphones, HeartHandshake, HelpCircle, LockKeyhole, Menu, MessageCircle, Moon, PackageCheck, Plus, Search, Shield, ShoppingBag, ShoppingCart, Sun, Swords, Ticket, Truck, UserRound, UsersRound, Wrench, X, Zap, Trash2, Ban, Megaphone, Send, BellRing } from 'lucide-react'
import './style.css'

const IP = 'craftsolar.redstone.tr:25567'
const DISCORD = 'https://discord.gg/X86xYYw73N'
const ADMIN_ROUTE = 'cs-yonetim-f38a76d9-92b4-4c86-9f2d-2a47c06bb841'
const DELIVERY = 'Siparişler, oyun içi yetkililer tarafından kontrol edilip teslim edilir.'
const products = [
  { id: 'vip', name: 'VIP', category: 'Rütbeler', label: 'İlk adım', description: 'CraftSolar dünyasında sana eşlik edecek özel rütbe.', icon: Crown, tone: 'copper' },
  { id: 'solar', name: 'SOLAR', category: 'Rütbeler', label: 'Güneşin gücü', description: 'SOLAR rütbesiyle kasabanın hikâyesine kendi rengini kat.', icon: Zap, tone: 'gold' },
  { id: 'solar-plus', name: 'SOLAR+', category: 'Rütbeler', label: 'Üst rütbe', description: 'CraftSolar rütbe koleksiyonunun en parlak üyesi.', icon: Gem, tone: 'cream' },
  { id: 'spider', name: 'Örümcek Kılıç', category: 'Silahlar', label: 'Özel eşya', description: 'Örümcek temasından ilham alan özel bir kılıç.', icon: Swords, tone: 'violet' },
  { id: 'weakness', name: 'Zayıflık Kılıç', category: 'Silahlar', label: 'Özel eşya', description: 'Zayıflık temalı, savaş koleksiyonuna özel kılıç.', icon: Swords, tone: 'mint' },
  { id: 'lightning', name: 'Şimşek Kılıç', category: 'Silahlar', label: 'Özel eşya', description: 'Şimşek temalı görünümüyle koleksiyondaki yerini alır.', icon: Zap, tone: 'blue' },
  { id: 'prot5', name: 'Koruma 5 Netherite Set', category: 'Setler', label: 'Zırh seti', description: 'Koruma V büyülü tam netherite zırh seti.', icon: Shield, tone: 'purple' },
  { id: 'prot6', name: 'Koruma 6 Netherite Set', category: 'Setler', label: 'Zırh seti', description: 'Koruma VI büyülü tam netherite zırh seti.', icon: Shield, tone: 'amber' }
]
const features = [
  { title: 'Gerçek dünya haritası', text: 'Stratejik bölgeleri ele geçir, ticaret yollarını kontrol et.', icon: Globe2 },
  { title: 'Oyuncu ekonomisi', text: 'P2W yok. Emek veren ve ticaret yapan kazanır.', icon: Wrench },
  { title: 'Kuşatma ve diplomasi', text: 'İttifak kur, savaş ilan et veya barış anlaşması yap.', icon: HeartHandshake },
  { title: 'Düzenli etkinlikler', text: 'Haftalık turnuvalar, KoTH savaşları ve topluluk etkinlikleri.', icon: UsersRound }
]

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {})
  if (options.body) headers.set('Content-Type', 'application/json')
  const response = await fetch(path, { ...options, headers, credentials: 'same-origin' })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'İstek tamamlanamadı. Daha sonra tekrar dene.')
  return data
}

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('craftsolar-cart') || '[]')
    return Array.isArray(saved) ? saved.filter(item => products.some(product => product.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0) : []
  } catch { return [] }
}

function App() {
  const [page, setPage] = useState(() => location.hash.replace(/^#\/?/, '') || 'home')
  const [theme, setTheme] = useState(() => localStorage.getItem('craftsolar-theme') || 'dark')
  const [session, setSession] = useState(null)
  const [adminSession, setAdminSession] = useState(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [cart, setCart] = useState(readCart)
  const [category, setCategory] = useState('Tümü')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [authMode, setAuthMode] = useState(null)
  const [authError, setAuthError] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [orders, setOrders] = useState([])
  const [tickets, setTickets] = useState([])
  const [applications, setApplications] = useState([])
  const [submission, setSubmission] = useState(null)
  const [copied, setCopied] = useState(false)
  const [siteNotice, setSiteNotice] = useState({ announcement: null, notice: null, welcomeNotice: '' })
  const [banNotice, setBanNotice] = useState(null)
  const [deletedNotice, setDeletedNotice] = useState(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('craftsolar-theme', theme)
  }, [theme])
  useEffect(() => { localStorage.setItem('craftsolar-cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => {
    if (location.hash.replace(/^#\/?/, '') === ADMIN_ROUTE) api('/api/admin', { method: 'DELETE' }).catch(() => {})
  }, [])
  useEffect(() => {
    api('/api/auth').then(data => { setSession(data.user); setSiteNotice({ announcement: data.announcement, notice: data.notice, welcomeNotice: data.welcomeNotice || '' }); setBanNotice(data.ban || null); setDeletedNotice(data.deleted || null) }).catch(() => setSession(null)).finally(() => setSessionReady(true))
  }, [])
  useEffect(() => {
    const update = () => {
      setPage(location.hash.replace(/^#\/?/, '') || 'home')
      if (location.hash.replace(/^#\/?/, '') !== ADMIN_ROUTE) setAdminSession(null)
      if (location.hash.replace(/^#\/?/, '') !== ADMIN_ROUTE) api('/api/admin', { method: 'DELETE' }).catch(() => {})
      setMobileOpen(false)
      setProfileOpen(false)
      setError('')
      setSubmission(null)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    addEventListener('hashchange', update)
    return () => removeEventListener('hashchange', update)
  }, [])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timer)
  }, [toast])
  useEffect(() => {
    if (!authMode && !selected && !cartOpen && !submission) return
    const closeOnEscape = event => {
      if (event.key !== 'Escape') return
      setAuthMode(null)
      setSelected(null)
      setCartOpen(false)
      setSubmission(null)
    }
    addEventListener('keydown', closeOnEscape)
    return () => removeEventListener('keydown', closeOnEscape)
  }, [authMode, selected, cartOpen, submission])
  useEffect(() => {
    if ((page === 'hesabim' || page === 'siparislerim') && session?.role === 'user') api('/api/orders').then(data => setOrders(data.orders)).catch(reason => setError(reason.message))
    if (page === 'destek' && session?.role === 'user') api('/api/support').then(data => setTickets(data.tickets)).catch(reason => setError(reason.message))
    if (page === 'yetkili-alimi' && session?.role === 'user') api('/api/applications').then(data => setApplications(data.applications)).catch(reason => setError(reason.message))
  }, [page, session])

  const count = cart.reduce((sum, line) => sum + line.quantity, 0)
  const visibleProducts = useMemo(() => products.filter(item => (category === 'Tümü' || item.category === category) && item.name.toLocaleLowerCase('tr').includes(search.toLocaleLowerCase('tr'))), [category, search])
  const navigate = destination => { location.hash = `/${destination}`; setMobileOpen(false); setProfileOpen(false) }

  const copyIp = async () => {
    try { await navigator.clipboard.writeText(IP); setCopied(true); setToast('Sunucu adresi kopyalandı'); setTimeout(() => setCopied(false), 1400) }
    catch { setToast(IP) }
  }
  const addToCart = id => {
    setCart(current => current.some(item => item.id === id) ? current.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { id, quantity: 1 }])
    setSelected(null)
    setToast('Ürün sepete eklendi')
  }
  const changeQuantity = (id, amount) => setCart(current => current.map(item => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter(item => item.quantity > 0))
  const signOut = async () => {
    try { await api('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'logout' }) }) } catch { }
    setSession(null)
    setOrders([])
    setTickets([])
    navigate('home')
    setToast('Oturum kapatıldı')
  }
  const submitAuth = async (event, form) => {
    event.preventDefault()
    setBusy(true)
    setAuthError('')
    try {
      const data = await api('/api/auth', { method: 'POST', body: JSON.stringify({ action: authMode, ...form }) })
      setSession(data.user)
      const state = await api('/api/auth')
      setSiteNotice({ announcement: state.announcement, notice: state.notice, welcomeNotice: state.welcomeNotice || '' })
      setBanNotice(null)
      setDeletedNotice(null)
      setAuthMode(null)
      setToast(authMode === 'register' ? 'Hesabın oluşturuldu' : 'Giriş yaptın')
    } catch (reason) { setAuthError(reason.message) }
    finally { setBusy(false) }
  }
  const checkout = async () => {
    if (!session) { setCartOpen(false); setAuthMode('login'); return }
    setBusy(true)
    setError('')
    try {
      const data = await api('/api/orders', { method: 'POST', body: JSON.stringify({ items: cart }) })
      setCart([])
      setCartOpen(false)
      setSubmission({ type: 'order', data: data.order })
    } catch (reason) { setError(reason.message) }
    finally { setBusy(false) }
  }
  const requireLogin = () => {
    setAuthMode('login')
    setAuthError('Bu bölümü kullanmak için önce hesabına giriş yap.')
  }

  const isAdmin = page === ADMIN_ROUTE
  const content = page === 'home' ? <HomePage navigate={navigate} copyIp={copyIp} copied={copied} openProduct={setSelected} addToCart={addToCart} />
    : page === 'towny' ? <TownyPage navigate={navigate} copyIp={copyIp} />
      : page === 'rehber' ? <GuidePage navigate={navigate} copyIp={copyIp} />
        : page === 'magaza' ? <StorePage products={visibleProducts} category={category} setCategory={setCategory} search={search} setSearch={setSearch} openProduct={setSelected} addToCart={addToCart} count={count} openCart={() => setCartOpen(true)} />
          : page === 'yetkili-alimi' ? <ApplicationPage session={session} sessionReady={sessionReady} requireLogin={requireLogin} applications={applications} error={error} submit={async values => {
            setBusy(true); setError('')
            try { const data = await api('/api/applications', { method: 'POST', body: JSON.stringify(values) }); setSubmission({ type: 'application', data: data.application }); setApplications(current => [data.application, ...current]); return true }
            catch (reason) { setError(reason.message); return false }
            finally { setBusy(false) }
          }} busy={busy} />
            : page === 'destek' ? <SupportPage session={session} sessionReady={sessionReady} tickets={tickets} requireLogin={requireLogin} busy={busy} error={error} submit={async values => {
              setBusy(true); setError('')
              try { const data = await api('/api/support', { method: 'POST', body: JSON.stringify(values) }); setTickets(current => [data.ticket, ...current]); setSubmission({ type: 'support', data: data.ticket }); return true }
              catch (reason) { setError(reason.message); return false }
              finally { setBusy(false) }
            }} />
              : page === 'hesabim' ? <AccountPage session={session} sessionReady={sessionReady} orders={orders} openAuth={mode => { setAuthMode(mode); setAuthError('') }} navigate={navigate} signOut={signOut} />
                : page === 'siparislerim' ? <OrderPage session={session} sessionReady={sessionReady} orders={orders} requireLogin={requireLogin} />
                : isAdmin ? <AdminPage session={adminSession} sessionReady={sessionReady} signIn={async password => {
                  const data = await api('/api/admin', { method: 'POST', body: JSON.stringify({ password }) })
                  setAdminSession(data.user)
                }} signOut={async () => { try { await api('/api/admin', { method: 'DELETE' }) } catch { }; setAdminSession(null); navigate('home') }} theme={theme} setTheme={setTheme} />
                  : <NotFound navigate={navigate} />

  return <div className="site-shell">
    {!isAdmin && siteNotice.announcement?.enabled && siteNotice.announcement.text && <a className="announcement-ticker" style={{ '--ticker-bg': siteNotice.announcement.background, '--ticker-color': siteNotice.announcement.color, '--ticker-size': `${siteNotice.announcement.fontSize}px` }} href="#/magaza"><span>{siteNotice.announcement.text}</span><span>{siteNotice.announcement.text}</span><span>{siteNotice.announcement.text}</span></a>}
    {!isAdmin && siteNotice.notice && session?.role === 'user' && <div className="site-personal-notice"><BellRing size={16} />{siteNotice.notice.text}<button onClick={() => setSiteNotice(current => ({ ...current, notice: null }))} aria-label="Mesajı kapat"><X size={15} /></button></div>}
    {!isAdmin && banNotice && <div className="ban-notice"><Ban size={17} /><span>Hesabın kısıtlandı · {banNotice.reason}{banNotice.until ? ` · ${new Date(banNotice.until).toLocaleString('tr-TR')} tarihine kadar` : ''}</span></div>}
    {!isAdmin && deletedNotice && <div className="ban-notice deleted-notice"><Trash2 size={17} /><span>Hesabın yönetim tarafından silinmiş. Gerekçe: {deletedNotice.reason}</span></div>}
    {!isAdmin && <>
      <div className="announce"><span className="announce-mark" /> CraftSolar Towny dünyasına hoş geldin <a href={DISCORD} target="_blank" rel="noreferrer">Discord’a katıl <ArrowUpRight size={13} /></a></div>
      <header className="header clay-surface">
        <a href="#/home" className="brand" aria-label="CraftSolar anasayfa"><img src="/craftsolar-emblem.png" alt="" width="2048" height="2048" /><span>CRAFT<span>SOLAR</span><small>GERÇEK TOWNY DENEYİMİ</small></span></a>
        <nav className={mobileOpen ? 'navigation navigation-open glass-surface' : 'navigation'} aria-label="Ana menü">
          <NavLink to="home" page={page} navigate={navigate}>Anasayfa</NavLink>
          <NavLink to="towny" page={page} navigate={navigate}>Towny</NavLink>
          <NavLink to="rehber" page={page} navigate={navigate}>Rehber</NavLink>
          <NavLink to="magaza" page={page} navigate={navigate}>Mağaza</NavLink>
          <NavLink to="yetkili-alimi" page={page} navigate={navigate}>Yetkili alımı</NavLink>
          <NavLink to="destek" page={page} navigate={navigate}>Destek</NavLink>
          {mobileOpen && <NavLink to="hesabim" page={page} navigate={navigate}>Hesabım</NavLink>}
        </nav>
        <div className="header-tools">
          <button className="tool-button theme-button" aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'} title={theme === 'dark' ? 'Açık tema' : 'Koyu tema'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>
          <button className="tool-button cart-button" aria-label={`Sepeti aç, ${count} ürün`} onClick={() => setCartOpen(true)}><ShoppingCart size={17} />{count > 0 && <span className="cart-count">{count}</span>}</button>
          <div className="profile-wrap">{session?.role === 'user' ? <button className="profile-button" onClick={() => setProfileOpen(!profileOpen)}><span>{session.username.slice(0, 1).toUpperCase()}</span><b>{session.username}</b><ChevronDown size={13} /></button> : <button className="tool-button account-button" aria-label="Hesabım" onClick={() => navigate('hesabim')}><UserRound size={17} /></button>}{profileOpen && <div className="profile-menu glass-surface"><button onClick={() => navigate('hesabim')}>Siparişlerim <ChevronRight size={13} /></button><button onClick={() => navigate('yetkili-alimi')}>Başvurular <ChevronRight size={13} /></button><button onClick={() => navigate('destek')}>Destek taleplerim <ChevronRight size={13} /></button><button onClick={signOut}>Oturumu kapat</button></div>}</div>
          <button className="tool-button menu-button" aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
      </header>
    </>}
    <main key={page}>{content}</main>
    {!isAdmin && <Footer navigate={navigate} />}
    {cartOpen && <CartDrawer cart={cart} products={products} changeQuantity={changeQuantity} close={() => setCartOpen(false)} checkout={checkout} busy={busy} error={error} navigate={navigate} />}
    {selected && <ProductDialog product={selected} close={() => setSelected(null)} add={() => addToCart(selected.id)} />}
    {authMode && <AuthDialog mode={authMode} setMode={setAuthMode} busy={busy} error={authError} close={() => setAuthMode(null)} submit={submitAuth} />}
    {submission && <SubmissionDialog submission={submission} close={() => setSubmission(null)} navigate={navigate} />}
    {!isAdmin && siteNotice.welcomeNotice && <div className="dialog-backdrop" onClick={() => setSiteNotice(current => ({ ...current, welcomeNotice: '' }))}><section className="welcome-notice glass-surface" role="dialog" aria-modal="true" onClick={event => event.stopPropagation()}><button className="close-icon dialog-close" aria-label="Mesajı kapat" onClick={() => setSiteNotice(current => ({ ...current, welcomeNotice: '' }))}><X /></button><span className="success-check"><Megaphone size={23} /></span><SectionLabel>CRAFTSOLAR / DUYURU</SectionLabel><p>{siteNotice.welcomeNotice}</p><button className="button button-sun form-submit" onClick={() => setSiteNotice(current => ({ ...current, welcomeNotice: '' }))}>Anladım</button></section></div>}
    {toast && <div className="toast" role="status"><Check size={16} />{toast}</div>}
  </div>
}

function NavLink({ to, page, navigate, children }) {
  return <a href={`#/${to}`} className={page === to ? 'nav-link nav-active' : 'nav-link'} aria-current={page === to ? 'page' : undefined} onClick={event => { event.preventDefault(); navigate(to) }}>{children}</a>
}

function Hero({ eyebrow, title, text, copyIp, copied }) {
  return <section className="hero"><img className="hero-image" src="/craftsolar-banner.png" alt="Gün batımında CraftSolar Towny dünyası" width="1672" height="836" fetchPriority="high" /><div className="hero-shade" /><div className="hero-copy"><span className="eyebrow"><i />{eyebrow}</span><h1>{title}</h1><p>{text}</p><div className="hero-actions"><a className="button button-sun" href="#/towny">Dünyayı keşfet <ArrowRight size={16} /></a><button className="button button-glass" onClick={copyIp}>{copied ? 'Adres kopyalandı' : IP}<Clipboard size={15} /></button></div></div><span className="hero-foot">CRAFTSOLAR <i /> TOWNY DÜNYASI</span></section>
}

function HomePage({ navigate, copyIp, copied, openProduct, addToCart }) {
  return <>
    <Hero eyebrow="BİR KASABA İLE BAŞLAR" title={<>Kasabanı kur.<br /><em>Kıtada yerini al.</em></>} text="Gerçek dünya haritasında ulusunu büyüt, güneşin altındaki yerini al." copyIp={copyIp} copied={copied} />
    <div className="server-strip clay-surface"><div><Globe2 /><span><small>OYUN MODU</small><b>Towny</b></span></div><i /><div><Zap /><span><small>SÜRÜM</small><b>Tüm sürümler uygun</b></span></div><i /><button onClick={copyIp}><Clipboard /><span><small>{copied ? 'KOPYALANDI' : 'SUNUCU ADRESİ'}</small><b>{IP}</b></span><ArrowUpRight /></button></div>
    <section className="home-world"><div className="world-image clay-surface"><img src="/craftsolar-emblem.png" alt="CraftSolar güneş amblemi" width="2048" height="2048" /><span>HARİTA / CRAFTSOLAR</span></div><div className="world-copy"><SectionLabel>01 / TOWNY DÜNYASI</SectionLabel><h2>Haritanın her köşesi<br />yeni bir başlangıç.</h2><p>Kasabanı kur, komşularınla ticaret yap ve diplomasiyle ulusunu büyüt. CraftSolar’da yalnızca Towny var.</p><div className="world-points"><div><Globe2 /><span><b>Gerçek dünya haritası</b><small>Stratejik bölgeler, ticaret yolları</small></span></div><div><Swords /><span><b>Kuşatma ve diplomasi</b><small>İttifak, savaş veya barış</small></span></div></div><button className="text-link" onClick={() => navigate('towny')}>Towny dünyasını tanı <ArrowRight size={15} /></button></div></section>
    <section className="home-store"><SectionHeading label="02 / PAZAR YERİ" title="Kasabana seçtiklerin." linkLabel="Mağazaya git" onLink={() => navigate('magaza')} /><div className="product-grid featured-products">{products.slice(0, 4).map(product => <ProductCard key={product.id} product={product} open={() => openProduct(product)} add={() => addToCart(product.id)} />)}</div><p className="delivery-line"><Truck size={16} />{DELIVERY}</p></section>
    <section className="home-community"><div><SectionLabel>03 / TOPLULUK</SectionLabel><h2>Kasaban seni bekliyor.</h2><p>Towny’ye katıl, rehberi incele ya da ekibimizde yer almak için başvur.</p></div><button className="button button-clay" onClick={() => navigate('yetkili-alimi')}>Yetkili alımına bak <ArrowRight size={16} /></button><a href={DISCORD} className="discord-link" target="_blank" rel="noreferrer">Discord’a katıl <ArrowUpRight size={15} /></a></section>
  </>
}

function SectionLabel({ children }) { return <span className="section-label">{children}</span> }

function SectionHeading({ label, title, linkLabel, onLink }) {
  return <div className="section-heading"><div><SectionLabel>{label}</SectionLabel><h2>{title}</h2></div>{linkLabel && <button className="text-link" onClick={onLink}>{linkLabel}<ArrowRight size={15} /></button>}</div>
}

function PageBanner({ number, eyebrow, title, text, action, image = true }) {
  return <section className="page-banner">{image && <div className="page-banner-image" />}<div className="page-banner-copy"><SectionLabel>{number} / {eyebrow}</SectionLabel><h1>{title}</h1><p>{text}</p>{action}</div><span className="page-banner-code">CRAFTSOLAR / {number}</span></section>
}

function TownyPage({ navigate, copyIp }) {
  return <><PageBanner number="01" eyebrow="TOWNY DÜNYASI" title={<>Bir harita.<br /><em>Sınırsız ihtimal.</em></>} text="CraftSolar yalnızca Towny. Gerçek dünya haritasında kasabanı kur, kendi hikâyeni yaz." image={false} /><section className="towny-intro towny-intro-textonly"><div><SectionLabel>BİR DÜNYA, ORTAK HİKÂYELER</SectionLabel><h2>Gelişmek için<br />birlikte oyna.</h2><p>Kasaba hayatı kaynak toplamaktan fazlası. Komşularınla anlaş, ticaretini büyüt ve kıtanın geleceğinde söz sahibi ol.</p><button className="button button-sun" onClick={copyIp}>Sunucu adresini kopyala <Clipboard size={15} /></button></div></section><section className="feature-section"><SectionHeading label="CRAFTSOLAR’DA" title="Oyunun kendi ritmi." /><div className="feature-grid">{features.map((feature, index) => { const Icon = feature.icon; return <article className="feature-card clay-surface" key={feature.title}><span>0{index + 1}</span><Icon /><h3>{feature.title}</h3><p>{feature.text}</p></article> })}</div></section><Callout navigate={navigate} showImage={false} /></>
}

function GuidePage({ navigate, copyIp }) {
  const steps = [
    { no: '01', title: 'Sunucuya bağlan', text: 'Minecraft Java Edition’ı aç. Sunucu listesine CraftSolar adresini ekle.', icon: Clipboard, action: true },
    { no: '02', title: 'Dünyayı tanı', text: 'Başlangıç alanında çevreni keşfet ve kasaban için uygun bir yer belirle.', icon: Globe2 },
    { no: '03', title: 'Kasabanı büyüt', text: 'Diğer oyuncularla tanış, kaynaklarını değerlendir ve kasabanın çevresini genişlet.', icon: Wrench },
    { no: '04', title: 'Kıtada söz sahibi ol', text: 'Ticaret, diplomasi ve etkinliklerle ulusunun hikâyesini yaz.', icon: Crown }
  ]
  return <><PageBanner number="02" eyebrow="BAŞLANGIÇ REHBERİ" title={<>İlk günün.<br /><em>İlk kasaban.</em></>} text="CraftSolar’a katılmak kolay. Dört adımda Towny macerana başla." /><section className="guide-section"><div className="guide-track">{steps.map(step => { const Icon = step.icon; return <article className="guide-step" key={step.no}><span className="guide-number">{step.no}</span><span className="guide-icon clay-surface"><Icon size={21} /></span><div><h2>{step.title}</h2><p>{step.text}</p>{step.action && <button className="text-link" onClick={copyIp}>IP adresini kopyala <Clipboard size={14} /></button>}</div></article> })}</div><aside className="guide-aside glass-surface"><img src="/craftsolar-emblem.png" alt="CraftSolar" width="2048" height="2048" /><SectionLabel>SUNUCU BİLGİSİ</SectionLabel><h2>Java Edition<br />Tüm sürümler uygun</h2><button className="button button-sun" onClick={copyIp}>CraftSolar’a bağlan <ArrowRight size={15} /></button><p>Soru mu var? Topluluğa katıl, oyunculara danış.</p><a href={DISCORD} target="_blank" rel="noreferrer" className="text-link">Discord desteği <ArrowUpRight size={15} /></a></aside></section><Callout navigate={navigate} /></>
}

function StorePage({ products: visible, category, setCategory, search, setSearch, openProduct, addToCart, count, openCart }) {
  return <><PageBanner number="03" eyebrow="CRAFTSOLAR MAĞAZA" title={<>Kasabanın<br /><em>ihtiyaçları.</em></>} text="Rütbeler, özel kılıçlar ve netherite setler. Siparişler oyun içi yetkililer tarafından teslim edilir." action={<button className="button button-sun" onClick={openCart}><ShoppingCart size={16} /> Sepetim ({count})</button>} /><section className="store-page"><div className="store-controls glass-surface"><div className="category-list">{['Tümü', 'Rütbeler', 'Silahlar', 'Setler'].map(item => <button key={item} className={category === item ? 'category-button category-selected' : 'category-button'} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search-box"><Search size={15} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Ürün ara" /></label></div>{visible.length ? <div className="product-grid store-products">{visible.map(product => <ProductCard key={product.id} product={product} open={() => openProduct(product)} add={() => addToCart(product.id)} />)}</div> : <EmptyState icon={ShoppingBag} title="Ürün bulunamadı" text="Başka bir arama yap veya farklı kategori seç." />}<div className="delivery-card clay-surface"><Truck /><div><b>Oyun içi teslimat</b><p>{DELIVERY}</p></div></div><p className="store-preview-note">Ödeme henüz aktif değil. Siparişler yalnızca yönetim paneline demo talebi olarak iletilir.</p></section></>
}

function ProductCard({ product, open, add }) {
  const Icon = product.icon
  return <article className="product-card clay-surface"><button className={`product-art tone-${product.tone}`} aria-label={`${product.name} detayları`} onClick={open}><span className="product-label">{product.label}</span><span className="product-glyph"><Icon size={39} /></span><span className="product-art-ground" /><span className="product-coord">CRAFTSOLAR GOODS</span></button><div className="product-info"><div><small>{product.category}</small><button onClick={open}>{product.name}</button></div><button className="detail-button" aria-label={`${product.name} detayları`} onClick={open}><ArrowUpRight size={16} /></button></div><p>{product.description}</p><button className="product-add" onClick={add}><Plus size={15} /> Sepete ekle</button></article>
}

function ApplicationPage({ session, sessionReady, requireLogin, applications, error, submit, busy }) {
  const [form, setForm] = useState({ position: '', discord: '', experience: '', availability: '', motivation: '' })
  return <><PageBanner number="04" eyebrow="EKİBE KATIL" title={<>CraftSolar’da<br /><em>yerini al.</em></>} text="Topluluğa katkı sunmak istiyorsan başvurunu ilet. Başvurular admin panelinden incelenecek." /><section className="form-page"><div className="form-intro"><SectionLabel>YETKİLİ ALIMI</SectionLabel><h2>Nasıl yardımcı olursun?</h2><p>Başvuru göndermek için CraftSolar hesabınla giriş yap. Kullanıcı adın Minecraft nickinle aynı olmalı.</p><ul><li><Check />Başvurunu yönetim ekibi inceler.</li><li><Check />Durumu bu sayfadan takip edebilirsin.</li><li><Check />Gerçek iletişim bilgisi yerine Discord kullanıcı adını yaz.</li></ul>{applications.length > 0 && <div className="personal-records"><b>Başvurularım</b>{applications.map(application => <RecordRow key={application.id} title={application.position} meta={formatDate(application.createdAt)} status={application.status} reply={application.adminReply} />)}</div>}</div>{!sessionReady ? <FormLoading /> : !session ? <LoginPrompt title="Başvuru için giriş yap" text="Başvurun hesabındaki Minecraft nickine bağlanır." onLogin={requireLogin} /> : <form className="application-form glass-surface" onSubmit={event => { event.preventDefault(); submit(form) }}><div className="form-account"><UserRound /><span><small>MINECRAFT NICKİ</small><b>{session.username}</b></span></div><label>BAŞVURU ALANI<select value={form.position} onChange={event => setForm({ ...form, position: event.target.value })} required><option value="">Bir alan seç</option><option>Oyun içi yetkili</option><option>Topluluk moderatörü</option><option>Yapı ekibi</option></select></label><label>DISCORD KULLANICI ADI<input value={form.discord} onChange={event => setForm({ ...form, discord: event.target.value })} maxLength={48} placeholder="ornek_kullanici" required /></label><label>DENEYİMİN<textarea value={form.experience} onChange={event => setForm({ ...form, experience: event.target.value })} maxLength={1600} rows={3} placeholder="Daha önce neler yaptın?" required /></label><label>NE ZAMAN UYGUNSUN?<input value={form.availability} onChange={event => setForm({ ...form, availability: event.target.value })} maxLength={100} placeholder="Örn. Hafta içi akşamları" required /></label><label>NEDEN EKİBE KATILMAK İSTİYORSUN?<textarea value={form.motivation} onChange={event => setForm({ ...form, motivation: event.target.value })} maxLength={2400} rows={4} placeholder="Kısaca kendinden ve motivasyonundan bahset." required /></label>{error && <p className="inline-error" role="alert">{error}</p>}<button className="button button-sun form-submit" disabled={busy}>{busy ? 'Başvuru gönderiliyor…' : 'Başvuruyu gönder'} <ArrowRight size={16} /></button></form>}</section></>
}

function SupportPage({ session, sessionReady, tickets, requireLogin, busy, error, submit }) {
  const [form, setForm] = useState({ category: '', subject: '', message: '' })
  const [localError, setLocalError] = useState('')
  return <><PageBanner number="05" eyebrow="DESTEK MERKEZİ" title={<>Bir konuda<br /><em>yardım mı lazım?</em></>} text="Destek talebi oluştur. Ekibimiz talebini yönetim panelinden takip edecek." /><section className="support-layout"><div className="support-intro"><SectionLabel>DESTEK TALEBİ</SectionLabel><h2>Durumu<br />birlikte çözelim.</h2><p>Hesap, oyun içi ya da mağaza konusunda sorunu ayrıntılı anlat. Yanıtını Destek sayfasındaki taleplerinden takip edebilirsin.</p><div className="support-contact"><MessageCircle /><span><b>Topluluk desteği</b><a href={DISCORD} target="_blank" rel="noreferrer">Discord’da bize ulaş <ArrowUpRight size={13} /></a></span></div></div>{!sessionReady ? <FormLoading /> : !session ? <LoginPrompt title="Destek talebi için giriş yap" text="Talep geçmişin Minecraft hesabınla eşleştirilir." onLogin={requireLogin} /> : <form className="support-form glass-surface" onSubmit={async event => { event.preventDefault(); setLocalError(''); const created = await submit(form); if (created) setForm({ category: '', subject: '', message: '' }) }}><div className="form-account"><UserRound /><span><small>MINECRAFT NICKİ</small><b>{session.username}</b></span></div><label>KONU<select value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} required><option value="">Bir konu seç</option><option>Hesap</option><option>Oyun içi</option><option>Mağaza</option><option>Diğer</option></select></label><label>TALEP BAŞLIĞI<input value={form.subject} onChange={event => setForm({ ...form, subject: event.target.value })} maxLength={100} placeholder="Sorunu kısaca özetle" required /></label><label>AÇIKLAMA<textarea value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} minLength={12} maxLength={3000} rows={5} placeholder="Ne olduğunu ve ne zaman başladığını anlat." required /></label>{(localError || error) && <p className="inline-error" role="alert">{localError || error}</p>}<button className="button button-sun form-submit" disabled={busy}>{busy ? 'Talep gönderiliyor…' : 'Destek talebi gönder'} <ArrowRight size={16} /></button></form>}</section>{session && <section className="ticket-history"><SectionHeading label="HESABIM / DESTEK" title="Destek taleplerin" />{tickets.length ? <div className="ticket-list">{tickets.map(ticket => <RecordRow key={ticket.id} title={ticket.subject} meta={`${ticket.category} · ${formatDate(ticket.createdAt)}`} status={ticket.status} reply={ticket.replies?.at(-1)?.text} />)}</div> : <EmptyState icon={Ticket} title="Henüz destek talebin yok." text="Bir desteğe ihtiyaç olduğunda formu kullan." />}</section>}</>
}

function AccountPage({ session, sessionReady, orders, openAuth, navigate, signOut }) {
  if (!sessionReady) return <section className="account-empty"><FormLoading /></section>
  if (!session) return <section className="account-empty"><UserRound size={33} /><SectionLabel>CRAFTSOLAR HESABIN</SectionLabel><h1>Hesabına giriş yap.</h1><p>Başvurularını, destek taleplerini ve mağaza siparişlerini takip et.</p><div><button className="button button-sun" onClick={() => openAuth('login')}>Giriş yap</button><button className="button button-clay" onClick={() => openAuth('register')}>Hesap oluştur</button></div></section>
  return <><PageBanner number="06" eyebrow="HESABIM" title={<>Selam,<br /><em>{session.username}.</em></>} text="Başvurularını, destek taleplerini ve sipariş geçmişini ayrı sayfalarından takip et." action={<button className="button button-clay" onClick={signOut}>Oturumu kapat <ArrowRight size={15} /></button>} /><section className="account-hub"><SectionHeading label="HESAP MENÜSÜ" title="Nereye bakalım?" /><div className="account-shortcuts"><AccountShortcut icon={ShoppingBag} title="Siparişlerim" text={`${orders.length} mağaza siparişi`} onClick={() => navigate('siparislerim')} /><AccountShortcut icon={FileText} title="Yetkili başvurusu" text="Başvuru oluştur veya incele" onClick={() => navigate('yetkili-alimi')} /><AccountShortcut icon={Headphones} title="Destek taleplerim" text="Taleplerini ve durumlarını görüntüle" onClick={() => navigate('destek')} /></div></section></>
}

function AccountShortcut({ icon: Icon, title, text, onClick }) {
  return <button className="account-shortcut clay-surface" onClick={onClick}><Icon /><span><b>{title}</b><small>{text}</small></span><ArrowRight /></button>
}

function OrderPage({ session, sessionReady, orders, requireLogin }) {
  if (!sessionReady) return <section className="account-orders"><FormLoading /></section>
  if (!session) return <section className="account-empty"><ShoppingBag /><SectionLabel>SİPARİŞ GEÇMİŞİ</SectionLabel><h1>Giriş yapman gerekiyor.</h1><button className="button button-sun" onClick={requireLogin}>Giriş yap</button></section>
  return <><PageBanner number="07" eyebrow="HESABIM" title={<>Mağaza<br /><em>siparişlerin.</em></>} text="Siparişlerin oyun içi yetkililer tarafından kontrol edilip teslim edilir." /><section className="account-orders"><SectionHeading label="CRAFTSOLAR MAĞAZA" title="Sipariş geçmişi" />{orders.length ? orders.map(order => <RecordRow key={order.id} title={order.items.map(line => `${products.find(item => item.id === line.id)?.name} ×${line.quantity}`).join(', ')} meta={`${order.id} · ${formatDate(order.createdAt)}`} status={order.status} />) : <EmptyState icon={PackageCheck} title="Henüz sipariş yok." text="Mağazadan ürün seç, siparişin burada görünür." />}</section></>
}

function AuthDialog({ mode, setMode, busy, error, close, submit }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [passwordVisible, setPasswordVisible] = useState(false)
  return <div className="dialog-backdrop" onMouseDown={event => event.target === event.currentTarget && close()}><section className="auth-dialog glass-surface" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="close-icon dialog-close" aria-label="Pencereyi kapat" onClick={close}><X /></button><img src="/craftsolar-emblem.png" alt="" width="2048" height="2048" /><SectionLabel>CRAFTSOLAR / HESAP</SectionLabel><h2 id="auth-title">{mode === 'register' ? 'Dünyada yerini al.' : 'Tekrar hoş geldin.'}</h2><p>{mode === 'register' ? 'Minecraft nickinle hesabını oluştur.' : 'Sipariş, başvuru ve destek geçmişine ulaş.'}</p><div className="nick-reminder"><b><UserRound size={15} /> Minecraft nicki ile kayıt ol</b><span>Kullanıcı adın oyun içi nickinle birebir aynı olmalı. Teslimatlar bu isme yapılır.</span></div><form onSubmit={event => submit(event, form)}><label>MINECRAFT NICK<input autoComplete="username" maxLength={16} minLength={3} required value={form.username} onChange={event => setForm({ ...form, username: event.target.value })} placeholder="Oyundaki kullanıcı adın" /></label><label>ŞİFRE <span className="password-control"><input autoComplete={mode === 'register' ? 'new-password' : 'current-password'} type={passwordVisible ? 'text' : 'password'} minLength={8} maxLength={256} required value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="En az 8 karakter" /><button type="button" onClick={() => setPasswordVisible(!passwordVisible)}>{passwordVisible ? 'Gizle' : 'Göster'}</button></span></label>{error && <p className="inline-error" role="alert">{error}</p>}<button className="button button-sun form-submit" disabled={busy}>{busy ? 'İşleniyor…' : mode === 'register' ? 'Hesap oluştur' : 'Giriş yap'} <ArrowRight size={16} /></button></form><p className="auth-switch">{mode === 'register' ? 'Zaten hesabın var mı?' : 'CraftSolar’da yeni misin?'} <button onClick={() => { setForm({ username: '', password: '' }); setMode(mode === 'register' ? 'login' : 'register') }}>{mode === 'register' ? 'Giriş yap' : 'Hesap oluştur'}</button></p><small className="privacy-note">Hesaplar sunucu tarafında güvenli parola özetiyle saklanır.</small></section></div>
}

function CartDrawer({ cart, products: catalog, changeQuantity, close, checkout, busy, error, navigate }) {
  return <><button className="scrim" aria-label="Sepeti kapat" onClick={close} /><aside className="cart-drawer glass-surface" aria-label="Alışveriş sepeti"><div className="drawer-head"><div><SectionLabel>CRAFTSOLAR MAĞAZA</SectionLabel><h2>Sepetim <span>({cart.reduce((sum, line) => sum + line.quantity, 0)})</span></h2></div><button className="close-icon" aria-label="Kapat" onClick={close}><X /></button></div>{cart.length ? <><div className="drawer-items">{cart.map(line => { const item = catalog.find(product => product.id === line.id); if (!item) return null; const Icon = item.icon; return <article className="drawer-item" key={line.id}><span className={`drawer-item-icon tone-${item.tone}`}><Icon /></span><div><b>{item.name}</b><small>{item.category}</small><div className="quantity-stepper"><button aria-label={`${item.name} azalt`} onClick={() => changeQuantity(item.id, -1)}>−</button><span>{line.quantity}</span><button aria-label={`${item.name} artır`} onClick={() => changeQuantity(item.id, 1)}>+</button></div></div><button className="remove-item" aria-label={`${item.name} kaldır`} onClick={() => changeQuantity(item.id, -line.quantity)}><X size={14} /></button></article> })}</div><div className="drawer-bottom"><p><LockKeyhole size={14} /> Fiyatlar henüz belirlenmedi. Ödeme alınmaz.</p>{error && <p className="inline-error">{error}</p>}<button className="button button-sun form-submit" disabled={busy} onClick={checkout}>{busy ? 'Sipariş gönderiliyor…' : 'Sipariş talebi oluştur'} <ArrowRight size={16} /></button><small>{DELIVERY}</small></div></> : <div className="cart-empty"><ShoppingBag size={30} /><h3>Sepetin boş</h3><p>Mağazadan kasabana uygun ürün seç.</p><button className="button button-clay" onClick={() => { close(); navigate('magaza') }}>Mağazaya git</button></div>}</aside></>
}

function ProductDialog({ product, close, add }) {
  const Icon = product.icon
  return <div className="dialog-backdrop" onMouseDown={event => event.target === event.currentTarget && close()}><section className="product-dialog glass-surface" role="dialog" aria-modal="true" aria-labelledby="product-title"><button className="close-icon dialog-close" aria-label="Pencereyi kapat" onClick={close}><X /></button><div className={`dialog-art tone-${product.tone}`}><Icon size={46} /><span>{product.category} / CRAFTSOLAR</span></div><div className="dialog-content"><SectionLabel>{product.label}</SectionLabel><h2 id="product-title">{product.name}</h2><p>{product.description}</p><div className="dialog-note"><Truck size={16} />{DELIVERY}</div><button className="button button-sun" onClick={add}>Sepete ekle <Plus size={16} /></button><small>Fiyatlar belirlenene kadar ödeme alınmaz.</small></div></section></div>
}

function SubmissionDialog({ submission, close, navigate }) {
  const labels = { order: 'Sipariş talebin alındı.', application: 'Başvurun alındı.', support: 'Destek talebin oluşturuldu.' }
  const targets = { order: 'siparislerim', application: 'yetkili-alimi', support: 'destek' }
  return <div className="dialog-backdrop"><section className="success-dialog glass-surface" role="dialog" aria-modal="true"><button className="close-icon dialog-close" aria-label="Pencereyi kapat" onClick={close}><X /></button><span className="success-check"><Check size={28} /></span><SectionLabel>CRAFTSOLAR / KAYIT</SectionLabel><h2>{labels[submission.type]}</h2><p>Bilgilerin sunucuya kaydedildi. {submission.data.id && <span>Kayıt numarası: {submission.data.id.slice(0, 8)}</span>}</p><button className="button button-sun form-submit" onClick={() => { close(); navigate(targets[submission.type]) }}>Devam et <ArrowRight size={16} /></button></section></div>
}

function LoginPrompt({ title, text, onLogin }) {
  return <div className="login-prompt clay-surface"><LockKeyhole /><h2>{title}</h2><p>{text}</p><button className="button button-sun" onClick={onLogin}>Giriş yap / hesap oluştur <ArrowRight size={15} /></button></div>
}

function FormLoading() { return <div className="form-loading"><span className="spinner" />Hesap bilgileri yükleniyor…</div> }
function RecordRow({ title, meta, status, onStatus, reply }) {
  return <article className="record-row"><span className="record-icon"><FileText size={17} /></span><div className="record-content"><b>{title}</b><small>{meta}</small>{reply && <p className="user-reply">Yetkili yanıtı: {reply}</p>}</div><span className={`record-status status-${statusKey(status)}`}>{status}</span>{onStatus && <select aria-label={`${title} durumunu değiştir`} value={status} onChange={event => onStatus(event.target.value)}>{onStatus.options.map(option => <option key={option}>{option}</option>)}</select>}</article>
}

function statusKey(value = '') { return value.toLowerCase().replaceAll(' ', '-').replaceAll('ı', 'i').replaceAll('ü', 'u').replaceAll('ş', 's').replaceAll('ö', 'o').replaceAll('ç', 'c') }
function formatDate(value) { return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) }

function EmptyState({ icon: Icon, title, text }) {
  return <div className="empty-state clay-surface"><Icon size={25} /><h2>{title}</h2><p>{text}</p></div>
}

function Callout({ navigate, showImage = true }) {
  return <section className="callout clay-surface">{showImage && <img src="/craftsolar-emblem.png" alt="" width="2048" height="2048" />}<div><SectionLabel>SENİ BEKLİYORUZ</SectionLabel><h2>Güneşin altında yerini al.</h2><p>Sunucuya katıl, kendi Towny hikâyeni başlat.</p></div><button className="button button-sun" onClick={() => navigate('rehber')}>Nasıl katılırım? <ArrowRight size={15} /></button></section>
}

function NotFound({ navigate }) {
  return <section className="account-empty"><Globe2 /><SectionLabel>HARİTA DIŞI</SectionLabel><h1>Bu sayfa burada yok.</h1><button className="button button-sun" onClick={() => navigate('home')}>Anasayfaya dön</button></section>
}

function Footer({ navigate }) {
  return <footer className="footer"><div className="footer-main"><a href="#/home" className="footer-brand"><img src="/craftsolar-emblem.png" alt="" width="2048" height="2048" /><span>CRAFT<span>SOLAR</span><small>GERÇEK TOWNY DENEYİMİ</small></span></a><p>Kendi kasabanı kur, ulusunu büyüt ve kıtanın tek hâkimi ol.</p><a className="footer-discord" href={DISCORD} target="_blank" rel="noreferrer">Discord’a katıl <ArrowUpRight size={15} /></a></div><div className="footer-links"><span>CRAFTSOLAR TOWNY</span><button onClick={() => navigate('towny')}>Towny dünyası</button><button onClick={() => navigate('rehber')}>Başlangıç rehberi</button><button onClick={() => navigate('magaza')}>Mağaza</button><button onClick={() => navigate('yetkili-alimi')}>Yetkili alımı</button><button onClick={() => navigate('destek')}>Destek</button></div><div className="footer-bottom"><span>© 2026 CRAFTSOLAR TOWNY</span><span>Bağımsız bir Minecraft sunucusudur, Mojang Studios ile bağlantılı değildir.</span></div></footer>
}

function AdminPage({ session, sessionReady, signIn, signOut, theme, setTheme }) {
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('applications')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [pageError, setPageError] = useState('')
  const [announcementForm, setAnnouncementForm] = useState({ text: '', background: '#f0ae42', color: '#17202a', fontSize: 14, enabled: true, welcomeText: '' })

  const refresh = async () => {
    setPageError('')
    try { const result = await api('/api/admin'); setData(result); setAnnouncementForm({ ...(result.announcement || { text: '', background: '#f0ae42', color: '#17202a', fontSize: 14, enabled: true }), welcomeText: result.welcomeNotice || '' }) } catch (reason) { setPageError(reason.message) }
  }
  useEffect(() => { if (session?.role === 'admin') refresh() }, [session])
  const login = async event => {
    event.preventDefault()
    setBusy(true)
    setLoginError('')
    try { await signIn(password) }
    catch (reason) { setLoginError(reason.message) }
    finally { setBusy(false) }
  }
  const changeStatus = async (collection, record, status) => {
    setBusy(true)
    setPageError('')
    try { await api('/api/admin', { method: 'PATCH', body: JSON.stringify({ collection, id: record.id, status }) }); await refresh() }
    catch (reason) { setPageError(reason.message) }
    finally { setBusy(false) }
  }
  const adminAction = async (payload, method = 'PATCH') => {
    setBusy(true)
    setPageError('')
    try { await api('/api/admin', { method, body: JSON.stringify(payload) }); await refresh() }
    catch (reason) { setPageError(reason.message) }
    finally { setBusy(false) }
  }
  const replyRecord = async (collection, record, reply, status) => {
    setBusy(true)
    setPageError('')
    try { await api('/api/admin', { method: 'PATCH', body: JSON.stringify({ action: 'reply', collection, id: record.id, reply, status }) }); await refresh() }
    catch (reason) { setPageError(reason.message) }
    finally { setBusy(false) }
  }
  const removeRecord = async (collection, record) => {
    if (!confirm('Bu destek veya başvuru kaydı kalıcı olarak silinsin mi?')) return
    await adminAction({ action: 'delete-record', collection, id: record.id })
  }

  if (!sessionReady) return <main className="admin-page"><FormLoading /></main>
  if (session?.role !== 'admin') return <main className="admin-page"><div className="admin-login-panel glass-surface"><a href="#/home" className="brand"><img src="/craftsolar-emblem.png" alt="" width="2048" height="2048" /><span>CRAFT<span>SOLAR</span><small>YÖNETİM</small></span></a><SectionLabel>YÖNETİCİ OTURUMU</SectionLabel><h1>Kontrol merkezine gir.</h1><p>Bu giriş, gizli sayfa yoluna ek olarak yönetici parolası ister.</p><form autoComplete="off" onSubmit={login}><label>YÖNETİCİ PAROLASI<input type="password" autoComplete="new-password" name="management-passcode" data-1p-ignore="true" data-lpignore="true" data-bwignore="true" value={password} onChange={event => setPassword(event.target.value)} required /></label>{loginError && <p className="inline-error" role="alert">{loginError}</p>}<button className="button button-sun form-submit" disabled={busy}>{busy ? 'Kontrol ediliyor…' : 'Giriş yap'} <ArrowRight size={16} /></button></form><a className="admin-home-link" href="#/home">Anasayfaya dön</a></div></main>

  const records = data && Array.isArray(data[tab]) ? data[tab] : []
  const filtered = records.filter(record => `${record.username} ${record.position || ''} ${record.subject || ''} ${record.category || ''} ${record.items?.map(item => products.find(product => product.id === item.id)?.name).join(' ') || ''}`.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr')))
  const tabs = [
    { id: 'applications', label: 'Yetkili başvuruları', icon: FileText, count: data?.applications?.length || 0 },
    { id: 'support', label: 'Destek talepleri', icon: Headphones, count: data?.support?.length || 0 },
    { id: 'orders', label: 'Mağaza siparişleri', icon: ShoppingBag, count: data?.orders?.length || 0 },
    { id: 'users', label: 'Kullanıcılar', icon: UsersRound, count: data?.users?.length || 0 }
    ,{ id: 'announcement', label: 'Duyuru bandı', icon: Megaphone, count: data?.announcement?.enabled ? 1 : 0 }
  ]
  return <main className="admin-page"><header className="admin-top"><a href="#/home" className="brand"><img src="/craftsolar-emblem.png" alt="" width="2048" height="2048" /><span>CRAFT<span>SOLAR</span><small>YÖNETİM</small></span></a><div><button type="button" className="tool-button theme-button" aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button><button type="button" className="button button-clay" onClick={signOut}>Oturumu kapat <X size={15} /></button></div></header><div className="admin-layout"><aside className="admin-sidebar clay-surface"><SectionLabel>YÖNETİM</SectionLabel>{tabs.map(item => { const Icon = item.icon; return <button type="button" key={item.id} className={tab === item.id ? 'admin-tab admin-tab-active' : 'admin-tab'} onClick={() => { setTab(item.id); setQuery('') }}><Icon size={16} /><span>{item.label}</span><b>{item.count}</b></button> })}<button type="button" className="admin-refresh" onClick={refresh}><ArrowDown size={14} /> Verileri yenile</button></aside><section className="admin-main"><div className="admin-title"><div><SectionLabel>CRAFTSOLAR / KONTROL MERKEZİ</SectionLabel><h1>{tabs.find(item => item.id === tab)?.label}</h1></div>{tab !== 'announcement' && <label className="admin-search"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Kayıt ara" /></label>}</div>{pageError && <p className="inline-error" role="alert">{pageError}</p>}{tab === 'announcement' ? <form className="admin-config clay-surface" onSubmit={event => { event.preventDefault(); adminAction({ action: 'announcement', ...announcementForm }) }}><SectionLabel>HERKES İÇİN SABİT DUYURU BANDI</SectionLabel><p>Üst menünün üzerinde kayan metin olarak görünür.</p><label>DUYURU METNİ<textarea rows="3" maxLength="180" value={announcementForm.text} onChange={event => setAnnouncementForm({ ...announcementForm, text: event.target.value })} placeholder="Örn. Hafta sonuna özel mağaza indirimi başladı" /></label><div className="admin-config-grid"><label>ARKA PLAN<input type="color" value={announcementForm.background} onChange={event => setAnnouncementForm({ ...announcementForm, background: event.target.value })} /></label><label>YAZI RENGİ<input type="color" value={announcementForm.color} onChange={event => setAnnouncementForm({ ...announcementForm, color: event.target.value })} /></label><label>YAZI BOYUTU<input type="number" min="12" max="24" value={announcementForm.fontSize} onChange={event => setAnnouncementForm({ ...announcementForm, fontSize: Number(event.target.value) })} /></label><label className="admin-check"><input type="checkbox" checked={announcementForm.enabled} onChange={event => setAnnouncementForm({ ...announcementForm, enabled: event.target.checked })} /> Yayında</label></div><label>HERKES İÇİN GİRİŞ MESAJI<textarea rows="3" maxLength="1000" value={announcementForm.welcomeText} onChange={event => setAnnouncementForm({ ...announcementForm, welcomeText: event.target.value })} placeholder="Siteye giren herkese gösterilecek duyuru" /></label><button type="submit" className="button button-sun" disabled={busy}><Check size={15} /> Duyuruları kaydet</button><button type="button" className="button button-clay" disabled={busy} onClick={() => { const blank = { text: '', background: '#f0ae42', color: '#17202a', fontSize: 14, enabled: false, welcomeText: '' }; setAnnouncementForm(blank); adminAction({ action: 'announcement', ...blank }) }}>Duyuruları kaldır</button></form> : tab === 'users' ? (filtered.length ? <div className="admin-user-grid">{filtered.map(user => <AdminUserCard key={user.username} user={user} busy={busy} action={adminAction} />)}</div> : <EmptyState icon={UsersRound} title="Henüz kayıtlı kullanıcı yok." text="Hesaplar oluşturuldukça burada listelenir." />) : <AdminRecords collection={tab} records={filtered} busy={busy} changeStatus={changeStatus} replyRecord={replyRecord} removeRecord={removeRecord} />}</section></div></main>
}

function AdminUserCard({ user, busy, action }) {
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState('0')
  const [notice, setNotice] = useState(user.notice?.text || '')
  const [deleteReason, setDeleteReason] = useState('')
  const [actionError, setActionError] = useState('')
  const performBan = () => {
    if (reason.trim().length < 3) return setActionError('Banlamak için en az 3 karakterlik gerekçe yaz.')
    setActionError('')
    action({ action: 'user', operation: 'ban', username: user.username, reason, duration })
  }
  const performDelete = () => {
    if (deleteReason.trim().length < 3) return setActionError('Silme gerekçesini en az 3 karakterle yaz.')
    if (!confirm(`${user.username} hesabı silinsin mi? Gerekçe kullanıcıya gösterilir.`)) return
    setActionError('')
    action({ action: 'user', operation: 'delete', username: user.username, reason: deleteReason })
  }
  return <article className="admin-user-card clay-surface"><div className="admin-user"><span>{user.username.slice(0, 1).toUpperCase()}</span><div><b>{user.username}</b><small>Kayıt: {formatDate(user.createdAt)}</small></div></div>{user.ban && <p className="user-ban-state">Banlı · {user.ban.reason}{user.ban.until ? ` · ${new Date(user.ban.until).toLocaleString('tr-TR')} bitiş` : ' · Süresiz'}</p>}<label>HESABA ÖZEL MESAJ<textarea rows="2" maxLength="1000" value={notice} onChange={event => setNotice(event.target.value)} placeholder="Bu kullanıcı giriş yapınca göreceği mesaj" /></label><div className="admin-actions"><button type="button" className="button button-clay" disabled={busy} onClick={() => action({ action: 'user', operation: 'notice', username: user.username, text: notice })}><BellRing size={14} /> Mesajı kaydet</button>{user.ban ? <button type="button" className="button button-clay" disabled={busy} onClick={() => action({ action: 'user', operation: 'unban', username: user.username })}>Banı kaldır</button> : <><input className="admin-reason" value={reason} onChange={event => { setReason(event.target.value); setActionError('') }} placeholder="Ban gerekçesi" /><select value={duration} onChange={event => setDuration(event.target.value)}><option value="0">Süresiz</option><option value="1">1 saat</option><option value="24">1 gün</option><option value="168">7 gün</option><option value="720">30 gün</option></select><button type="button" className="button button-clay" disabled={busy} onClick={performBan}><Ban size={14} /> Banla</button></>}<input className="admin-reason" value={deleteReason} onChange={event => { setDeleteReason(event.target.value); setActionError('') }} placeholder="Hesap silme gerekçesi" /><button type="button" className="button button-danger" disabled={busy} onClick={performDelete}><Trash2 size={14} /> Hesabı sil</button></div>{actionError && <p className="inline-error" role="alert">{actionError}</p>}</article>
}

function AdminRecords({ collection, records, busy, changeStatus, replyRecord, removeRecord }) {
  if (!records.length) return <EmptyState icon={collection === 'support' ? Headphones : collection === 'orders' ? ShoppingBag : FileText} title="Bu bölümde kayıt yok." text="Yeni kayıtlar geldikçe burada görünecek." />
  const availableStatuses = { applications: ['Bekliyor', 'İnceleniyor', 'Kabul Edildi', 'Reddedildi'], support: ['Açık', 'Yanıtlandı', 'Kapandı'], orders: ['Bekliyor', 'Teslim Edildi'] }
  return <div className="admin-records">{records.map(record => {
    const title = collection === 'applications' ? `${record.username} · ${record.position}` : collection === 'support' ? record.subject : record.items.map(item => `${products.find(product => product.id === item.id)?.name} ×${item.quantity}`).join(', ')
    const details = collection === 'applications' ? [record.discord, record.availability, record.experience, record.motivation] : collection === 'support' ? [record.username, record.category, record.message] : [record.username, record.id]
    return <article className="admin-record clay-surface" key={record.id}><div className="admin-record-head"><div><span className="record-id">{record.id.slice(0, 8)}</span><h2>{title}</h2><small>{formatDate(record.createdAt)}</small></div><label className={`status-select status-${statusKey(record.status)}`}><select aria-label={`${title} durumunu değiştir`} value={record.status} disabled={busy} onChange={event => changeStatus(collection, record, event.target.value)}>{availableStatuses[collection].map(status => <option key={status}>{status}</option>)}</select><ChevronDown size={13} /></label></div><div className="admin-record-details">{details.filter(Boolean).map((value, index) => <p key={`${record.id}-${index}`}>{value}</p>)}</div>{collection === 'support' && <div className="record-replies">{(record.replies || []).map((reply, index) => <p key={index}><b>Yetkili yanıtı:</b> {reply.text}</p>)}</div>}{collection === 'applications' && record.adminReply && <div className="record-replies"><p><b>Başvuru yanıtı:</b> {record.adminReply}</p></div>}{(collection === 'support' || collection === 'applications') && <><ReplyBox busy={busy} onSend={(reply, status) => replyRecord(collection, record, reply, status)} /><button type="button" className="button button-danger record-delete" disabled={busy} onClick={() => removeRecord(collection, record)}><Trash2 size={14} /> Kaydı sil</button></>}</article>
  })}</div>
}

function ReplyBox({ busy, onSend }) {
  const [reply, setReply] = useState('')
  return <form className="admin-reply" onSubmit={event => { event.preventDefault(); onSend(reply); setReply('') }}><textarea rows="2" maxLength="3000" value={reply} onChange={event => setReply(event.target.value)} placeholder="Oyuncuya yanıt yaz" required /><button className="button button-sun" disabled={busy}><Send size={14} /> Yanıtla</button></form>
}

class SiteErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) return <main className="admin-page"><section className="admin-login-panel glass-surface"><SectionLabel>CRAFTSOLAR / YÖNETİM</SectionLabel><h1>Panel yüklenemedi.</h1><p>Panelde görüntüleme hatası oluştu. Yenileyip tekrar giriş yap.</p><button className="button button-sun form-submit" onClick={() => location.reload()}>Sayfayı yenile <ArrowRight size={16} /></button></section></main>
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(<SiteErrorBoundary><App /></SiteErrorBoundary>)

