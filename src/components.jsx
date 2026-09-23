import React, { useEffect, useState } from "react";
import { Menu, MapPin, Music, Pause, Play, Heart, CalendarDays, Shirt, ExternalLink } from "lucide-react";

function Countdown({ date }) {
  const get = () => Math.max(0, new Date(date).getTime() - Date.now());
  const [ms, setMs] = useState(get());

  useEffect(() => {
    const timer = setInterval(() => setMs(get()), 1000);
    return () => clearInterval(timer);
  }, [date]);

  const total = Math.floor(ms / 1000);
  const values = {
    Dias: Math.floor(total / 86400),
    Horas: Math.floor((total % 86400) / 3600),
    Min: Math.floor((total % 3600) / 60),
    Seg: total % 60,
  };

  return (
    <div className="countdown">
      {Object.entries(values).map(([label, value]) => (
        <div className="time-box" key={label}>
          <strong>{String(value).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function Leaf({ flip = false }) {
  return (
    <svg className={`leaf ${flip ? "flip" : ""}`} viewBox="0 0 160 90">
      <path d="M4 73 C48 70 70 49 83 11" />
      <path d="M30 68 C27 52 20 42 7 35" />
      <path d="M45 61 C45 45 40 33 29 23" />
      <path d="M59 51 C64 38 63 26 57 16" />
      <path d="M24 69 C38 72 50 75 62 83" />
      <path d="M43 58 C56 61 68 66 76 73" />
      <path d="M66 41 C80 44 92 50 101 60" />
      <path d="M76 27 C91 29 104 34 116 44" />
    </svg>
  );
}

export function PublicInvitation({ invitation, trackView = false }) {
  const [menu, setMenu] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = React.useRef(null);

  useEffect(() => {
    if (trackView) {
      // La vista pública puede llamar a la función de tracking desde el contenedor.
    }
  }, [trackView]);

  const toggleMusic = async () => {
    if (!audioRef.current || !invitation.music_url) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setPlaying(true);
      } catch {}
    }
  };

  const confirmWhatsApp = () => {
    const number = (invitation.phone || "").replace(/\D/g, "");
    const message = encodeURIComponent(
      `Hola ${invitation.groom} y ${invitation.bride}, les escribo por su invitación de boda.`
    );
    if (number) window.open(`https://wa.me/${number}?text=${message}`, "_blank");
  };

  return (
    <div
      className={`public-site template-${invitation.template || "botanical"}`}
      style={{ "--accent": invitation.accent, "--paper": invitation.background }}
    >
      <button className="floating-menu" onClick={() => setMenu(!menu)} aria-label="Menú">
        <Menu size={19} />
      </button>

      {menu && (
        <nav className="public-menu">
          <a href="#inicio" onClick={() => setMenu(false)}>Inicio</a>
          <a href="#evento" onClick={() => setMenu(false)}>Evento</a>
          <a href="#galeria" onClick={() => setMenu(false)}>Galería</a>
          <a href="#detalles" onClick={() => setMenu(false)}>Detalles</a>
        </nav>
      )}

      {invitation.music_url && (
        <>
          <audio ref={audioRef} src={invitation.music_url} loop />
          <button className="music-toggle" onClick={toggleMusic}>
            {playing ? <Pause size={17} /> : <Play size={17} />}
          </button>
        </>
      )}

      <section id="inicio" className="hero-public">
        <div className="hero-paper">
          <div className="hero-botanical left"><Leaf /></div>
          <div className="hero-botanical right"><Leaf flip /></div>

          <p className="eyebrow">{invitation.announcement}</p>
          <h1>{invitation.groom} <span>&amp;</span> {invitation.bride}</h1>
          <p className="hero-subtitle">{invitation.subtitle}</p>

          <div className="hero-image">
            {invitation.hero_image ? (
              <img src={invitation.hero_image} alt={`${invitation.groom} y ${invitation.bride}`} />
            ) : (
              <div className="empty-photo">Agrega tu fotografía</div>
            )}
          </div>

          <p className="hero-date">{invitation.date_label}</p>
        </div>
      </section>

      <section className="public-section story">
        <div className="mini-ornament"><Leaf /></div>
        <p className="script-text">{invitation.dedication}</p>
        <div className="couple-name">{invitation.groom.toUpperCase()} &amp; {invitation.bride.toUpperCase()}</div>
        <Heart size={25} className="accent-icon" fill="currentColor" />
      </section>

      <section className="public-section date-block">
        <p className="section-kicker">RESERVA ESTA FECHA</p>
        <h2>{invitation.date_label}</h2>
        <p className="large-time">{invitation.time_label}</p>
        <Countdown date={invitation.date_iso} />
      </section>

      <section id="evento" className="public-section event-grid">
        <article className="event-box">
          <CalendarDays className="accent-icon" />
          <h3>Ceremonia</h3>
          <p>{invitation.ceremony}</p>
          <strong>{invitation.time_label}</strong>
          <a href={invitation.maps_url} target="_blank" rel="noreferrer"><MapPin size={14}/> Ver ubicación</a>
        </article>
        <article className="event-box">
          <Heart className="accent-icon" />
          <h3>Recepción</h3>
          <p>{invitation.reception}</p>
          <p>{invitation.address}</p>
          <a href={invitation.maps_url} target="_blank" rel="noreferrer"><ExternalLink size={14}/> Cómo llegar</a>
        </article>
        <article className="event-box">
          <Shirt className="accent-icon" />
          <h3>Vestimenta</h3>
          <p>{invitation.dress_code}</p>
          <p>Gracias por acompañarnos en este momento.</p>
        </article>
      </section>

      {invitation.gallery?.length > 0 && (
        <section id="galeria" className="public-section gallery-block">
          <p className="section-kicker">NUESTROS MOMENTOS</p>
          <h2>Una historia para recordar</h2>
          <div className="public-gallery">
            {invitation.gallery.map((url, index) => (
              <img src={url} key={index} alt={`Momento ${index + 1}`} />
            ))}
          </div>
        </section>
      )}

      <section id="detalles" className="public-section contact-block">
        <div className="contact-card">
          <p className="section-kicker">UN DÍA ESPECIAL</p>
          <h2>Gracias por acompañarnos</h2>
          <p>Será un honor compartir este momento contigo.</p>
          {invitation.phone && (
            <button className="accent-button" onClick={confirmWhatsApp}>
              Escribir por WhatsApp
            </button>
          )}
        </div>
      </section>

      <footer className="public-footer">
        <p>Con amor, {invitation.groom} &amp; {invitation.bride}</p>
        <small>Invitación digital</small>
      </footer>
    </div>
  );
}

export function Loading() {
  return <div className="loading-screen">Cargando BodasEditor...</div>;
}
