import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Copy, Crown, Globe2, Landmark, LockKeyhole, Menu, Minus, PackageCheck, Plus, Shield, ShoppingBag, ShoppingCart, Swords, Trash2, Truck, UserRound, UsersRound, X, Zap } from 'lucide-react'
import './style.css'

const IP = 'craftsolar.redstone.tr:25567'
const DISCORD = 'https://discord.gg/X86xYYw73N'
const ADMIN_ROUTE = '#/cs-yonetim-7f3c9a2e-archive'
const DELIVERY = 'Satın alınan tüm eşyalar ve rütbeler oyun içi yetkililer tarafından kontrol edilip teslim edilecektir.'
const products = [
  { id: 'vip', name: 'VIP', price: 10, category: 'Rütbeler', tag: 'Başlangıç', description: 'Kasabana ilk adımı atarken küçük ayrıcalıklar ve özel bir isim rengi.', perks: ['VIP sohbet etiketi', 'Özel giriş duyurusu', 'Kasabana uygun başlangıç ayrıcalıkları'], icon: Crown, art: 'rank rank-bronze' },
  { id: 'solar', name: 'SOLAR', price: 15, category: 'Rütbeler', tag: 'Popüler', description: 'Güneşin gücünü taşıyan, maceranda sana eşlik eden orta seviye rütbe.', perks: ['SOLAR sohbet etiketi', 'VIP ayrıcalıkları', 'Ek günlük ödül'], icon: Zap, art: 'rank rank-sun' },
  { id: 'solar-plus', name: 'SOLAR+', price: 20, category: 'Rütbeler', tag: 'Üst rütbe', description: 'CraftSolar koleksiyonunun en parlak rütbesi. Her avantaj tek pakette.', perks: ['SOLAR+ sohbet etiketi', 'SOLAR ayrıcalıkları', 'Özel kozmetik efekt'], icon: Crown, art: 'rank rank-plus' },
  { id: 'spider', name: 'Örümcek Kılıç', price: 35, category: 'Silahlar', tag: 'Özel eşya', description: 'Örümceklerin karanlık mağaralarından ilham alan özel bir kılıç.', perks: ['Örümcek temalı özel isim', 'Towny savaşlarına hazır', 'Oyun içi yetkili teslimatı'], icon: Swords, art: 'weapon weapon-violet' },
  { id: 'weakness', name: 'Zayıflık Kılıç', price: 40, category: 'Silahlar', tag: 'Özel eşya', description: 'Rakibinin hızını kesen, zayıflık etkisiyle anılan özel kılıç.', perks: ['Zayıflık temalı özel isim', 'Towny savaşlarına hazır', 'Oyun içi yetkili teslimatı'], icon: Swords, art: 'weapon weapon-mint' },
  { id: 'lightning', name: 'Şimşek Kılıç', price: 45, category: 'Silahlar', tag: 'Özel eşya', description: 'Bir şimşek gibi hızlı. Envanterinde gözden kaçması imkânsız.', perks: ['Şimşek temalı özel isim', 'Towny savaşlarına hazır', 'Oyun içi yetkili teslimatı'], icon: Zap, art: 'weapon weapon-blue' },
  { id: 'prot5', name: 'Koruma 5 Netherite Set', price: 50, category: 'Setler', tag: 'Zırh seti', description: 'Sınırda ve kuşatma alanında dayanıklılığını artıracak netherite zırh seti.', perks: ['Koruma V büyüsü', 'Tam netherite zırh seti', 'Oyun içi yetkili teslimatı'], icon: Shield, art: 'armor armor-purple' },
  { id: 'prot6', name: 'Koruma 6 Netherite Set', price: 55, category: 'Setler', tag: 'Komutan seçimi', description: 'Kıtanın en zorlu çatışmaları için hazırlanmış, üst seviye zırh seti.', perks: ['Koruma VI büyüsü', 'Tam netherite zırh seti', 'Oyun içi yetkili teslimatı'], icon: Shield, art: 'armor armor-amber' }
]
const features = [
  { no: '01', title: 'Sınırları yeniden çiz', name: 'Gerçek dünya haritası', text: 'Tanıdık coğrafyada kasabanı kur. Stratejik bölgeleri tut, ticaret yollarını kendi lehine çevir.', icon: Globe2, className: 'feature-map' },
  { no: '02', title: 'Emek, gerçek değer', name: 'Oyuncu ekonomisi', text: 'Üret, pazarlık yap ve büyü. P2W yok; ekonominin dengesi oyuncuların elinde.', icon: Landmark, className: 'feature-economy' },
  { no: '03', title: 'Dostun kim, sınırın nerede?', name: 'Kuşatma ve diplomasi', text: 'İttifak imzala, savaş ilan et ya da barışla sınırlarını güvenceye al.', icon: Swords, className: 'feature-war' },
  { no: '04', title: 'Her saniye akıcı', name: 'Kesintisiz oyun', text: 'Güçlü altyapıda PvP, şehir hayatı ve etkinlikler aynı dünyada buluşuyor.', icon: Zap, className: 'feature-performance' },
  { no: '05', title: 'Takvimde yerini al', name: 'Düzenli etkinlikler', text: 'Haftalık turnuvalar, KoTH savaşları ve sürpriz çekilişlerde yerini al.', icon: UsersRound, className: 'feature-events' }
]
const readStore = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
const money = value => `${value} TL`

function App() {
  const [users, setUsers] = useState(() => readStore('craftsolar-users', []))
  const [orders, setOrders] = useState(() => readStore('craftsolar-orders', []))
  const [session, setSession] = useState(() => readStore('craftsolar-session', null))
  const [cart, setCart] = useState(() => readStore('craftsolar-cart', []))
  const [activeCategory, setActiveCategory] = useState('Tümü')
  const [selected, setSelected] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('register')
  const [profileOpen, setProfileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [route, setRoute] = useState(location.hash)
  const [query, setQuery] = useState('')
  const [authError, setAuthError] = useState('')
  const [form, setForm] = useState({ username: '', password: '' })

  useEffect(() => { localStorage.setItem('craftsolar-users', JSON.stringify(users)) }, [users])
  useEffect(() => { localStorage.setItem('craftsolar-orders', JSON.stringify(orders)) }, [orders])
  useEffect(() => { localStorage.setItem('craftsolar-session', JSON.stringify(session)) }, [session])
  useEffect(() => { localStorage.setItem('craftsolar-cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => {
    const update = () => setRoute(location.hash)
    addEventListener('hashchange', update)
    return () => removeEventListener('hashchange', update)
  }, [])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const filtered = useMemo(() => products.filter(item => (activeCategory === 'Tümü' || item.category === activeCategory) && item.name.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'))), [activeCategory, query])
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0)
  const total = cart.reduce((sum, line) => sum + products.find(item => item.id === line.id).price * line.quantity, 0)
  const mine = orders.filter(order => order.username === session?.username)
  const isAdmin = route === ADMIN_ROUTE

  const addToCart = id => {
    setCart(current => current.some(line => line.id === id) ? current.map(line => line.id === id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { id, quantity: 1 }])
    setToast('Ürün sepete eklendi')
    setSelected(null)
  }
  const changeQuantity = (id, amount) => setCart(current => current.map(line => line.id === id ? { ...line, quantity: line.quantity + amount } : line).filter(line => line.quantity > 0))
  const copyIp = async () => {
    try {
      await navigator.clipboard.writeText(IP)
      setCopied(true)
      setToast('IP adresi kopyalandı')
      setTimeout(() => setCopied(false), 1800)
    } catch { setToast(IP) }
  }
  const openAuth = mode => {
    setAuthMode(mode)
    setAuthError('')
    setForm({ username: '', password: '' })
    setAuthOpen(true)
    setProfileOpen(false)
  }
  const submitAuth = event => {
    event.preventDefault()
    const username = form.username.trim()
    if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) return setAuthError('Minecraft nicki 3–16 karakter olmalı; harf, rakam ve _ kullanabilirsin.')
    if (form.password.length < 4) return setAuthError('Şifre en az 4 karakter olmalı.')
    const found = users.find(user => user.username.toLowerCase() === username.toLowerCase())
    if (authMode === 'register') {
      if (found) return setAuthError('Bu Minecraft nickiyle bir hesap zaten var.')
      setUsers(current => [...current, { username, password: form.password, createdAt: new Date().toISOString() }])
      setSession({ username })
      setToast(`Hoş geldin, ${username}`)
    } else {
      if (!found || found.password !== form.password) return setAuthError('Minecraft nicki veya şifre hatalı.')
      setSession({ username: found.username })
      setToast(`Tekrar hoş geldin, ${found.username}`)
    }
    setAuthOpen(false)
  }
  const checkout = () => {
    if (!session) {
      setCartOpen(false)
      openAuth('login')
      return
    }
    if (!cart.length || busy) return
    setBusy(true)
    setTimeout(() => {
      const order = { id: `CS-${Date.now().toString(36).toUpperCase()}`, username: session.username, items: cart.map(line => ({ ...line })), total, createdAt: new Date().toISOString(), status: 'Bekliyor' }
      setOrders(current => [order, ...current])
      setCart([])
      setBusy(false)
      setCartOpen(false)
      setNotice(order)
    }, 1500)
  }
  const logout = () => {
    setSession(null)
    setProfileOpen(false)
    setToast('Oturum kapatıldı')
  }
  const setOrderStatus = (id, status) => setOrders(current => current.map(order => order.id === id ? { ...order, status } : order))
  const scrollTo = id => {
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return <>
    {isAdmin ? <AdminView users={users} orders={orders} setOrderStatus={setOrderStatus} /> : <>
      <div className="announcement"><span className="live-dot" />Yeni dünyaya hazır mısın? <a href={DISCORD} target="_blank" rel="noreferrer">Discord’a katıl <ArrowUpRight size={13} /></a></div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="CraftSolar ana sayfa"><span className="brand-mark"><img src="/craftsolar-emblem.png" alt="" /></span><span className="brand-name">CRAFT<span>SOLAR</span><small>TOWNY • 2026</small></span></a>
        <nav className={mobileOpen ? 'main-nav nav-open' : 'main-nav'}>
          <button onClick={() => scrollTo('world')}>Dünya</button><button onClick={() => scrollTo('store')}>Mağaza</button><button onClick={() => scrollTo('about')}>Sunucu</button>
          <a className="nav-discord" href={DISCORD} target="_blank" rel="noreferrer">Discord <ArrowUpRight size={14} /></a>
        </nav>
        <div className="header-actions">
          <button className="icon-button cart-trigger" aria-label="Sepeti aç" onClick={() => setCartOpen(true)}><ShoppingCart size={18} />{cartCount > 0 && <span className="cart-count">{cartCount}</span>}</button>
          {session ? <div className="profile-wrap"><button className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)}><span className="avatar">{session.username.slice(0, 1).toUpperCase()}</span><span className="profile-name">{session.username}</span><ChevronDown size={14} /></button>{profileOpen && <div className="profile-menu"><div className="profile-menu-head">Hesabın <strong>{session.username}</strong></div><button onClick={() => { setProfileOpen(false); scrollTo('my-orders') }}>Siparişlerim <span>{mine.length}</span></button><button className="logout-button" onClick={logout}>Oturumu kapat</button></div>}</div> : <button className="login-button" onClick={() => openAuth('login')}><UserRound size={16} /><span>Giriş yap</span></button>}
          <button className="mobile-menu-button" aria-label="Menüyü aç" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</button>
        </div>
      </header>
      <main id="top">
        <section className="hero">
          <div className="hero-art"><img src="/craftsolar-banner.png" alt="Gün batımında CraftSolar Towny dünyası" /><div className="hero-art-shade" /><div className="hero-coordinate">WORLD / 01 <span>39° 55′ 00″ N</span></div><div className="hero-caption">KITA SINIRLARININ ÖTESİNDE</div></div>
          <div className="hero-content"><div className="eyebrow"><span /> YENİ BİR DÜNYA, SENİN HİKÂYEN</div><h1>Kendi kasabanı kur.<br /><span>Güneşin altındaki</span><br />yerini al.</h1><p>Kıtalar çiz, ulusunu büyüt, gerçek dünyada hüküm sür. CraftSolar’da haritanın bir köşesi senin adını bekliyor.</p><div className="hero-buttons"><button className="button button-gold" onClick={() => scrollTo('store')}>Dünyaya adım at <ArrowRight size={17} /></button><button className="button button-outline" onClick={copyIp}><Copy size={16} />{copied ? 'Kopyalandı' : IP}</button></div><div className="hero-footnote"><span className="pulse-dot" />TOWNY SUNUCUSU <i /> TÜM SÜRÜMLER UYGUN</div></div>
          <div className="hero-side-note"><span>CS / 01</span><i />SINIRLARINI ÇİZ</div>
          <a className="scroll-cue" href="#world" aria-label="Aşağı kaydır"><ArrowDown size={15} /></a>
        </section>
        <section className="world-strip" id="world"><div className="strip-intro"><span className="section-index">01 / DÜNYA</span><h2>Harita büyük.<br /><em>Hikâye senin.</em></h2><p>Bir kasaba ile başlar. Sonrası verdiğin kararlar.</p><a className="text-link" href={DISCORD} target="_blank" rel="noreferrer">Topluluğa katıl <ArrowUpRight size={15} /></a></div><div className="feature-list">{features.map(({ no, title, name, text, icon: Icon, className }) => <article className={`feature-row ${className}`} key={no}><span className="feature-no">{no}</span><div className="feature-copy"><h3>{name}</h3><p>{text}</p></div><span className="feature-stamp">{title}</span><Icon className="feature-icon" size={24} strokeWidth={1.5} /></article>)}</div><div className="map-coordinate">TOWNY ATLAS <span>CS–WORLD / 01</span></div></section>
        <section className="store-section" id="store"><div className="store-heading"><div><span className="section-index">02 / PAZAR YERİ</span><h2>Kasabana güç kat.</h2><p>Oyun içi teslimat yetkililer tarafından yapılır. Sepete ekle, siparişini oluştur.</p></div><button className="store-cart-button" onClick={() => setCartOpen(true)}><ShoppingBag size={17} /> Sepetim <span>{cartCount}</span></button></div><div className="store-toolbar"><div className="category-tabs">{['Tümü', 'Rütbeler', 'Silahlar', 'Setler'].map(category => <button key={category} className={activeCategory === category ? 'category-tab active' : 'category-tab'} onClick={() => setActiveCategory(category)}>{category}</button>)}</div><label className="store-search"><span>ARA</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Ürün bul" /><ChevronDown size={14} /></label></div><div className="product-grid">{filtered.map(product => <ProductCard key={product.id} product={product} onSelect={() => setSelected(product)} onAdd={() => addToCart(product.id)} />)}</div><div className="delivery-note"><span className="delivery-icon"><Truck size={20} /></span><div><strong>Oyun içi teslimat</strong><p>{DELIVERY}</p></div><CircleHelp size={17} className="help-icon" /></div></section>
        {session && <section className="orders-section" id="my-orders"><div className="orders-heading"><div><span className="section-index">03 / HESABIM</span><h2>Siparişlerin</h2></div><span className="orders-count">{mine.length} SİPARİŞ</span></div>{mine.length ? <div className="my-orders">{mine.map(order => <OrderRow key={order.id} order={order} />)}</div> : <div className="empty-orders">Henüz siparişin yok. İlk adım mağazada.</div>}</section>}
        <section className="join-section" id="about"><div className="join-grid" /><div className="join-copy"><span className="section-index">04 / BULUŞMA NOKTASI</span><h2>Yeni bir kıta.<br /><em>Tanıdık bir blok.</em></h2><p>Kasabanı kuracağın yer hazır. Şimdi sıra sende.</p><a className="button button-gold" href={DISCORD} target="_blank" rel="noreferrer">Discord’da buluşalım <ArrowUpRight size={17} /></a></div><div className="join-server"><span className="server-label"><span className="live-dot" /> SUNUCU ADRESİ</span><button onClick={copyIp}>{IP}<Copy size={15} /></button><span className="server-version">JAVA EDITION <i /> 1.16.5 — 1.21+</span></div></section>
      </main>
      <footer className="site-footer"><a className="footer-brand" href="#top">CRAFT<span>SOLAR</span></a><span>Bir kasaba kur. Bir kıta değiştir.</span><span className="footer-year">© 2026 CRAFTSOLAR TOWNY</span></footer>
    </>}

    {cartOpen && <><button className="scrim" aria-label="Sepeti kapat" onClick={() => setCartOpen(false)} /><aside className="cart-drawer"><div className="drawer-head"><div><span className="section-index">PAZAR YERİ</span><h2>Sepetim <small>({cartCount})</small></h2></div><button className="close-button" aria-label="Kapat" onClick={() => setCartOpen(false)}><X /></button></div>{cart.length ? <><div className="cart-lines">{cart.map(line => { const item = products.find(product => product.id === line.id); return <div className="cart-line" key={line.id}><div className={`cart-thumb ${item.art}`}><item.icon size={22} /></div><div className="cart-line-info"><strong>{item.name}</strong><span>{money(item.price)} / adet</span><div className="quantity-control"><button aria-label="Azalt" onClick={() => changeQuantity(line.id, -1)}><Minus size={13} /></button><span>{line.quantity}</span><button aria-label="Artır" onClick={() => changeQuantity(line.id, 1)}><Plus size={13} /></button></div></div><div className="cart-line-total"><strong>{money(item.price * line.quantity)}</strong><button aria-label="Ürünü kaldır" onClick={() => setCart(current => current.filter(row => row.id !== line.id))}><Trash2 size={14} /></button></div></div> })}</div><div className="drawer-bottom"><p className="demo-payment-note"><LockKeyhole size={15} /> Bu bir demo sipariştir. Gerçek ödeme alınmaz.</p><div className="cart-total"><span>Toplam</span><strong>{money(total)}</strong></div><button className="button button-gold checkout-button" onClick={checkout} disabled={busy}>{busy ? <><span className="spinner" /> Sipariş hazırlanıyor</> : <>Satın alımı tamamla <ArrowRight size={17} /></>}</button><p className="drawer-delivery">{DELIVERY}</p></div></> : <div className="cart-empty"><span><ShoppingBag size={28} /></span><h3>Sepetin şimdilik boş.</h3><p>Kasaban için bir şeyler seçmeye ne dersin?</p><button className="button button-outline" onClick={() => { setCartOpen(false); scrollTo('store') }}>Mağazaya göz at <ArrowRight size={16} /></button></div>}</aside></>}
    {selected && <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setSelected(null)}><section className="product-modal" role="dialog" aria-modal="true"><button className="close-button modal-close" aria-label="Kapat" onClick={() => setSelected(null)}><X /></button><div className={`modal-art ${selected.art}`}><div className="modal-art-mark"><selected.icon size={46} strokeWidth={1.35} /></div><span>{selected.category.toUpperCase()} / CRAFTSOLAR</span></div><div className="modal-content"><span className="item-tag">{selected.tag}</span><h2>{selected.name}</h2><p>{selected.description}</p><ul>{selected.perks.map(perk => <li key={perk}><Check size={15} />{perk}</li>)}</ul><div className="modal-buy"><strong>{money(selected.price)}</strong><button className="button button-gold" onClick={() => addToCart(selected.id)}>Sepete ekle <ShoppingCart size={16} /></button></div><span className="modal-delivery"><Truck size={15} /> {DELIVERY}</span></div></section></div>}
    {authOpen && <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setAuthOpen(false)}><section className="auth-modal" role="dialog" aria-modal="true"><button className="close-button modal-close" aria-label="Kapat" onClick={() => setAuthOpen(false)}><X /></button><div className="auth-emblem"><img src="/craftsolar-emblem.png" alt="CraftSolar" /></div><span className="section-index">CRAFTSOLAR / HESAP</span><h2>{authMode === 'register' ? 'Dünyada yerini al.' : 'Tekrar hoş geldin.'}</h2><p className="auth-intro">{authMode === 'register' ? 'Kasabanı oluşturmak için hesabını aç.' : 'Siparişlerini görmek için giriş yap.'}</p><div className="username-notice"><strong><UserRound size={15} /> Minecraft nicki zorunludur</strong><p>Kullanıcı adın oyun içi Minecraft nickinle <b>birebir aynı</b> olmalı. Teslimatlar bu isme yapılır.</p></div><form onSubmit={submitAuth}><label>MINECRAFT NICK<input autoComplete="username" value={form.username} onChange={event => setForm({ ...form, username: event.target.value })} placeholder="Örn. Kasabakurucu_7" maxLength={16} required /></label><label>ŞİFRE<input type="password" autoComplete={authMode === 'register' ? 'new-password' : 'current-password'} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="En az 4 karakter" minLength={4} required /></label>{authError && <p className="form-error">{authError}</p>}<button className="button button-gold auth-submit" type="submit">{authMode === 'register' ? 'Hesap oluştur' : 'Giriş yap'} <ArrowRight size={16} /></button></form><p className="auth-switch">{authMode === 'register' ? 'Zaten hesabın var mı?' : 'CraftSolar’da yeni misin?'} <button onClick={() => { setAuthMode(authMode === 'register' ? 'login' : 'register'); setAuthError('') }}>{authMode === 'register' ? 'Giriş yap' : 'Hesap oluştur'}</button></p><p className="local-data-note"><LockKeyhole size={13} /> Demo hesap bilgileri bu tarayıcıda saklanır.</p></section></div>}
    {notice && <div className="modal-backdrop success-backdrop"><section className="success-modal" role="dialog" aria-modal="true"><button className="close-button modal-close" aria-label="Kapat" onClick={() => setNotice(null)}><X /></button><div className="success-icon"><PackageCheck size={32} /></div><span className="section-index">SİPARİŞ / {notice.id}</span><h2>Siparişin alındı.</h2><p>Teşekkürler, <strong>{notice.username}</strong>. Siparişin oluşturuldu. Gerçek bir ödeme alınmadı.</p><div className="success-total"><span>SİPARİŞ TUTARI</span><strong>{money(notice.total)}</strong></div><p className="success-delivery">{DELIVERY}</p><button className="button button-gold auth-submit" onClick={() => { setNotice(null); scrollTo('my-orders') }}>Siparişlerime git <ArrowRight size={16} /></button></section></div>}
    {toast && <div className="toast"><span><Check size={14} /></span>{toast}</div>}
  </>
}

function ProductCard({ product, onSelect, onAdd }) {
  const Icon = product.icon
  return <article className="product-card"><button className={`product-art ${product.art}`} onClick={onSelect} aria-label={`${product.name} detayları`}><span className="product-art-tag">{product.tag}</span><span className="product-art-number">CS / {product.id.toUpperCase()}</span><span className="product-glyph"><Icon size={43} strokeWidth={1.25} /></span><span className="art-orbit orbit-one" /><span className="art-orbit orbit-two" /><span className="art-ground" /><span className="art-coord">X / 0{product.price}</span></button><div className="product-info"><div><span className="product-category">{product.category}</span><button className="product-name" onClick={onSelect}>{product.name}</button></div><button className="product-detail" aria-label={`${product.name} detayları`} onClick={onSelect}><ArrowUpRight size={16} /></button></div><div className="product-buy-row"><strong>{money(product.price)}</strong><button onClick={onAdd}><Plus size={15} /> Ekle</button></div></article>
}

function OrderRow({ order }) {
  const date = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.createdAt))
  const nameList = order.items.map(line => `${products.find(item => item.id === line.id)?.name} ×${line.quantity}`).join(', ')
  return <article className="order-row"><span className="order-symbol"><PackageCheck size={18} /></span><div className="order-main"><strong>{nameList}</strong><span>{order.id} · {date}</span></div><strong className="order-price">{money(order.total)}</strong><span className={order.status === 'Teslim Edildi' ? 'order-status delivered' : 'order-status'}>{order.status}</span></article>
}

function AdminView({ users, orders, setOrderStatus }) {
  const [filter, setFilter] = useState('')
  const [access, setAccess] = useState(sessionStorage.getItem('craftsolar-admin') === 'yes')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const turnover = orders.reduce((sum, order) => sum + order.total, 0)
  if (!access) return <main className="admin-gate"><form className="admin-gate-card" onSubmit={event => { event.preventDefault(); if (password === 'CS-SOLAR-DEMO') { sessionStorage.setItem('craftsolar-admin', 'yes'); setAccess(true) } else setError('Demo yönetici anahtarı hatalı.') }}><img src="/craftsolar-emblem.png" alt="" /><span className="section-index">CRAFTSOLAR / YÖNETİM</span><h1>Yönetim alanı</h1><p>Demo panelini açmak için yönetici anahtarını gir.</p><label>YÖNETİCİ ANAHTARI<input value={password} onChange={event => setPassword(event.target.value)} type="password" autoComplete="current-password" /></label>{error && <p className="form-error">{error}</p>}<button className="button button-gold" type="submit">Panele giriş <ArrowRight size={16} /></button><a href="#top">Ana sayfaya dön</a></form></main>
  return <main className="admin-page"><header className="admin-top"><a className="brand" href="#top"><span className="brand-mark"><img src="/craftsolar-emblem.png" alt="" /></span><span className="brand-name">CRAFT<span>SOLAR</span><small>YÖNETİM</small></span></a><button className="button button-outline" onClick={() => { sessionStorage.removeItem('craftsolar-admin'); location.hash = '#top'; location.reload() }}>Paneli kapat <X size={15} /></button></header><div className="admin-content"><div className="admin-title"><div><span className="section-index">CRAFTSOLAR / YÖNETİM PANELİ</span><h1>Kontrol merkezi</h1><p>Kayıtlar bu tarayıcının yerel demo verileridir.</p></div><span className="admin-local"><LockKeyhole size={14} /> YEREL DEMO VERİSİ</span></div><div className="admin-stats"><article><span>KAYITLI OYUNCULAR</span><strong>{users.length}</strong><UserRound size={20} /></article><article><span>TOPLAM SİPARİŞ</span><strong>{orders.length}</strong><ShoppingBag size={20} /></article><article><span>SİMÜLE CİRO</span><strong>{money(turnover)}</strong><Landmark size={20} /></article><article><span>TESLİMAT BEKLİYOR</span><strong>{orders.filter(order => order.status === 'Bekliyor').length}</strong><Truck size={20} /></article></div><section className="admin-table-section"><div className="admin-table-head"><div><span className="section-index">İŞLEM KAYITLARI</span><h2>Siparişler</h2></div><input value={filter} onChange={event => setFilter(event.target.value)} placeholder="Oyuncu veya ürün ara" /></div>{orders.length ? <div className="table-scroll"><table><thead><tr><th>SİPARİŞ</th><th>MINECRAFT NICKİ</th><th>ÜRÜNLER</th><th>TUTAR</th><th>TARİH</th><th>DURUM</th><th>TESLİMAT</th></tr></thead><tbody>{orders.filter(order => { const line = order.items.map(item => products.find(product => product.id === item.id)?.name).join(' '); return `${order.username} ${line} ${order.id}`.toLocaleLowerCase('tr').includes(filter.toLocaleLowerCase('tr')) }).map(order => <tr key={order.id}><td className="table-order-id">{order.id}</td><td><strong>{order.username}</strong><small>Minecraft nicki</small></td><td>{order.items.map(line => <span className="table-product" key={line.id}>{products.find(product => product.id === line.id)?.name} <b>×{line.quantity}</b></span>)}</td><td className="table-price">{money(order.total)}</td><td>{new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.createdAt))}</td><td><span className={order.status === 'Teslim Edildi' ? 'order-status delivered' : 'order-status'}>{order.status}</span></td><td><button className={order.status === 'Bekliyor' ? 'deliver-button' : 'undo-button'} onClick={() => setOrderStatus(order.id, order.status === 'Bekliyor' ? 'Teslim Edildi' : 'Bekliyor')}>{order.status === 'Bekliyor' ? <><Check size={14} /> Teslim edildi</> : <><ChevronLeft size={14} /> Geri al</>}</button></td></tr>)}</tbody></table></div> : <div className="admin-empty"><PackageCheck size={24} /><h3>Henüz sipariş yok.</h3><p>Demo siparişler bu cihazda oluşturuldukça burada görünür.</p></div>}</section><section className="admin-users"><div><span className="section-index">OYUNCU KAYITLARI</span><h2>Kayıtlı oyuncular <small>{users.length}</small></h2></div>{users.length ? <div className="user-chips">{users.map(user => <span key={user.username}><i>{user.username.slice(0, 1).toUpperCase()}</i>{user.username}<small>{new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(new Date(user.createdAt))}</small></span>)}</div> : <p>Henüz kayıtlı oyuncu yok.</p>}</section></div></main>
}

createRoot(document.getElementById('root')).render(<App />)
