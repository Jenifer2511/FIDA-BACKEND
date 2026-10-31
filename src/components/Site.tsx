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
  'The Bag Edit',
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

          <p>
            Salem, Tamil Nadu
            <br />
            India
          </p>

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

        <span className="product-number">
          0{index + 1}
        </span>

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
      subtitle: 'A sculptural silhouette',
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
      name: 'Morocco',
      subtitle: 'Colour & connection',
      image: '/assets/distinct/kaftan-mobile.webp',
      href: '/contact',
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
          CONSIDERED SILHOUETTES. YOUR OWN EXPRESSION.
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
          {worldCards.map((card, index) => (
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

              <span className="world-index">
                0{index + 1}
              </span>

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
  const [selectedProduct, setSelectedProduct] = useState(() => {
    const requestedId = new URLSearchParams(window.location.search).get('product');
    return products.find(product => product.id === requestedId) || null;
  });

  useEffect(() => {
    const syncProductFromUrl = () => {
      const requestedId = new URLSearchParams(window.location.search).get('product');
      setSelectedProduct(products.find(product => product.id === requestedId) || null);
    };
    window.addEventListener('popstate', syncProductFromUrl);
    return () => window.removeEventListener('popstate', syncProductFromUrl);
  }, [products]);

  const normalise = (category: string) => category.trim().toLowerCase();
  const categories = FIDA_CATEGORIES;

  const [filter, setFilter] = useState(() => {
    if (typeof window === 'undefined') return 'All pieces';
    const requested = new URLSearchParams(window.location.search).get('category');
    return categories.find(category => normalise(category) === normalise(requested || ''))
      || 'All pieces';
  });
  const [search, setSearch] = useState('');

  const categoryProducts = products.filter(product =>
    filter === 'All pieces'
      || (filter === 'Sarees'
        ? ['sarees', 'off sarees'].includes(normalise(product.category))
        : normalise(product.category) === normalise(filter)),
  );
  const searchTerm = search.trim().toLowerCase();
  const visible = categoryProducts.filter(product =>
    `${product.name} ${product.category} ${product.description}`
      .toLowerCase()
      .includes(searchTerm),
  );
  const sarees = visible.filter(product => normalise(product.category) === 'sarees');
  const offSarees = visible.filter(product => normalise(product.category) === 'off sarees');
  const emptyCategory = filter !== 'All pieces' && categoryProducts.length === 0;

  function renderProductGrid(items: Product[]) {
    return (
      <div className="product-grid">
        {items.map((product, index) => (
          <ProductCard
            product={product}
            key={product.id}
            index={index}
            onSelect={selectProduct}
          />
        ))}
      </div>
    );
  }

  function selectProduct(product: Product) {
    setSelectedProduct(product);
    const url = new URL(window.location.href);
    url.searchParams.set('product', product.id);
    window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function closeProduct() {
    setSelectedProduct(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('product');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function selectCategory(category: string) {
    setFilter(category);
    const url = new URL(window.location.href);
    if (category === 'All pieces') url.searchParams.delete('category');
    else url.searchParams.set('category', category);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function resetFilters() {
    setSearch('');
    selectCategory('All pieces');
  }

  if (selectedProduct) {
    return (
      <>
        <CultureChapter kind="products" />
        <section className="section full-collection" id="collection">
          <ProductDetail product={selectedProduct} onBack={closeProduct} />
        </section>
      </>
    );
  }

  return (
    <>
      <CultureChapter kind="products" />

      <section
        className="section full-collection"
        id="collection"
      >
        <div className="collection-toolbar">
          <div
            className="filter-tabs collection-category-filters"
            role="group"
            aria-label="Filter collection"
          >
            {categories.map(category => (
              <button
                type="button"
                aria-pressed={filter === category}
                onClick={() => selectCategory(category)}
                key={category}
              >
                {category}
              </button>
            ))}
          </div>

          <label className="search-field">
            <Search size={17} aria-hidden="true" />

            <input
              aria-label="Search the collection"
              placeholder="Find your piece"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </label>
        </div>

        <div className="collection-count">
          <span role="status" aria-live="polite" aria-atomic="true"
            aria-label={`${visible.length} pieces in ${filter}`}>
            {loading
              ? 'REFRESHING COLLECTION'
              : `${visible.length} PIECES`}
          </span>

          <span>CHOSEN FOR YOU, BY FIDA</span>
        </div>

        {error && (
          <p className="notice">
            Showing the original FIDA edit while live updates are
            unavailable.{' '}
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </p>
        )}

        {filter === 'Sarees' ? (
          <>
            <section className="collection-category-section">
              <h2 className="eyebrow">Sarees</h2>
              {renderProductGrid(sarees)}
            </section>
            <section className="collection-category-section">
              <h2 className="eyebrow">Off Sarees</h2>
              {renderProductGrid(offSarees)}
            </section>
          </>
        ) : renderProductGrid(visible)}

        {!visible.length && (
          <div className="empty-state">
            <h2>
              {emptyCategory ? <em>{filter}</em> : <>A little more <em>possibility.</em></>}
            </h2>

            <p>
              {emptyCategory
                ? 'No pieces are listed in this category yet. Enquire with FIDA about what you are looking for.'
                : 'No pieces match your search. Try another word or explore the full collection.'}
            </p>

            <div className="collection-empty-actions">
              {emptyCategory && (
                <a className="button"
                  href={`/enquiry?category=${encodeURIComponent(filter)}#enquiry-form`}>
                  Enquire about this category
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              )}
              <button
                className="button"
                type="button"
                onClick={resetFilters}
              >
                View all pieces
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        <p className="collection-note">
          Every piece begins with a conversation. Ask us about
          sizing, colours, pricing and availability.
          <br />
          Collection imagery is drawn from FIDA’s supplied catalogue;
          our team can confirm the current details.
        </p>
      </section>

      <section className="quote-band">
        <p className="eyebrow">STYLE IS PERSONAL</p>

        <h2>
          Find what feels
          <br />
          <em>like you.</em>
        </h2>

        <ArrowLink href="/enquiry">
          Let us help you choose
        </ArrowLink>
      </section>
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
      'FIDA is based in Salem, Tamil Nadu, India, and serves customers across India, Sri Lanka and the UAE.',
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
            04 / MOROCCO — THE WARMTH OF CONNECTION
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
              href="https://www.google.com/maps/search/?api=1&query=Salem%2C%20Tamil%20Nadu%2C%20India"
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={19} aria-hidden="true" />

              <div>
                <span>OUR HOME</span>
                <p>Salem, Tamil Nadu, India</p>
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

          <span className="visual-caption">
          AN EDITORIAL INSPIRATION
          </span>
        </div>
      </section>

      <section className="destinations section">
        <p className="eyebrow">
          FROM OUR HOME TO YOUR WORLD
        </p>

        <div>
          <h2>
            India
            <span>OUR HOME</span>
          </h2>

          <h2>
            Sri Lanka
            <span>OUR REACH</span>
          </h2>

          <h2>
            United Arab Emirates
            <span>OUR REACH</span>
          </h2>
        </div>

        <p>
          Our headquarters are in INDIA. Sri Lanka and the UAE are
          markets we serve.
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
          Inspired by the artistry of our heritage and the spirit of modern expression, we create clothing that transcends seasons and trends. Every fabric, silhouette, and detail is thoughtfully chosen to honour timeless techniques while embracing a fresh perspective.
           The result is fashion that feels personal, purposeful, and effortlessly enduring.
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
            Portrait: a traditional tailor at work in India.
            Editorial tribute imagery celebrates the craft; it does
            not identify FIDA’s own workforce.
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
            India, Sri Lanka and the UAE. Our perspective keeps
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
