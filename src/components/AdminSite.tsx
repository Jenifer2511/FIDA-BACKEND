import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  Clock3,
  Edit3,
  ExternalLink,
  Eye,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { type Product } from '@/lib/catalog';
import './admin-site.css';
import { fileToBase64, prepareImage, SUPPORTED_IMAGE_TYPES, MAX_SOURCE_BYTES, MAX_IMAGE_BYTES } from '@/lib/image-upload';

type ProductDraft = {
  name: string;
  category: string;
  description: string;
  image: string;
  price: string;
  featured: boolean;
  published: boolean;
  deleted: boolean;
};

type View = 'all' | 'published' | 'drafts' | 'archived';

const TOKEN_KEY = 'fida_admin_session';
const categorySuggestions = [
  'Kurtis', 'Lehengas', 'Off Sarees', 'Daily Wears', 'Premium Abayas',
  'Wedding Collections', 'Premium Collections', 'Kids Collections', 'Frocks', 'Blouses',
];

const emptyDraft = (): ProductDraft => ({
  name: '', category: 'Lehengas', description: '', image: '', price: '',
  featured: false, published: true, deleted: false,
});

function toDraft(product?: Product): ProductDraft {
  if (!product) return emptyDraft();
  return {
    name: product.name,
    category: product.category,
    description: product.description,
    image: product.image,
    price: product.price,
    featured: product.featured === 1,
    published: product.published === 1,
    deleted: product.deleted === 1,
  };
}

async function readResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({})) as { error?: unknown } & T;
  if (!response.ok) {
    const value = (data as { error?: unknown }).error;
    const message = typeof value === 'string'
      ? value
      : value && typeof value === 'object' && 'message' in value && typeof value.message === 'string'
        ? value.message
        : response.status === 413 ? 'This image is too large to upload. Choose a smaller photo.' : `Request failed (${response.status}).`;
    throw new Error(message);
  }
  return data as T;
}

export function AdminSite() {
  const [token, setToken] = useState(() => typeof window === 'undefined' ? '' : sessionStorage.getItem(TOKEN_KEY) || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [view, setView] = useState<View>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(draft.image);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile, draft.image]);

  useEffect(() => {
    if (!token) {
      setProducts([]);
      setDbConnected(false);
      return;
    }
    let active = true;
    setLoading(true);
    fetch('/api/products?admin=1', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
    })
      .then(readResponse<Product[]>)
      .then(data => { if (active) { setProducts(data); setError(''); setDbConnected(true); } })
      .catch(reason => {
        if (!active) return;
        const message = reason instanceof Error ? reason.message : 'Could not load products.';
        setError(message);
        setDbConnected(false);
        if (/session is invalid|session.*expired/i.test(message)) clearSession();
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // The catalogue is refreshed when the session changes and after each mutation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function clearSession() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken('');
    setProducts([]);
    setDbConnected(false);
  }

  async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init.headers || {}),
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });
    try {
      return await readResponse<T>(response);
    } catch (reason) {
      if (response.status === 401) clearSession();
      throw reason;
    }
  }

  async function loadProducts() {
    try {
      const data = await request<Product[]>('/api/products?admin=1');
      setProducts(data);
      setDbConnected(true);
    } catch (reason) {
      setDbConnected(false);
      throw reason;
    }
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ username, password }),
        cache: 'no-store',
      });
      const result = await readResponse<{ token: string }>(response);
      sessionStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
      setPassword('');
      setNotice('Signed in. Product changes will sync to the storefront.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not sign in.');
    } finally {
      setLoginBusy(false);
    }
  }

  function openNewProduct() {
    setEditing(null);
    setDraft(emptyDraft());
    setImageFile(null);
    setError('');
    setNotice('');
    setEditorOpen(true);
  }

  function openEditProduct(product: Product) {
    setEditing(product);
    setDraft(toDraft(product));
    setImageFile(null);
    setError('');
    setNotice('');
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setImageFile(null);
  }

  function updateDraft<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft(current => ({ ...current, [key]: value }));
    setError('');
  }

  function chooseImage(file?: File) {
    if (!file) return;
    setImageFile(null);
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      setError('Choose a JPG, PNG, WebP, GIF or AVIF image.');
      return;
    }
    if (!file.size || file.size > MAX_SOURCE_BYTES) {
      setError('Choose a non-empty image no larger than 10 MB.');
      return;
    }
    if (['image/gif', 'image/avif'].includes(file.type.toLowerCase()) && file.size > MAX_IMAGE_BYTES) {
      setError('GIF and AVIF files must be no larger than 2 MB.');
      return;
    }
    setError('');
    setImageFile(file);
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name.trim() || !draft.category.trim()) {
      setError('Enter a product name and category.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const preparedImage = imageFile ? await prepareImage(imageFile) : null;
      const body = {
        ...draft,
        image: draft.image.trim(),
        ...(preparedImage ? {
          imageData: await fileToBase64(preparedImage),
          imageMimeType: preparedImage.type.toLowerCase(),
        } : {}),
      };
      const url = editing
        ? `/api/products?id=${encodeURIComponent(editing.id)}`
        : '/api/products';
      const savedProduct = await request<Product>(url, {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      });
      closeEditor();
      setProducts(current => editing
        ? current.map(product => product.id === savedProduct.id ? savedProduct : product)
        : [savedProduct, ...current]);
      setNotice(editing ? 'Product updated and synced to the storefront.' : 'Product added and synced to the storefront.');
      try {
        await loadProducts();
      } catch (refreshReason) {
        const detail = refreshReason instanceof Error ? refreshReason.message : 'Unknown refresh error.';
        setError(`The product was saved, but the catalogue could not refresh: ${detail}`);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save the product.');
    } finally {
      setSaving(false);
    }
  }

  async function archiveProduct(product: Product) {
    const confirmed = window.confirm(`Archive “${product.name}”? It will disappear from the public collection, but remain recoverable in the admin.`);
    if (!confirmed) return;
    setBusyId(product.id);
    setError('');
    setNotice('');
    try {
      await request(`/api/products?id=${encodeURIComponent(product.id)}`, { method: 'DELETE' });
      setProducts(current => current.map(item => item.id === product.id ? { ...item, published: 0, deleted: 1 } : item));
      setNotice('Product archived. The storefront has been updated.');
      try {
        await loadProducts();
      } catch (refreshReason) {
        const detail = refreshReason instanceof Error ? refreshReason.message : 'Unknown refresh error.';
        setError(`The product was archived, but the catalogue could not refresh: ${detail}`);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not archive the product.');
    } finally {
      setBusyId('');
    }
  }

  async function restoreProduct(product: Product) {
    setBusyId(product.id);
    setError('');
    setNotice('');
    try {
      const restoredProduct = await request<Product>(`/api/products?id=${encodeURIComponent(product.id)}`, {
        method: 'PUT',
        body: JSON.stringify({ ...toDraft(product), deleted: false, published: false }),
      });
      setProducts(current => current.map(item => item.id === restoredProduct.id ? restoredProduct : item));
      setNotice('Product restored as a draft. Publish it when it is ready for customers.');
      try {
        await loadProducts();
      } catch (refreshReason) {
        const detail = refreshReason instanceof Error ? refreshReason.message : 'Unknown refresh error.';
        setError(`The product was restored, but the catalogue could not refresh: ${detail}`);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not restore the product.');
    } finally {
      setBusyId('');
    }
  }

  const activeProducts = products.filter(product => product.deleted !== 1);
  const summary = {
    total: activeProducts.length,
    published: activeProducts.filter(product => product.published === 1).length,
    drafts: activeProducts.filter(product => product.published !== 1).length,
    featured: activeProducts.filter(product => product.featured === 1 && product.published === 1).length,
  };
  const filteredProducts = useMemo(() => products.filter(product => {
    const matchesView = view === 'archived' ? product.deleted === 1
      : product.deleted !== 1 && (view === 'all' || (view === 'published' ? product.published === 1 : product.published !== 1));
    const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase();
    return matchesView && haystack.includes(search.trim().toLowerCase());
  }), [products, search, view]);

  if (!token) {
    return (
      <main className="admin-login-page">
        <a className="admin-back-link" href="/"><ArrowLeft size={16} /> Return to FIDA</a>
        <section className="admin-login-card">
          <a className="admin-mark" href="/" aria-label="FIDA home">FIDA<span>STUDIO</span></a>
          <div className="admin-login-icon"><ShieldCheck size={23} /></div>
          <p className="admin-kicker">PRIVATE WORKSPACE</p>
          <h1>Welcome <em>back.</em></h1>
          <p className="admin-login-intro">Sign in to manage the FIDA collection, product imagery and publication status.</p>
          {error && <div className="admin-alert" role="alert"><CircleAlert size={17} />{error}</div>}
          <form className="admin-login-form" onSubmit={signIn}>
            <label>Admin username<input autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} required /></label>
            <label>Password<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></label>
            <button className="admin-primary-button" type="submit" disabled={loginBusy}>{loginBusy ? 'Signing in…' : 'Sign in securely'}<ArrowRight size={17} /></button>
          </form>
          <div className="admin-security-note"><ShieldCheck size={14} /> Protected admin session · 8-hour expiry</div>
        </section>
        <p className="admin-login-foot">FIDA · Fashions &amp; Lifestyles</p>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-mark" href="/" aria-label="FIDA home">FIDA<span>STUDIO</span></a>
        <div className="admin-workspace-label">MANAGEMENT</div>
        <div className="admin-side-link is-active"><LayoutDashboard size={17} /> Product catalogue</div>
        <a className="admin-side-link" href="/products" target="_blank" rel="noreferrer"><ExternalLink size={16} /> View storefront</a>
        <div className="admin-sidebar-bottom">
          <div className="admin-session-chip"><span className={`admin-session-dot ${dbConnected ? '' : 'is-offline'}`} /> {dbConnected ? 'PostgreSQL connected' : 'Database connection pending'}</div>
          <button className="admin-logout" onClick={() => { clearSession(); setNotice(''); setError(''); }}><LogOut size={16} /> Sign out</button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div><p className="admin-kicker">FIDA / COMMERCE</p><p className="admin-breadcrumb">Studio <span>/</span> Product catalogue</p></div>
          <div className="admin-topbar-actions"><span className="admin-secure-tag"><ShieldCheck size={15} /> Secure session</span><button className="admin-primary-button admin-add-button" onClick={openNewProduct}><Plus size={17} /> Add product</button></div>
        </header>

        <div className="admin-content">
          <div className="admin-page-heading"><div><p className="admin-kicker">THE COLLECTION</p><h1>Product <em>studio.</em></h1><p>Manage what customers discover on the FIDA storefront.</p></div><a className="admin-preview-link" href="/products" target="_blank" rel="noreferrer"><Eye size={16} /> Preview live collection <ArrowRight size={15} /></a></div>

          {error && <div className="admin-alert admin-alert-wide" role="alert"><CircleAlert size={17} />{error}<button onClick={() => setError('')} aria-label="Dismiss error"><X size={16} /></button></div>}
          {notice && <div className="admin-success" role="status"><Check size={17} />{notice}<button onClick={() => setNotice('')} aria-label="Dismiss message"><X size={16} /></button></div>}

          <div className="admin-stats-grid">
            <div className="admin-stat"><span className="admin-stat-icon"><Package size={18} /></span><span className="admin-stat-label">Active products</span><strong>{summary.total}</strong><small>Across all categories</small></div>
            <div className="admin-stat"><span className="admin-stat-icon"><Eye size={18} /></span><span className="admin-stat-label">Published</span><strong>{summary.published}</strong><small>Visible to customers</small></div>
            <div className="admin-stat"><span className="admin-stat-icon"><Clock3 size={18} /></span><span className="admin-stat-label">Drafts</span><strong>{summary.drafts}</strong><small>Not on the storefront</small></div>
            <div className="admin-stat"><span className="admin-stat-icon"><Check size={18} /></span><span className="admin-stat-label">Featured pieces</span><strong>{summary.featured}</strong><small>Highlighted on home</small></div>
          </div>

          <section className="admin-catalog-panel">
            <div className="admin-catalog-head"><div><h2>Your catalogue</h2><p>Changes saved here are shared with the public website through PostgreSQL.</p></div><span className={`admin-live-indicator ${dbConnected ? '' : 'is-offline'}`}><span /> {dbConnected ? 'LIVE SYNC' : loading ? 'SYNCING' : 'SYNC UNAVAILABLE'}</span></div>
            <div className="admin-catalog-toolbar">
              <div className="admin-view-tabs" role="tablist" aria-label="Filter products">
                {([['all', 'All products'], ['published', 'Published'], ['drafts', 'Drafts'], ['archived', 'Archived']] as [View, string][]).map(([key, label]) => <button key={key} role="tab" aria-selected={view === key} className={view === key ? 'is-selected' : ''} onClick={() => setView(key)}>{label}{key === 'archived' && products.some(product => product.deleted === 1) ? <span className="admin-tab-count">{products.filter(product => product.deleted === 1).length}</span> : null}</button>)}
              </div>
              <label className="admin-search"><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search the catalogue" aria-label="Search products" />{search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><X size={14} /></button>}</label>
            </div>

            {loading ? <div className="admin-table-empty"><div className="admin-loader" /><p>Loading your catalogue…</p></div> : filteredProducts.length ? (
              <div className="admin-table-scroll"><table className="admin-product-table"><thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>PRICE / LABEL</th><th>STATUS</th><th>FEATURED</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
                {filteredProducts.map(product => <tr key={product.id}>
                  <td><div className="admin-product-cell"><img src={product.image} alt="" loading="lazy" onError={event => { event.currentTarget.style.visibility = 'hidden'; }} /><div><strong>{product.name}</strong><small>{product.id}</small></div></div></td>
                  <td><span className="admin-category-chip">{product.category}</span></td>
                  <td>{product.price || <span className="admin-muted">On enquiry</span>}</td>
                  <td><span className={`admin-status ${product.deleted === 1 ? 'status-archived' : product.published === 1 ? 'status-published' : 'status-draft'}`}><span />{product.deleted === 1 ? 'Archived' : product.published === 1 ? 'Published' : 'Draft'}</span></td>
                  <td>{product.featured === 1 && product.published === 1 ? <span className="admin-featured"><Check size={13} /> Featured</span> : <span className="admin-muted">—</span>}</td>
                  <td><div className="admin-row-actions">{product.deleted === 1 ? <button title="Restore as draft" aria-label={`Restore ${product.name}`} disabled={busyId === product.id} onClick={() => void restoreProduct(product)}><ArrowDownToLine size={16} /></button> : <button title="Edit product" aria-label={`Edit ${product.name}`} onClick={() => openEditProduct(product)}><Edit3 size={16} /></button>}{product.deleted !== 1 && <button className="is-danger" title="Archive product" aria-label={`Archive ${product.name}`} disabled={busyId === product.id} onClick={() => void archiveProduct(product)}><Trash2 size={16} /></button>}</div></td>
                </tr>)}
              </tbody></table></div>
            ) : <div className="admin-table-empty"><div className="admin-empty-icon"><Package size={22} /></div><h3>{search ? 'No matching products' : view === 'archived' ? 'No archived products' : 'Nothing in this view yet'}</h3><p>{search ? 'Try a different product name or category.' : 'Add a product to start building your collection.'}</p>{view !== 'archived' && <button className="admin-secondary-button" onClick={openNewProduct}><Plus size={16} /> Add your first product</button>}</div>}
            <div className="admin-table-footer"><span>{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} shown</span><span><ShieldCheck size={14} /> Product details stored in PostgreSQL</span></div>
          </section>
          <footer className="admin-footer"><span>FIDA STUDIO · PRODUCT MANAGEMENT</span><span>Saved products sync to <a href="/products">the public collection <ExternalLink size={11} /></a></span></footer>
        </div>
      </section>

      {editorOpen && <div className="admin-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closeEditor(); }}>
        <section className="admin-editor-modal" role="dialog" aria-modal="true" aria-labelledby="admin-editor-title">
          <header className="admin-editor-header"><div><p className="admin-kicker">COLLECTION MANAGEMENT</p><h2 id="admin-editor-title">{editing ? 'Edit product' : 'Add a product'}</h2><p>{editing ? 'Refine the details and publish status.' : 'Introduce a new piece to the FIDA collection.'}</p></div><button className="admin-icon-button" type="button" onClick={closeEditor} aria-label="Close editor"><X size={20} /></button></header>
          <form className="admin-editor-form" onSubmit={saveProduct}>
            <div className="admin-editor-layout">
              <div className="admin-editor-fields">
                <div className="admin-form-grid"><label className="admin-form-field admin-field-full">Product name<input value={draft.name} maxLength={160} onChange={event => updateDraft('name', event.target.value)} placeholder="e.g. Ivory Embroidered Lehenga" required /></label><label className="admin-form-field">Category<input list="fida-product-categories" value={draft.category} maxLength={100} onChange={event => updateDraft('category', event.target.value)} placeholder="Choose or enter a category" required /><datalist id="fida-product-categories">{categorySuggestions.map(category => <option value={category} key={category} />)}</datalist></label><label className="admin-form-field">Price / display label<input value={draft.price} maxLength={100} onChange={event => updateDraft('price', event.target.value)} placeholder="e.g. ₹12,500 or On enquiry" /><small>Leave blank to show “Details & availability on enquiry”.</small></label><label className="admin-form-field admin-field-full">Product description<textarea value={draft.description} maxLength={8000} onChange={event => updateDraft('description', event.target.value)} rows={4} placeholder="Describe the silhouette, fabric, craft and details…" /></label><label className="admin-form-field admin-field-full">Image URL<input value={draft.image} onChange={event => { updateDraft('image', event.target.value); setImageFile(null); }} placeholder="https://… or /assets/products/…" /><small>Use an HTTPS image URL, or upload a file below. Local uploads are stored in PostgreSQL.</small></label></div>
                <div className="admin-publish-options"><label className="admin-toggle"><input type="checkbox" checked={draft.published} onChange={event => updateDraft('published', event.target.checked)} /><span className="admin-toggle-track" /><span><strong>Publish to storefront</strong><small>Customers can see this product on /products.</small></span></label><label className="admin-toggle"><input type="checkbox" checked={draft.featured} onChange={event => updateDraft('featured', event.target.checked)} /><span className="admin-toggle-track" /><span><strong>Feature on homepage</strong><small>Show this piece in the featured collection.</small></span></label></div>
              </div>
              <aside className="admin-image-panel"><p className="admin-kicker">PRODUCT IMAGE</p><div className={`admin-image-preview ${imagePreview ? 'has-image' : ''}`}>{imagePreview ? <img key={imagePreview} src={imagePreview} alt="Product preview" onError={event => { event.currentTarget.style.display = 'none'; }} /> : <div><ImagePlus size={30} /><span>Image preview</span></div>}</div><label className="admin-upload-button"><Upload size={16} />{imageFile ? 'Choose another image' : 'Upload image'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={event => chooseImage(event.target.files?.[0])} /></label>{imageFile && <p className="admin-upload-file"><Check size={13} />{imageFile.name}</p>}<p className="admin-upload-tip">JPG, PNG or WebP · Up to 10 MB; large photos are optimized to fit. GIF and AVIF · Up to 2 MB. Uploaded photos are stored in PostgreSQL.</p></aside>
            </div>
            {error && <div className="admin-alert" role="alert"><CircleAlert size={16} />{error}</div>}
            <footer className="admin-editor-footer"><button type="button" className="admin-secondary-button" onClick={closeEditor}>Cancel</button><button className="admin-primary-button" type="submit" disabled={saving}>{saving ? 'Saving product…' : editing ? 'Save changes' : 'Add product'}{!saving && <ArrowRight size={16} />}</button></footer>
          </form>
        </section>
      </div>}
    </main>
  );
}
