import React, { useEffect, useMemo, useState } from "react";

import { Routes, Route, Link, useNavigate, useParams, Navigate } from "react-router-dom";

import {

  Heart, LayoutDashboard, Plus, LogOut, Settings, Eye, Edit3, Trash2,

  Copy, ExternalLink, Image as ImageIcon, Palette, Music2, MapPin, Save,

  ChevronLeft, Upload, Menu, X

} from "lucide-react";

import { useAuth } from "./auth";

import { supabaseEnabled } from "./supabase";

import { TEMPLATES, DEFAULT_INVITATION, invitationToForm } from "./data";

import {

  listInvitations, createInvitation, updateInvitation, deleteInvitation,

  getInvitation, getInvitationBySlug, incrementView, uploadImage

} from "./api";

import { PublicInvitation, Loading } from "./components";



function Layout({ children }) {

  const { user, signOut } = useAuth();

  const [open, setOpen] = useState(false);

  return (

    <div className="app-shell">

      <aside className={`app-sidebar ${open ? "open" : ""}`}>

        <div className="app-brand"><Heart size={19} fill="currentColor"/> Bodas<span>Editor</span></div>

        <nav>

          <Link to="/dashboard" onClick={() => setOpen(false)}><LayoutDashboard size={17}/> Dashboard</Link>

          <Link to="/crear" onClick={() => setOpen(false)}><Plus size={17}/> Nueva invitación</Link>

        </nav>

        <div className="sidebar-user">

          <small>{user?.email || "Modo demo local"}</small>

          <button onClick={signOut}><LogOut size={15}/> Salir</button>

        </div>

      </aside>

      <button className="mobile-menu" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>

      <main className="app-main">{children}</main>

    </div>

  );

}



function Dashboard() {

  const { user } = useAuth();

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();



  const load = async () => {

    setLoading(true);

    try { setItems(await listInvitations(user?.id || "demo")); }

    catch (e) { alert(e.message); }

    finally { setLoading(false); }

  };



  useEffect(() => { load(); }, [user?.id]);



  const totalViews = items.reduce((sum, x) => sum + (x.views || 0), 0);



  const remove = async (id) => {

    if (!confirm("¿Eliminar esta invitación?")) return;

    await deleteInvitation(id, user?.id || "demo");

    load();

  };



  const copyUrl = async (slug) => {

    const url = `${location.origin}/i/${slug}`;

    await navigator.clipboard.writeText(url);

    alert("Enlace copiado:\n" + url);

  };



  return (

    <Layout>

      <header className="topbar">

        <div>

          <p className="top-kicker">PANEL DE CONTROL</p>

          <h1>Mis invitaciones</h1>

          <p>Crea, personaliza y publica invitaciones digitales.</p>

        </div>

        <button className="primary-btn" onClick={() => navigate("/crear")}><Plus size={17}/> Nueva invitación</button>

      </header>



      <section className="stats">

        <div><span>Invitaciones</span><strong>{items.length}</strong></div>

        <div><span>Publicadas</span><strong>{items.filter(x => x.is_published).length}</strong></div>

        <div><span>Visitas</span><strong>{totalViews}</strong></div>

      </section>



      {loading ? <Loading/> : items.length === 0 ? (

        <div className="empty-dashboard">

          <Heart size={35}/>

          <h2>Aún no tienes invitaciones</h2>

          <p>Crea tu primera invitación y personalízala a tu gusto.</p>

          <button className="primary-btn" onClick={() => navigate("/crear")}><Plus size={17}/> Crear invitación</button>

        </div>

      ) : (

        <div className="invitation-grid">

          {items.map(item => (

            <article className="invitation-card" key={item.id}>

              <div className="card-cover" style={{ background: item.background }}>

                {item.hero_image ? <img src={item.hero_image} alt="" /> : <Heart size={42}/>}

                <span className={item.is_published ? "published" : "draft"}>

                  {item.is_published ? "PUBLICADA" : "BORRADOR"}

                </span>

              </div>

              <div className="card-body">

                <h3>{item.groom} &amp; {item.bride}</h3>

                <p>{item.date_label}</p>

                <div className="card-meta"><span><Eye size={14}/> {item.views || 0}</span><span>/{item.slug}</span></div>

                <div className="card-actions">

                  <button onClick={() => navigate(`/editar/${item.id}`)}><Edit3 size={15}/> Editar</button>

                  {item.is_published && <button onClick={() => copyUrl(item.slug)}><Copy size={15}/> Copiar</button>}

                  {item.is_published && <a href={`/i/${item.slug}`} target="_blank" rel="noreferrer"><ExternalLink size={15}/> Ver</a>}

                  <button className="danger" onClick={() => remove(item.id)}><Trash2 size={15}/></button>

                </div>

              </div>

            </article>

          ))}

        </div>

      )}

    </Layout>

  );

}



function Create() {

  const { user } = useAuth();

  const navigate = useNavigate();

  const [creating, setCreating] = useState(false);



  const create = async () => {

    setCreating(true);

    try {

      const item = await createInvitation(user?.id || "demo");

      navigate(`/editar/${item.id}`);

    } catch (e) { alert(e.message); }

    finally { setCreating(false); }

  };



  return (

    <Layout>

      <div className="create-page">

        <div className="create-icon"><Heart size={35}/></div>

        <h1>Crea una nueva invitación</h1>

        <p>Comienza con una plantilla y personaliza cada detalle.</p>

        <div className="template-chooser">

          {TEMPLATES.map(t => (

            <div className="template-mini" key={t.id} style={{ "--accent": t.accent, "--paper": t.background }}>

              <div className="mini-cover"><span>{t.name}</span></div>

              <h3>{t.name}</h3><p>{t.description}</p>

            </div>

          ))}

        </div>

        <button className="primary-btn big" onClick={create} disabled={creating}>

          <Plus size={18}/> {creating ? "Creando..." : "Crear invitación"}

        </button>

      </div>

    </Layout>

  );

}



function EditorPage() {

  const { id } = useParams();

  const { user } = useAuth();

  const navigate = useNavigate();

  const [inv, setInv] = useState(null);

  const [tab, setTab] = useState("portada");

  const [saving, setSaving] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [saved, setSaved] = useState(false);



  useEffect(() => {

    getInvitation(id, user?.id || "demo").then(x => setInv(invitationToForm(x))).catch(e => alert(e.message));

  }, [id, user?.id]);



  if (!inv) return <Loading/>;



  const update = (field, value) => setInv(prev => ({ ...prev, [field]: value }));



  const save = async () => {

    setSaving(true);

    try {

      const result = await updateInvitation(id, inv, user?.id || "demo");

      setInv(invitationToForm(result));

      setSaved(true);

      setTimeout(() => setSaved(false), 1800);

    } catch (e) { alert(e.message); }

    finally { setSaving(false); }

  };



  const upload = async (file, field) => {

    if (!file) return;

    setUploading(true);

    try {

      const url = await uploadImage(file, user?.id || "demo");

      if (field === "gallery") update("gallery", [...(inv.gallery || []), url]);

      else update(field, url);

    } catch (e) { alert(e.message); }

    finally { setUploading(false); }

  };



  const publish = async () => {

    const next = !inv.is_published;

    try {

      const result = await updateInvitation(id, { ...inv, is_published: next }, user?.id || "demo");

      setInv(invitationToForm(result));

    } catch (e) { alert(e.message); }

  };



  const tabs = [

    ["portada", "Portada"], ["evento", "Evento"], ["detalles", "Detalles"],

    ["galeria", "Galería"], ["diseño", "Diseño"], ["musica", "Música"]

  ];



  return (

    <div className="full-editor">

      <header className="editor-topbar">

        <button className="back-btn" onClick={() => navigate("/dashboard")}><ChevronLeft size={18}/> Mis invitaciones</button>

        <div className="editor-title"><Heart size={16}/> {inv.groom} &amp; {inv.bride}</div>

        <div className="editor-top-actions">

          {saved && <span className="saved">✓ Guardado</span>}

          <a className="outline-btn" href={`/i/${inv.slug}`} target="_blank" rel="noreferrer"><Eye size={16}/> Vista pública</a>

          <button className="primary-btn" onClick={save} disabled={saving}><Save size={16}/> {saving ? "Guardando" : "Guardar"}</button>

          <button className={inv.is_published ? "unpublish-btn" : "publish-btn"} onClick={publish}>

            {inv.is_published ? "Despublicar" : "Publicar"}

          </button>

        </div>

      </header>



      <div className="editor-workspace">

        <aside className="editor-menu">

          {tabs.map(([key, label]) => (

            <button className={tab === key ? "active" : ""} onClick={() => setTab(key)} key={key}>

              {key === "portada" && <Heart size={16}/>}

              {key === "evento" && <MapPin size={16}/>}

              {key === "detalles" && <Settings size={16}/>}

              {key === "galeria" && <ImageIcon size={16}/>}

              {key === "diseño" && <Palette size={16}/>}

              {key === "musica" && <Music2 size={16}/>}

              {label}

            </button>

          ))}

        </aside>



        <section className="editor-controls">

          {tab === "portada" && <CoverControls inv={inv} update={update} upload={upload} uploading={uploading}/>}

          {tab === "evento" && <EventControls inv={inv} update={update}/>}

          {tab === "detalles" && <DetailControls inv={inv} update={update}/>}

          {tab === "galeria" && <GalleryControls inv={inv} update={update} upload={upload} uploading={uploading}/>}

          {tab === "diseño" && <DesignControls inv={inv} update={update}/>}

          {tab === "musica" && <MusicControls inv={inv} update={update} upload={upload} uploading={uploading}/>}

        </section>



        <section className="live-preview">

          <div className="preview-label">VISTA PREVIA EN VIVO</div>

          <div className="phone-preview"><PublicInvitation invitation={inv}/></div>

        </section>

      </div>

    </div>

  );

}



function Field({ label, children, full=false }) {

  return <label className={full ? "field full" : "field"}><span>{label}</span>{children}</label>;

}

function Input({ value, onChange, ...props }) {

  return <input value={value ?? ""} onChange={e => onChange(e.target.value)} {...props}/>;

}



function PanelTitle({ title, text }) {

  return <div className="panel-title"><h2>{title}</h2><p>{text}</p></div>;

}



function CoverControls({ inv, update, upload, uploading }) {

  return <div className="controls-inner">

    <PanelTitle title="Portada" text="La primera pantalla que verán tus invitados."/>

    <div className="form-two">

      <Field label="Nombre del novio"><Input value={inv.groom} onChange={v => update("groom", v)}/></Field>

      <Field label="Nombre de la novia"><Input value={inv.bride} onChange={v => update("bride", v)}/></Field>

      <Field label="Anuncio" full><Input value={inv.announcement} onChange={v => update("announcement", v)}/></Field>

      <Field label="Subtítulo" full><Input value={inv.subtitle} onChange={v => update("subtitle", v)}/></Field>

      <Field label="Dedicatoria" full><textarea rows="7" value={inv.dedication} onChange={e => update("dedication", e.target.value)}/></Field>

      <Field label="Fotografía principal" full>

        <input type="file" accept="image/*" onChange={e => upload(e.target.files?.[0], "hero_image")}/>

        {uploading && <small>Subiendo...</small>}

        {inv.hero_image && <img className="control-thumb" src={inv.hero_image} alt="Vista previa"/>}

      </Field>

      <Field label="URL pública / slug" full>

        <Input value={inv.slug} onChange={v => update("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}/>

        <small>Ejemplo: juan-y-maria</small>

      </Field>

    </div>

  </div>;

}



function EventControls({ inv, update }) {

  return <div className="controls-inner">

    <PanelTitle title="Evento" text="Fecha, horario y lugares de la celebración."/>

    <div className="form-two">

      <Field label="Fecha"><input type="date" value={inv.date_iso?.slice(0,10)} onChange={e => update("date_iso", `${e.target.value}T${inv.time_label || "18:00"}:00-04:00`)}/></Field>

      <Field label="Hora"><Input value={inv.time_label} onChange={v => update("time_label", v)}/></Field>

      <Field label="Texto de fecha" full><Input value={inv.date_label} onChange={v => update("date_label", v)}/></Field>

      <Field label="Ceremonia"><Input value={inv.ceremony} onChange={v => update("ceremony", v)}/></Field>

      <Field label="Recepción"><Input value={inv.reception} onChange={v => update("reception", v)}/></Field>

      <Field label="Dirección" full><Input value={inv.address} onChange={v => update("address", v)}/></Field>

      <Field label="Google Maps" full><Input value={inv.maps_url} onChange={v => update("maps_url", v)}/></Field>

    </div>

  </div>;

}



function DetailControls({ inv, update }) {

  return <div className="controls-inner">

    <PanelTitle title="Detalles" text="Información adicional de la invitación."/>

    <div className="form-two">

      <Field label="Código de vestimenta"><Input value={inv.dress_code} onChange={v => update("dress_code", v)}/></Field>

      <Field label="WhatsApp"><Input value={inv.phone} onChange={v => update("phone", v)}/></Field>

    </div>

    <div className="info-note">

      <strong>RSVP no incluido.</strong>

      <p>Esta versión no incorpora confirmación de asistencia ni gestión de invitados, tal como solicitaste.</p>

    </div>

  </div>;

}



function GalleryControls({ inv, update, upload, uploading }) {

  const remove = (index) => update("gallery", inv.gallery.filter((_, i) => i !== index));

  return <div className="controls-inner">

    <PanelTitle title="Galería" text="Sube fotografías para mostrar la historia de la pareja."/>

    <label className="upload-zone">

      <Upload size={27}/>

      <strong>{uploading ? "Subiendo..." : "Seleccionar fotografía"}</strong>

      <span>JPG, PNG o WEBP</span>

      <input type="file" accept="image/*" onChange={e => upload(e.target.files?.[0], "gallery")}/>

    </label>

    <div className="gallery-control-grid">

      {(inv.gallery || []).map((url, i) => (

        <div key={i} className="gallery-control-item">

          <img src={url} alt={`Galería ${i+1}`}/>

          <button onClick={() => remove(i)}><Trash2 size={15}/></button>

        </div>

      ))}

    </div>

  </div>;

}



function DesignControls({ inv, update }) {

  return <div className="controls-inner">

    <PanelTitle title="Diseño" text="Elige una plantilla y personaliza sus colores."/>

    <div className="design-list">

      {TEMPLATES.map(t => (

        <button key={t.id} className={inv.template === t.id ? "design-option selected" : "design-option"}

          onClick={() => update("template", t.id)}>

          <div className="design-swatch" style={{ background: t.background, "--accent": t.accent }}>

            <span>R &amp; A</span>

          </div>

          <strong>{t.name}</strong><small>{t.description}</small>

        </button>

      ))}

    </div>

    <div className="form-two">

      <Field label="Color principal"><input type="color" value={inv.accent} onChange={e => update("accent", e.target.value)}/></Field>

      <Field label="Color de fondo"><input type="color" value={inv.background} onChange={e => update("background", e.target.value)}/></Field>

    </div>

  </div>;

}



function MusicControls({ inv, update, upload, uploading }) {

  return <div className="controls-inner">

    <PanelTitle title="Música" text="Añade una pista de fondo a la invitación."/>

    <Field label="Archivo de música">

      <input type="file" accept="audio/*" onChange={e => upload(e.target.files?.[0], "music_url")}/>

      {uploading && <small>Subiendo...</small>}

    </Field>

    <Field label="O también puedes usar una URL">

      <Input value={inv.music_url} onChange={v => update("music_url", v)} placeholder="https://.../musica.mp3"/>

    </Field>

    <div className="info-note">

      <strong>Nota:</strong>

      <p>Los navegadores normalmente bloquean la reproducción automática. El invitado debe pulsar el botón de música para iniciar la pista.</p>

    </div>

  </div>;

}



function PublicPage() {

  const { slug } = useParams();

  const [inv, setInv] = useState(null);

  const [error, setError] = useState("");



  useEffect(() => {

    getInvitationBySlug(slug)

      .then(async data => {

        if (!data) {

          setError("La invitación no existe o todavía no está publicada.");

          return;

        }

        setInv(invitationToForm(data));

        if (data.id) await incrementView(data.id);

      })

      .catch(e => setError(e.message));

  }, [slug]);



  if (error) return <div className="not-found"><Heart/><h1>Invitación no disponible</h1><p>{error}</p></div>;

  if (!inv) return <Loading/>;

  return <PublicInvitation invitation={inv} trackView/>;

}



function Home() {

  const { user, supabaseEnabled } = useAuth();

  if (user || !supabaseEnabled) return <Navigate to="/dashboard" replace/>;

  return <AuthPage/>;

}



function AuthPage() {

  const { signIn, signUp, supabaseEnabled } = useAuth();

  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);

  const [message, setMessage] = useState("");



  const submit = async e => {

    e.preventDefault();

    setBusy(true); setMessage("");

    try {

      const result = mode === "login" ? await signIn(email, password) : await signUp(email, password);

      if (result.error) throw result.error;

      setMessage(mode === "login" ? "Sesión iniciada." : "Cuenta creada. Revisa tu correo si Supabase solicita confirmación.");

    } catch (e) { setMessage(e.message); }

    finally { setBusy(false); }

  };



  if (!supabaseEnabled) {

    return (

      <div className="auth-page">

        <div className="auth-card">

          <div className="auth-logo"><Heart size={20} fill="currentColor"/> Bodas<span>Editor</span></div>

          <h1>Modo demo</h1>

          <p>El proyecto funciona localmente sin Supabase. Los datos se guardan en tu navegador.</p>

          <Link className="primary-btn centered" to="/dashboard">Entrar al editor</Link>

          <div className="info-note"><strong>Para producción:</strong><p>Crea un proyecto Supabase y configura <code>.env.local</code> con la URL y la anon key.</p></div>

        </div>

      </div>

    );

  }



  return (

    <div className="auth-page">

      <form className="auth-card" onSubmit={submit}>

        <div className="auth-logo"><Heart size={20} fill="currentColor"/> Bodas<span>Editor</span></div>

        <h1>{mode === "login" ? "Bienvenido" : "Crear cuenta"}</h1>

        <p>{mode === "login" ? "Ingresa para administrar tus invitaciones." : "Crea tu cuenta para guardar tus invitaciones en la nube."}</p>

        <Field label="Correo electrónico"><input type="email" value={email} onChange={e => setEmail(e.target.value)} required/></Field>

        <Field label="Contraseña"><input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required/></Field>

        {message && <div className="auth-message">{message}</div>}

        <button className="primary-btn centered" disabled={busy}>{busy ? "Procesando..." : mode === "login" ? "Iniciar sesión" : "Registrarme"}</button>

        <button type="button" className="text-button" onClick={() => setMode(mode === "login" ? "register" : "login")}>

          {mode === "login" ? "No tengo cuenta → Registrarme" : "Ya tengo cuenta → Iniciar sesión"}

        </button>

      </form>

    </div>

  );

}



function RequireAuth({ children }) {

  const { user, loading, supabaseEnabled } = useAuth();

  if (loading) return <Loading/>;

  if (!user && supabaseEnabled) return <Navigate to="/" replace/>;

  return children;

}



export default function App() {

  return (

    <Routes>

      <Route path="/" element={<Home/>}/>

      <Route path="/i/:slug" element={<PublicPage/>}/>

      <Route path="/dashboard" element={<RequireAuth><Dashboard/></RequireAuth>}/>

      <Route path="/crear" element={<RequireAuth><Create/></RequireAuth>}/>

      <Route path="/editar/:id" element={<RequireAuth><EditorPage/></RequireAuth>}/>

      <Route path="*" element={<Navigate to="/" replace/>}/>

    </Routes>

  );

} 