// Iconografía propia: trazo fino, 24×24, hereda el color.
const p = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.4, "aria-hidden": true } as const;
export const Clapper = () => <svg {...p}><path d="M3 9h18v11H3zM3 9l2.5-5L9 9m0-5 3.5 5M12.5 4 16 9m-3.5-5h4.5L20 9" /></svg>;
export const Frame = () => <svg {...p}><rect x="3" y="5" width="18" height="14" /><path d="M3 9h18M3 15h18M7 5v14M17 5v14" /></svg>;
export const Pin = () => <svg {...p}><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>;
export const Phone = () => <svg {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>;
