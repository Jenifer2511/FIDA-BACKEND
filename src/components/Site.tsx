'use client';

import './collection-products.css';

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';

import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  Search,
  Plus,
  Minus,
  Check,
  Camera,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

import {
  company,
  initialProducts,
  type Product,
} from '@/lib/catalog';

import { StoryScene } from './StoryScene';
import { PageTransitions } from './PageTransitions';
import { SmoothScroll } from './SmoothScroll';
import { CultureChapter, FashionBackdrop } from './CultureChapter';
import { ProductReveal } from './ProductReveal';
import { ProductDetail } from './ProductDetail';
import { LandingManifesto } from './LandingCinema';

type Page = 'home' | 'products' | 'enquiry' | 'contact' | 'story';

const nav = [
  ['House of FIDA', '/', 'home'],
  ['The collection', '/products', 'products'],
  ['Our story', '/our-story', 'story'],
  ['Enquiry', '/enquiry', 'enquiry'],
  ['Contact', '/contact', 'contact'],
] as const;

const FIDA_CATEGORIES = [
  'Kurtis',
  'Lehengas',
  'Sarees',
  'Daily Wears',
  'Premium Abayas',
  'Wedding Collections',
  'Accessories',
] as const;

const logoStyles = `
  .site .header .brand.fida-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 72px;
    height: 72px;
    padding: 5px;
    background: #fff;
    border-radius: 6px;
    overflow: hidden;
  }

  .site .header .brand.fida-logo img,
  .site.page-home:has(.fida-film)
    .header:not(.menu-open)
    .brand.fida-logo img {
    display: block;
    width: 100%;
    height: 100%;
    max-width: 100%;
    object-fit: contain;
    object-position: center;
    mix-blend-mode: normal;
    filter: none;
    transform: none;
  }

  .site .header .brand.fida-logo:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 5px;
  }

  @media (max-width: 760px) {
    .site .header .brand.fida-logo {
      width: 58px;
      height: 58px;
      padding: 4px;
    }
  }
`;

function Reveal({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const target = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target,
    offset: ['start 95%', 'start 65%'],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [32, 0]);

  return (
    <motion.div
      ref={target}
      className={className}
      style={reduce ? undefined : { opacity, y }}
    >
      {children}
    </motion.div>
  );
}

function ArrowLink({
  href,
  children,
  light = false,
}: {
  href: string;
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <a
      className={`arrow-link ${light ? 'light' : ''}`}
      href={href}
    >
      <span>{children}</span>
      <ArrowUpRight size={18} aria-hidden="true" />
    </a>
  );
}

function Header({ page }: { page: Page }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = open ? 'hidden' : '';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <style>{logoStyles}</style>

      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className={`header ${open ? 'menu-open' : ''}`}>
        <a
          href="/"
          className="brand fida-logo"
          aria-label="FIDA home"
        >
          <img
            src="/assets/brand/fida-logo.png"
            alt="FIDA"
            width={72}
            height={72}
            decoding="async"
          />
        </a>

        <nav
          aria-label="Main navigation"
          className="desktop-nav"
        >
          {nav.map(([name, path, id]) => (
            <a
              key={id}
              href={path}
              aria-current={page === id ? 'page' : undefined}
            >
              {name}
            </a>
          ))}
        </nav>

        <a className="header-cta" href="/enquiry">
          Let’s talk
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>

        <button
          className="menu-toggle"
          type="button"
          onClick={() => setOpen(previous => !previous)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="fida-mobile-navigation"
        >
          {open ? (
            <X aria-hidden="true" />
          ) : (
            <Menu aria-hidden="true" />
          )}
        </button>
      </header>

      {open && (
        <nav
          id="fida-mobile-navigation"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {nav.map(([name, path, id], index) => (
            <a
              key={id}
              href={path}
              aria-current={page === id ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              <small>0{index + 1}</small>
              {name}
              <ArrowUpRight aria-hidden="true" />
            </a>
          ))}

          <p>India · Since 2020</p>
        </nav>
      )}
    </>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <p className="eyebrow">YOUR NEXT CHAPTER</p>

        <a href="/enquiry" className="footer-invite">
          Let’s make it <em>yours.</em>
          <ArrowUpRight aria-hidden="true" />
        </a>
      </div>

      <div className="footer-grid">
        <div>
          <p className="footer-logo">
            FIDA<span>®</span>
          </p>

          <p>
            Rooted in India.
            <br />
            Inspired by the world. Made for you.
          </p>
        </div>

        <div>
          <p className="eyebrow">EXPLORE</p>

          {nav.slice(1).map(([name, path]) => (
            <a key={path} href={path}>
              {name}
            </a>
          ))}
        </div>

        <div>
          <p className="eyebrow">SAY HELLO</p>

          <a href={`mailto:${company.email}`}>
            {company.email}
          </a>

          <a href={`tel:${company.tel}`}>
            {company.phone}
          </a>

          <a
            href={company.instagram}
            target="_blank"
            rel="noreferrer"
          >
            Instagram
            <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        </div>

        <div>
          <p className="eyebrow">FIND OUR WORLD</p>

          <p className="small">
            Serving India, Sri Lanka &amp; the UAE
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} FIDA. Fashions &amp; Lifestyles.
        </span>

        <span>Every thread tells a story.</span>

        <a href="/admin">
          FIDA Studio
          <ArrowUpRight size={12} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}

function useProducts() {
  const [products, setProducts] = useState<Product[]>(() =>
    initialProducts.filter(product => product.published === 1 && !product.deleted),
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function refresh(showLoading: boolean) {
      if (showLoading) setLoading(true);
      try {
        const response = await fetch('/api/products', {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error || 'Product sync is temporarily unavailable.');
        if (!Array.isArray(data)) throw new Error('The product catalogue returned an invalid response.');
        if (!active) return;
        setProducts((data as Product[]).filter(product => product.published === 1 && !product.deleted));
        setError('');
      } catch {
        if (!active) return;
        // Preserve the supplied catalogue while PostgreSQL is not configured or unreachable.
        setProducts(initialProducts.filter(product => product.published === 1 && !product.deleted));
        setError('Live product sync is unavailable. Showing the saved FIDA catalogue until the database connection is restored.');
      } finally {
        if (active && showLoading) setLoading(false);
      }
    }

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void refresh(false);
    };

    void refresh(true);
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      active = false;
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, []);

  return { products, error, loading };
}

function ProductCard({
  product,
  index = 0,
  onSelect,
}: {
  product: Product;
  index?: number;
  onSelect?: (product: Product) => void;
}) {
  const detailHref = `/products?product=${encodeURIComponent(product.id)}`;

  return (
    <ProductReveal index={index} className="product-card">
      <a
        href={detailHref}
        className="product-image"
        onClick={event => {
          if (!onSelect) return;
          event.preventDefault();
          onSelect(product);
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
        />

        <span className="product-action">
          View this piece
          <ArrowUpRight size={18} aria-hidden="true" />
        </span>
      </a>

      <div className="product-caption">
        <div>
          <p className="eyebrow">{product.category}</p>
          <h3>{product.name}</h3>
        </div>
      </div>

      <p className="product-price">
        {product.price || 'Details & availability on enquiry'}
      </p>
    </ProductReveal>
  );
}

function Home() {
  const { products } = useProducts();

  const worldCards = [
    {
      name: 'Occasion',
      subtitle: 'India, in a new light',
      image: '/assets/distinct/lehenga-mobile.webp',
      href: '/',
    },
    {
      name: 'Eveningwear',
      subtitle: 'A sculptural shape',
      image: '/assets/distinct/evening-mobile.webp',
      href: '/products',
    },
    {
      name: 'Tailoring',
      subtitle: 'A contemporary point of view',
      image: '/assets/distinct/tailoring-mobile.webp',
      href: '/products',
    },
    {
      name: 'The details',
      subtitle: 'The art of embellishment',
      image: '/assets/distinct/embroidery-mobile.webp',
      href: '/enquiry',
    },
    {
      name: 'The makers',
      subtitle: 'Devoted to the craft',
      image: '/assets/culture/tailor-atelier-mobile.webp',
      href: '/our-story',
    },
  ];

  return (
    <>
      <CultureChapter kind="home" />

      <LandingManifesto />

      <section
        className="collection-section section home-edit"
        id="fida-edit"
      >
        <div className="section-heading">
          <Reveal>
            <p className="eyebrow">
              THE COLLECTION / AN EDIT OF POSSIBILITY
            </p>

            <h2>
              Find your <em>expression.</em>
            </h2>
          </Reveal>

          <ArrowLink href="/products">
            View the collection
          </ArrowLink>
        </div>

        <nav className="home-category-links" aria-label="Shop by category">
          {FIDA_CATEGORIES.map(category => (
            <a
              key={category}
              href={`/products?category=${encodeURIComponent(category)}#collection`}
            >
              <span>{category}</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          ))}
        </nav>

        <div className="product-grid home-products">
          {products
            .filter(product => product.featured)
            .slice(0, 3)
            .map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
              />
            ))}
        </div>

        <p className="home-films-label">
          CONSIDERED SHAPES. YOUR OWN EXPRESSION.
        </p>
      </section>

      <section className="world-section">
        <div className="world-heading">
          <p className="eyebrow">
            A PASSPORT TO POSSIBILITY
          </p>

          <h2>
            Inspiration,
            <br />
            <em>without borders.</em>
          </h2>

          <p>
            Rooted in India.
            <br />
            Open to a world of inspiration.
          </p>
        </div>

        <div className="world-cards">
          {worldCards.map(card => (
            <a
              className="world-card"
              href={card.href}
              key={card.name}
            >
              <img
                src={card.image}
                alt={`${card.name} fashion inspiration`}
                loading="lazy"
              />

              <div>
                <p>{card.subtitle}</p>

                <h3>
                  {card.name}
                  <ArrowUpRight size={19} aria-hidden="true" />
                </h3>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="craft-invitation">
        <img
          src="/assets/atelier.jpg"
          alt="A dressmaker carefully adjusting a dress in the atelier"
          loading="lazy"
        />

        <div className="craft-overlay" />

        <Reveal className="craft-copy">
          <p className="eyebrow">
            BEHIND EVERY BEAUTIFUL THING
          </p>

          <h2>
            A pair of hands.
            <br />
            <em>A lifetime of craft.</em>
          </h2>

          <p>
            Before a dress becomes a memory, it is a thousand small
            acts of care. This is our tribute to the people who make
            it possible.
          </p>

          <ArrowLink href="/our-story" light>
            Discover their story
          </ArrowLink>
        </Reveal>

        <span className="craft-caption">
          A TRIBUTE TO THE MAKERS · AN IMMERSIVE STORY
        </span>
      </section>
    </>
  );
}

function Products() {
  const { products, error, loading } = useProducts();
  const ROOT = 'Collections';
  const WOMEN = 'Women’s Wear';
  const normalise = (value: string) => value.trim().toLowerCase().replace(/[’']/g, '');
  const canonical = (value: string) => {
    const key = normalise(value);
    if (['accessories', 'accessory', 'bags', 'handbags'].includes(key)) return 'Accessories';
    if (['saree', 'sarees'].includes(key)) return 'Sarees';
    if (['off saree', 'off sarees'].includes(key)) return 'Off Sarees';
    return FIDA_CATEGORIES.find(category => normalise(category) === key) || value.trim();
  };
  const readFilter = () => {
    const requested = new URLSearchParams(window.location.search).get('category') || '';
    if (!requested || ['all pieces', 'collections'].includes(normalise(requested))) return ROOT;
    if (['womens wear', 'women wear', 'womenswear'].includes(normalise(requested))) return WOMEN;
    return canonical(requested) === 'Off Sarees' ? 'Sarees' : canonical(requested);
  };
  const [filter, setFilter] = useState(readFilter);
  const [selectedId, setSelectedId] = useState(() => new URLSearchParams(window.location.search).get('product'));
  const [search, setSearch] = useState('');
  const selectedProduct = products.find(product => product.id === selectedId) || null;

  useEffect(() => {
    const sync = () => {
      setFilter(readFilter());
      setSelectedId(new URLSearchParams(window.location.search).get('product'));
      setSearch('');
    };
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
    // URL parsing uses the same category naming rules throughout this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const womenCategories = Array.from(
  new Set<string>([
    ...FIDA_CATEGORIES.filter(category => category !== 'Accessories'),

    ...products
      .map(product => canonical(product.category))
      .filter(
        category =>
          category &&
          !['Accessories', 'Off Sarees', WOMEN, ROOT].includes(category),
      ),
  ]),
).filter(
  category =>
    !['frock', 'frocks', 'blouse', 'blouses'].includes(
      normalise(category),
    ),
);
  const isCategoryPage = filter !== ROOT && filter !== WOMEN;
  const belongsTo = (product: Product, category: string) => {
    const value = canonical(product.category);
    return category === 'Sarees'
      ? value === 'Sarees' || value === 'Off Sarees'
      : normalise(value) === normalise(category);
  };
  const categoryProducts = isCategoryPage ? products.filter(product => belongsTo(product, filter)) : [];
  const visible = categoryProducts.filter(product =>
    `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(search.trim().toLowerCase()),
  );
const fallbackImage = (category: string) => {
  if (category === 'Kurtis') {
    return '/assets/categories/kurtis.jpg';
  }

  if (category === 'Sarees') {
    return '/assets/categories/sarees.jpg';
  }

  if (category === 'Premium Abayas') {
    return '/assets/categories/premium-abayas.jpg';
  }

  if (category === 'Accessories') {
    return '/assets/products/structured-caramel-handbag.webp';
  }

  if (
    category === 'Lehengas' ||
    category === 'Wedding Collections'
  ) {
    return '/assets/products/ivory-embroidered-lehenga.webp';
  }

  return '/assets/brand/womens.png';
};

const categoryImage = (category: string) => {
  const name = canonical(category);

  if (['Kurtis', 'Sarees', 'Premium Abayas'].includes(name)) {
    return fallbackImage(name);
  }

  return (
    products.find(
      product => belongsTo(product, category) && product.image,
    )?.image || fallbackImage(category)
  );
};

  function navigate(category: string, productId: string | null = null) {
    const url = new URL(window.location.href);
    if (category === ROOT) url.searchParams.delete('category');
    else url.searchParams.set('category', category);
    if (productId) url.searchParams.set('product', productId);
    else url.searchParams.delete('product');
    url.hash = 'collection';
    window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
    setFilter(category); setSelectedId(productId); setSearch('');
  }

  function renderCategoryCard(category: string, image: string, subtitle: string, featured = false) {
    return (
      <a className={`collection-category-card ${featured ? 'is-featured' : ''}`} key={category}
        href={`/products?category=${encodeURIComponent(category)}#collection`}
        onClick={event => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault(); navigate(category);
        }}>
        <div className="collection-category-photo"><img src={image} alt="" loading="lazy" onError={event => {
          if (event.currentTarget.dataset.fallback) return;
          event.currentTarget.dataset.fallback = 'true';
          event.currentTarget.src = fallbackImage(category);
        }} /></div>
        <div className="collection-category-caption"><div><h2>{category}</h2><p>{subtitle}</p></div><ArrowUpRight size={22} aria-hidden="true" /></div>
      </a>
    );
  }

  function renderProductGrid(items: Product[]) {
    return <div className="product-grid compact-collection-products">{items.map((product, index) => (
      <ProductCard key={product.id} product={product} index={index}
        onSelect={product => navigate(filter, product.id)} />
    ))}</div>;
  }

  return (
    <>
      <CultureChapter kind="products" />
      <header className="collection-intro">
        <p className="eyebrow">THE FIDA COLLECTION</p>
        <h1>{filter === ROOT ? <>Find your <em>expression.</em></> : filter}</h1>
        <p>{filter === ROOT ? 'Choose a collection to explore.' : filter === WOMEN ? 'Choose a category to discover its pieces.' : 'Explore the pieces in this category.'}</p>
      </header>
      <section className="section full-collection category-first-collection" id="collection">
        <nav className="collection-breadcrumbs" aria-label="Collection navigation">
          <button type="button" onClick={() => navigate(ROOT)} aria-current={filter === ROOT && !selectedId ? 'page' : undefined}>Collections</button>
          {filter !== ROOT && <><span aria-hidden="true">/</span><button type="button" onClick={() => navigate(filter === 'Accessories' ? 'Accessories' : WOMEN)} aria-current={filter === WOMEN && !selectedId ? 'page' : undefined}>{filter === 'Accessories' ? 'Accessories' : WOMEN}</button></>}
          {isCategoryPage && filter !== 'Accessories' && <><span aria-hidden="true">/</span><button type="button" onClick={() => navigate(filter)} aria-current={!selectedId ? 'page' : undefined}>{filter}</button></>}
          {selectedProduct && <><span aria-hidden="true">/</span><span aria-current="page">{selectedProduct.name}</span></>}
        </nav>

        {error && <p className="notice">Live product updates are temporarily unavailable. Showing the saved catalogue. <button type="button" onClick={() => window.location.reload()}>Try again</button></p>}

        {selectedId ? (
          selectedProduct ? <ProductDetail product={selectedProduct} onBack={() => navigate(filter)} />
            : <div className="empty-state"><h2>{loading ? 'Loading this piece…' : 'This piece is unavailable.'}</h2><button type="button" className="button" onClick={() => navigate(filter)}>Back to collection</button></div>
        ) : filter === ROOT ? (
          <div className="collection-category-grid collection-main-categories">
            {renderCategoryCard(WOMEN, '/assets/brand/womens.png', 'Kurtis, lehengas, sarees and more', true)}
            {renderCategoryCard('Accessories', categoryImage('Accessories'), 'Discover bags and finishing touches', true)}
          </div>
        ) : filter === WOMEN ? (
          <div className="collection-category-grid collection-women-categories">
            {womenCategories.map(category => renderCategoryCard(category, categoryImage(category), 'Explore this category'))}
          </div>
        ) : (
          <>
            <div className="collection-toolbar collection-product-toolbar">
              <p className="collection-count" role="status" aria-live="polite">{loading ? 'REFRESHING COLLECTION' : `${visible.length} ${visible.length === 1 ? 'PIECE' : 'PIECES'}`}</p>
              <label className="search-field"><Search size={17} aria-hidden="true" /><input aria-label={`Search ${filter}`} placeholder="Search this category" value={search} onChange={event => setSearch(event.target.value)} /></label>
            </div>
            {filter === 'Sarees' ? ['Sarees', 'Off Sarees'].map(section => {
              const items = visible.filter(product => canonical(product.category) === section);
              return <section className="collection-category-section" key={section}><h2 className="eyebrow">{section}</h2>{items.length ? renderProductGrid(items) : <p className="collection-section-empty">No pieces in this section yet.</p>}</section>;
            }) : renderProductGrid(visible)}
            {!visible.length && !loading && <div className="empty-state"><h2>No pieces to show yet.</h2><p>{search ? 'Try another search in this category.' : 'New pieces will appear here when they are published.'}</p><div className="collection-empty-actions">{search && <button type="button" className="button" onClick={() => setSearch('')}>Clear search</button>}<button type="button" className="button" onClick={() => navigate(filter === 'Accessories' ? ROOT : WOMEN)}>Back to categories<ArrowRight size={17} /></button></div></div>}
          </>
        )}
      </section>
      <section className="quote-band"><p className="eyebrow">STYLE IS PERSONAL</p><h2>Find what feels<br /><em>like you.</em></h2><ArrowLink href="/enquiry">Let us help you choose</ArrowLink></section>
    </>
  );
}

function Enquiry() {
  const [interest, setInterest] = useState(
    'A piece from the collection',
  );

  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy] = useState(false);
  const [faq, setFaq] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const interestFromLink = params.get('product') || params.get('category');

    if (interestFromLink) {
      setInterest(interestFromLink);
    }
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    if (fields.get('website')) return;

    setError('');
    const body = [
      `Name: ${fields.get('name')}`,
      `Email: ${fields.get('email')}`,
      `Phone / WhatsApp: ${fields.get('phone')}`,
      `Interested in: ${interest}`,
      '',
      String(fields.get('message') || ''),
    ].join('\n');
    const subject = `FIDA enquiry: ${interest}`;
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const defaultInterests = [
    'A piece from the collection',
    'Wholesale & export',
    'A general enquiry',
  ];

  const interestOptions = defaultInterests.includes(interest)
    ? defaultInterests
    : [...defaultInterests, interest];

  const faqs = [
    [
      'How do I enquire about a piece?',
      'Choose a piece in the collection and select “Enquire”. Its name will be included in your enquiry. You can also message our team directly on WhatsApp.',
    ],
    [
      'Where is FIDA based?',
      'FIDA is headquartered in India, with branches in Sri Lanka and the UAE.',
    ],
    [
      'Can I discuss wholesale or export?',
      'Yes. Choose “Wholesale & export” in the form and tell us your country, the products you are interested in and your approximate quantities. Our team will discuss the possibilities with you.',
    ],
    [
      'How do I find prices and available sizes?',
      'Our team will confirm current prices, sizes, colours and availability for the specific piece you have in mind. Send a product enquiry to begin.',
    ],
  ];

  return (
    <>
      <CultureChapter kind="enquiry" />

      <section
        className="enquiry-layout"
        id="enquiry-form"
      >
        <div className="enquiry-visual">
          <img
            src="/assets/distinct/embroidery-4k.jpg"
            alt="Intricate red and gold Indian embroidery"
          />

          <div />

          <span className="vertical-label">
           INDIAN EMBROIDERY — BEAUTY IN THE DETAILS
          </span>

          <div className="enquiry-visual-copy">
            <span>✧</span>

            <p>
              Every ART.
              <br />
              A new possibility.
            </p>
          </div>
        </div>

        <div className="enquiry-content">
          <p className="eyebrow">
            SOMETHING BEAUTIFUL STARTS HERE
          </p>

          <h2 className="enquiry-form-heading">
            Tell us
            <br />
            <em>your story.</em>
          </h2>

          <p className="intro-copy">
            A dress you love. An occasion ahead. A business opportunity.
            <br />
            Whatever brings you here, we’d love to hear it.
          </p>

          {status ? (
            <div className="success-state" role="status">
              <Check size={32} aria-hidden="true" />

              <h2>
                A beautiful
                <br />
                <em>beginning.</em>
              </h2>

              <p>{status}</p>

              <button
                className="button"
                type="button"
                onClick={() => setStatus('')}
              >
                Send another enquiry
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="enquiry-form"
            >
              <p className="notice">
                Submitting opens an email to {company.email} with your enquiry details.
              </p>

              <div className="form-row">
                <label>
                  Your name
                  <input
                    required
                    name="name"
                    autoComplete="name"
                    minLength={2}
                    maxLength={100}
                    placeholder="How shall we call you?"
                  />
                </label>

                <label>
                  Email address
                  <input
                    type="email"
                    required
                    name="email"
                    autoComplete="email"
                    maxLength={200}
                    placeholder="you@example.com"
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Phone / WhatsApp 
                  <input
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    maxLength={40}
                    placeholder="Your number, with country code"
                  />
                </label>

                <label>
                  I’m interested in
                  <select
                    value={interest}
                    onChange={event =>
                      setInterest(event.target.value)
                    }
                  >
                    {interestOptions.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                A little about what you have in mind
                <textarea
                  name="message"
                  required
                  minLength={10}
                  maxLength={4000}
                  rows={3}
                  placeholder="Share the piece, occasion, quantity, or idea you’re thinking about…"
                />
              </label>

              <label
                className="honeypot"
                aria-hidden="true"
              >
                Website
                <input
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>

              <label className="consent">
                <input
                  name="consent"
                  type="checkbox"
                  required
                />

                <span>
                  I agree to FIDA contacting me about this enquiry
                  using the details above.
                </span>
              </label>

              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}

              <button
                className="button"
                type="submit"
                disabled={busy}
              >
                {busy
                  ? 'Sending your enquiry…'
                  : 'Begin the conversation'}

                <ArrowUpRight size={18} aria-hidden="true" />
              </button>

            </form>
          )}

          <div className="direct-line">
            <p>Prefer a little conversation?</p>

            <a
              href={company.whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              Talk to us on WhatsApp
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="faq-section section">
        <div>
          <p className="eyebrow">
            A FEW HELPFUL DETAILS
          </p>

          <h2>
            Before we
            <br />
            <em>say hello.</em>
          </h2>
        </div>

        <div className="faqs">
          {faqs.map(([question, answer], index) => (
            <div className="faq" key={question}>
              <button
                type="button"
                aria-expanded={faq === index}
                aria-controls={`answer-${index}`}
                onClick={() =>
                  setFaq(faq === index ? null : index)
                }
              >
                {question}

                {faq === index ? (
                  <Minus size={17} aria-hidden="true" />
                ) : (
                  <Plus size={17} aria-hidden="true" />
                )}
              </button>

              {faq === index && (
                <p id={`answer-${index}`}>
                  {answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Contact() {
  return (
    <>
      <CultureChapter kind="contact" />

      <section
        className="contact-layout"
        id="reach-fida"
      >
        <div className="contact-content">
          <p className="eyebrow">
            INDIA — A WARM WELCOME
          </p>

          <h2 className="contact-content-title">
            Let’s make
            <br />
            <em>a connection.</em>
          </h2>

          <p className="intro-copy">
            Rooted in India. Open to the world.
            <br />
            Find your way to FIDA.
          </p>

          <div className="contact-links">
            <a href={`mailto:${company.email}`}>
              <Mail size={19} aria-hidden="true" />

              <div>
                <span>WRITE TO US</span>
                <p>{company.email}</p>
              </div>

              <ArrowUpRight aria-hidden="true" />
            </a>

            <a href={`tel:${company.tel}`}>
              <Phone size={19} aria-hidden="true" />

              <div>
                <span>LET’S TALK</span>
                <p>{company.phone}</p>
              </div>

              <ArrowUpRight aria-hidden="true" />
            </a>

            <a
              href="https://www.google.com/maps/search/?api=1&query=India"
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={19} aria-hidden="true" />

              <div>
                <span>HEADQUARTERS</span>
                <p>India</p>
              </div>

              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>

          <div className="contact-social">
            <a
              href={company.instagram}
              target="_blank"
              rel="noreferrer"
            >
              <Camera size={17} aria-hidden="true" />
              Follow our world
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>

            <a
              href={company.whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="contact-visual">
          <div className="arch-frame">
            <img
              src="/assets/culture/ivory-gold-4k.jpg"
              alt="A woman wearing an ivory and gold traditional Indian sari"
            />
          </div>

          <span className="arch-circle" />

          <p>
            Different places.
            <br />
            <em>A shared love of beautiful things.</em>
          </p>

        </div>
      </section>

      <section className="destinations section">
        <p className="eyebrow">
          FROM OUR HOME TO YOUR WORLD
        </p>

        <div>
          <h2>
            India
            <span>HEADQUARTERS</span>
          </h2>

          <h2>
            Sri Lanka
            <span>BRANCH</span>
          </h2>

          <h2>
            United Arab Emirates
            <span>BRANCH</span>
          </h2>
        </div>

        <p>
          India is our headquarters, with branches in Sri Lanka and the UAE.
          <br />
          For visit details or export enquiries, contact our team
          before making plans.
        </p>
      </section>
    </>
  );
}

function Story() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    fetch('/assets/image-manifest.json')
      .then(response => response.json())
      .then(data => {
        setImages((data as { story: string[] }).story);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <CultureChapter kind="story" />

      <section
        className="story-prologue section"
        id="makers"
      >
        <p className="eyebrow">
          THE THINGS A LABEL CANNOT TELL YOU
        </p>

        <Reveal>
          <h2>
            Before it is worn.
            <br />
            Before it is loved.
            <br />
            <em>It is made.</em>
          </h2>
        </Reveal>

        <p>
          Inspired by the artistry of our heritage and the spirit of modern expression, we create clothing that transcends seasons and trends. Every fabric, cut, and detail is thoughtfully chosen to honour timeless techniques while embracing a fresh perspective. The result is fashion that feels personal, purposeful, and effortlessly enduring.
        </p>
      </section>

      <StoryScene
        images={images}
        portrait="/assets/portrait.jpg"
      />

      <section
        className="story-dedication section"
        id="dedication"
      >
        <p className="eyebrow">
          TO THE HANDS THAT MAKE IT POSSIBLE
        </p>

        <Reveal>
          <h2>
            The world sees
            <br />
            the dress.
            <br />
            <em>We see you.</em>
          </h2>
        </Reveal>

        <div>
          <p>
            To the tailors, cutters, embroiderers and makers. To the
            early mornings and the patient hands. To the skill passed
            from one generation to the next.
          </p>

          <p>This is for you.</p>

          <span className="signature">
            With gratitude, FIDA
          </span>

          <small>
            For every woman, a wardrobe that moves with her—thoughtful,
            expressive, and entirely her own.
          </small>
        </div>
      </section>

      <section className="story-origin">
        <img
          src="/assets/brand/about.jpg"
          alt="From FIDA’s original brand archive"
          loading="lazy"
        />

        <div>
          <p className="eyebrow">
            OUR OWN THREAD IN THE STORY
          </p>

          <h2>
            From India,
            <br />
            <em>with possibility.</em>
          </h2>

          <p>
            FIDA began in 2020 with a simple vision: to bring women’s
            fashion, clothing essentials and accessories to
            wardrobes everywhere.
          </p>

          <p>
            Today, our India roots connect us with customers across
            India, Sri Lanka and the UAE. Our headquarters are in India,
            with branches in Sri Lanka and the UAE. Our perspective keeps
            growing. Our love of beautiful clothing remains at the
            heart of it.
          </p>

          <ArrowLink href="/products">
            Find your own expression
          </ArrowLink>
        </div>
      </section>
    </>
  );
}

export function Site({ page }: { page: Page }) {
  return (
    <div className={`site page-${page}`}>
      <FashionBackdrop page={page} />

      <SmoothScroll />

      <PageTransitions />

      <Header page={page} />

      <main id="main">
        {page === 'home' ? (
          <Home />
        ) : page === 'products' ? (
          <Products />
        ) : page === 'enquiry' ? (
          <Enquiry />
        ) : page === 'contact' ? (
          <Contact />
        ) : (
          <Story />
        )}
      </main>

      <Footer />
    </div>
  );
}