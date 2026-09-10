import { Book, BookStatus, CurrencyCode, StoreSettings } from '../types';
import { BcvRates, calculateBcvBreakdown, formatCurrencyAmount } from '../services/bcvRates';

export function formatPrice(
  amount: number,
  currencySymbolOrCode: string = '$',
  currency?: CurrencyCode
): string {
  const code: CurrencyCode = currency || (currencySymbolOrCode === '€' ? 'EUR' : currencySymbolOrCode === 'Bs.' ? 'VES' : 'USD');
  return formatCurrencyAmount(amount, code, true);
}

export function getStatusDetails(status: BookStatus) {
  switch (status) {
    case 'disponible':
      return {
        label: 'Disponible',
        tagText: 'Disponible',
        fullDescription: 'Disponible para entrega inmediata',
        badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        dotColor: 'bg-emerald-500',
      };
    case 'bajo_pedido':
      return {
        label: 'Bajo Pedido',
        tagText: 'Bajo Pedido',
        fullDescription: 'Bajo pedido (disponible en 3 a 5 días hábiles)',
        badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
        dotColor: 'bg-amber-500',
      };
    case 'agotado':
      return {
        label: 'Agotado',
        tagText: 'Agotado',
        fullDescription: 'Agotado temporalmente (puedes consultar reposición)',
        badgeBg: 'bg-stone-100 border-stone-200 text-stone-600',
        dotColor: 'bg-stone-400',
      };
  }
}

export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export function buildWhatsAppMessage(
  book: Book,
  settings: StoreSettings,
  rates?: BcvRates
): string {
  const statusInfo = getStatusDetails(book.status);
  const template = settings.whatsappTemplate || '¡Hola {tienda}! Me interesa comprar el libro "{titulo}" de {autor}.';
  const currency: CurrencyCode = book.currency || 'USD';
  const priceDisplay = formatPrice(book.price, settings.currencySymbol, currency);

  let bcvPriceDisplay = priceDisplay;
  if (rates && currency !== 'VES') {
    const breakdown = calculateBcvBreakdown(book.price, currency, rates);
    bcvPriceDisplay = `${priceDisplay} (Aprox. ${breakdown.bolivaresFormatted} tasa oficial BCV)`;
  }

  let msg = template
    .replace(/{titulo}/gi, book.title)
    .replace(/{autor}/gi, book.author)
    .replace(/{precio}/gi, bcvPriceDisplay)
    .replace(/{estado}/gi, statusInfo.label)
    .replace(/{tienda}/gi, settings.storeName)
    .replace(/{genero}/gi, book.genre)
    .replace(/{id}/gi, book.id);

  return msg;
}

export function generateWhatsAppUrl(
  book: Book,
  settings: StoreSettings,
  rates?: BcvRates
): string {
  const rawNumber = settings.whatsappNumber || '';
  const cleanNumber = cleanPhoneNumber(rawNumber);
  const text = buildWhatsAppMessage(book, settings, rates);

  if (!cleanNumber) {
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

export function generateWishlistWhatsAppUrl(
  books: Book[],
  settings: StoreSettings,
  rates?: BcvRates
): string {
  const rawNumber = settings.whatsappNumber || '';
  const cleanNumber = cleanPhoneNumber(rawNumber);

  const bookListStr = books
    .map((b, i) => {
      const cur: CurrencyCode = b.currency || 'USD';
      const pStr = formatPrice(b.price, settings.currencySymbol, cur);
      let bcvExtra = '';
      if (rates && cur !== 'VES') {
        const bd = calculateBcvBreakdown(b.price, cur, rates);
        bcvExtra = ` ~ ${bd.bolivaresFormatted} BCV`;
      }
      return `${i + 1}. *${b.title}* - ${b.author} (${pStr}${bcvExtra} | ${getStatusDetails(b.status).label})`;
    })
    .join('\n');

  const text = `¡Hola ${settings.storeName}! 👋📚\nEstuve revisando su catálogo y me gustaría cotizar o adquirir los siguientes ${books.length} libros:\n\n${bookListStr}\n\n¿Tienen disponibilidad y cómo procedemos con el pago y envío según tasa oficial BCV? ¡Muchas gracias!`;

  if (!cleanNumber) {
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}
