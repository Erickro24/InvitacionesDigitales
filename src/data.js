export const TEMPLATES = [
  {
    id: "botanical",
    name: "Botanical",
    description: "Verde salvia, hojas y estilo romántico.",
    accent: "#7f8f73",
    background: "#f8f5ef",
  },
  {
    id: "elegant",
    name: "Elegante",
    description: "Minimalista, sobrio y sofisticado.",
    accent: "#9b7b55",
    background: "#f7f4ef",
  },
  {
    id: "rose",
    name: "Romántico",
    description: "Tonos suaves y detalles florales.",
    accent: "#b77c82",
    background: "#fbf4f4",
  },
  {
    id: "modern",
    name: "Moderno",
    description: "Tipografía limpia y composición contemporánea.",
    accent: "#4c6370",
    background: "#f3f5f6",
  },
];

export const DEFAULT_INVITATION = {
  id: null,
  user_id: null,
  slug: "mi-boda",
  groom: "Ruddy",
  bride: "Alan",
  announcement: "¡Nos casamos!",
  subtitle: "Y queremos que formes parte de este día tan especial",
  dedication:
    "Porque has sido parte de nuestro camino, queremos que también lo seas de nuestro destino. Nos encantaría que nos acompañes a celebrar nuestra boda. ¡Hagamos de este día un recuerdo inolvidable!",
  date_iso: "2027-05-15T18:00:00-04:00",
  date_label: "Sábado 15 de mayo de 2027",
  time_label: "18:00",
  ceremony: "Iglesia / Salón de ceremonias",
  reception: "Salón de eventos",
  address: "La Paz, Bolivia",
  maps_url: "https://maps.google.com/",
  dress_code: "Formal",
  phone: "+591 70000000",
  hero_image: "",
  gallery: [],
  music_url: "",
  template: "botanical",
  accent: "#7f8f73",
  background: "#f8f5ef",
  is_published: false,
  views: 0,
  created_at: null,
};

export function invitationToForm(row) {
  return { ...DEFAULT_INVITATION, ...row };
}
