export type TipoCodigo = 'visitante' | 'estudiante';

// 6 dígitos: código temporal de visitante. 10 dígitos: código estudiantil (puede empezar en 0).
// Siempre se maneja como texto para no perder los ceros iniciales.
export const clasificarCodigo = (valor: unknown): { tipo: TipoCodigo; codigo: string } => {
  const codigo = typeof valor === 'string' ? valor.trim() : '';
  if (/^\d{6}$/.test(codigo)) return { tipo: 'visitante', codigo };
  if (/^\d{10}$/.test(codigo)) return { tipo: 'estudiante', codigo };
  // descartar: un pendiente offline con formato inválido nunca se va a poder aplicar
  throw Object.assign(new Error('El código no tiene un formato válido'), { descartar: true });
};