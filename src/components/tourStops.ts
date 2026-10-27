// Coordenadas en unidades del plano (foto 3×4, centro en 0,0). Textos descriptivos de lo que se ve en la foto.
export type Stop = { id: string; title: string; text: string; cam: [number, number, number]; look: [number, number] };
export const stops: Stop[] = [
  { id: "sala", title: "La sala", text: "Vista general del comedor.", cam: [0, 0, 4.6], look: [0, 0] },
  { id: "letrero", title: "El letrero", text: "CINEMA, sobre el arco de entrada a la segunda sala.", cam: [-0.1, 0.9, 2.5], look: [-0.1, 1.1] },
  { id: "sillas", title: "Sillas en el aire", text: "Sillas de colores colgadas del techo.", cam: [-0.6, 1.3, 2.4], look: [-0.7, 1.7] },
  { id: "arco", title: "El arco", text: "Cortinas rojas y, al fondo, la sala rosa.", cam: [-0.05, -0.05, 1.9], look: [-0.05, -0.05] },
  { id: "tigres", title: "Los tigres", text: "Cuadro enmarcado sobre la pared naranja.", cam: [0.9, 0.1, 2.3], look: [1.1, 0.1] },
  { id: "mesas", title: "Las mesas", text: "Mesas verdes y sillas tapizadas.", cam: [-0.3, -0.9, 2.2], look: [-0.3, -0.8] },
];
