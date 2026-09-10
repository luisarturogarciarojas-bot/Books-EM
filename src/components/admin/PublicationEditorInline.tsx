import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Check,
  AlertCircle,
  Eye,
  DollarSign,
  Star,
  BookOpen,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  X,
  TrendingUp,
  Trash2,
} from 'lucide-react';
import { Book, BookStatus, CurrencyCode } from '../../types';
import { formatPrice, getStatusDetails } from '../../utils/helpers';
import { BcvRates, calculateBcvBreakdown, getCurrencySymbol } from '../../services/bcvRates';

interface PublicationEditorInlineProps {
  bookToEdit: Book | null;
  currencySymbol: string;
  bcvRates?: BcvRates;
  onClose: () => void;
  onSave: (bookData: Omit<Book, 'id' | 'createdAt'>, existingId?: string) => void;
}

const COMMON_GENRES = [
  'Novela',
  'Realismo Mágico',
  'Desarrollo Personal',
  'Misterio y Novela',
  'Ciencia Ficción Distópica',
  'Clásicos y Filosofía',
  'Thriller Psicológico',
  'Romance',
  'Historia y Ensayo',
  'Fantasía',
  'Infantil y Juvenil',
];

export const PublicationEditorInline: React.FC<PublicationEditorInlineProps> = ({
  bookToEdit,
  currencySymbol,
  bcvRates,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [price, setPrice] = useState<number>(15);
  const [status, setStatus] = useState<BookStatus>('disponible');
  const [featured, setFeatured] = useState(false);
  const [coverUrl, setCoverUrl] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [editorial, setEditorial] = useState('');
  const [pages, setPages] = useState<number | ''>('');
  const [publishedYear, setPublishedYear] = useState<number | ''>('');
  const [isbn, setIsbn] = useState('');

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setAuthor(bookToEdit.author);
      setGenre(bookToEdit.genre);
      setCurrency(bookToEdit.currency || 'USD');
      setPrice(bookToEdit.price);
      setStatus(bookToEdit.status);
      setFeatured(bookToEdit.featured);
      setCoverUrl(bookToEdit.coverUrl || '');
      setSynopsis(bookToEdit.synopsis);
      setEditorial(bookToEdit.editorial || '');
      setPages(bookToEdit.pages || '');
      setPublishedYear(bookToEdit.publishedYear || '');
      setIsbn(bookToEdit.isbn || '');
      setShowAdvanced(Boolean(bookToEdit.editorial || bookToEdit.pages || bookToEdit.isbn));
    } else {
      // Defaults for new book
      setTitle('');
      setAuthor('');
      setGenre('Novela');
      setCurrency('USD');
      setPrice(15);
      setStatus('disponible');
      setFeatured(false);
      setCoverUrl('');
      setSynopsis('');
      setEditorial('');
      setPages('');
      setPublishedYear(new Date().getFullYear());
      setIsbn('');
      setShowAdvanced(false);
    }
    setErrorMessage('');
  }, [bookToEdit]);

  // Handle local image file upload via FileReader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 3.5 * 1024 * 1024) {
      setErrorMessage('La imagen es demasiado pesada. Elige una de menos de 3.5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCoverUrl(reader.result);
        setErrorMessage('');
      }
    };
    reader.readAsDataURL(file);
  };

  const adjustPrice = (delta: number) => {
    setPrice((prev) => {
      const current = Number(prev) || 0;
      const updated = Math.max(0, current + delta);
      return currency === 'VES' ? Math.round(updated) : Number(updated.toFixed(2));
    });
  };

  const bcvBreakdown = bcvRates ? calculateBcvBreakdown(price, currency, bcvRates) : null;
  const currentSymbol = getCurrencySymbol(currency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !genre.trim() || price <= 0 || !synopsis.trim()) {
      setErrorMessage('Completa los campos obligatorios: título, autor, género, precio válido y sinopsis.');
      return;
    }

    if (!coverUrl.trim()) {
      setErrorMessage('Por favor sube una foto para la portada de la publicación.');
      return;
    }

    onSave(
      {
        title: title.trim(),
        author: author.trim(),
        genre: genre.trim(),
        price: Number(price),
        currency,
        status,
        featured,
        coverUrl: coverUrl.trim(),
        synopsis: synopsis.trim(),
        editorial: editorial.trim() || undefined,
        pages: pages ? Number(pages) : undefined,
        publishedYear: publishedYear ? Number(publishedYear) : undefined,
        isbn: isbn.trim() || undefined,
      },
      bookToEdit?.id
    );
  };

  const statusInfo = getStatusDetails(status);

  return (
    <div
      id="publication-editor-inline"
      className="bg-white rounded-3xl border border-[#E8DFD0] shadow-xs p-5 sm:p-8 space-y-6 animate-in fade-in duration-200"
    >
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#EFE8DF] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#F4EFEB] text-[#5C3218] flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h2 className="font-brand text-xl sm:text-2xl font-bold text-[#3B2213]">
              {bookToEdit ? `Modificar: «${bookToEdit.title}»` : 'Crear Nueva Publicación'}
            </h2>
            <p className="text-xs text-[#735F52]">
              Edición directa en página • Sin ventanas flotantes ni capas emergentes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          id="editor-back-to-publications-btn"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF7F2] hover:bg-[#EFE8DF] border border-[#E5DACB] text-[#5C3218] rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Publicaciones</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Grid: Left preview / Right inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Preview Column */}
          <div className="lg:col-span-4 bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-[#EAE1D4] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#735F52] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#8C5E3C]" />
                Vista Previa de la Tarjeta
              </span>
              <span className="text-[10px] text-[#8C7464]">Tiempo real</span>
            </div>

            {/* Publication Card Preview */}
            <div className="bg-white rounded-2xl border border-[#E8DFD0] overflow-hidden shadow-xs">
              <div className="aspect-[3/4] w-full bg-[#EFE8DF] overflow-hidden relative">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="Vista previa de portada"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#8C7464] p-4 text-center bg-[#F4EFEB]">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-40 text-[#8C7464]" />
                    <span className="text-xs font-bold text-[#5C3218]">Sin foto de portada</span>
                    <span className="text-[10px] text-[#8C7464] mt-1">Sube una foto a la derecha</span>
                  </div>
                )}
                {featured && (
                  <div className="absolute top-2 left-2 bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-xs">
                    <Star className="w-3 h-3 fill-amber-950" />
                    <span>Destacado</span>
                  </div>
                )}
                <div className="absolute bottom-2 right-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${statusInfo.badgeBg}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              <div className="p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5E3C] block">
                  {genre || 'Género'}
                </span>
                <h4 className="font-serif-title text-sm font-bold text-[#2D241E] line-clamp-1 mt-0.5">
                  {title || 'Título del libro'}
                </h4>
                <p className="text-xs text-[#735F52] line-clamp-1">
                  {author || 'Nombre del autor'}
                </p>
                <div className="mt-2.5 pt-2 border-t border-[#F2ECE4]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-brand font-bold text-[#5C3218]">
                      {formatPrice(price, currencySymbol, currency)}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                      WhatsApp Listo
                    </span>
                  </div>
                  {bcvBreakdown && currency !== 'VES' && (
                    <div className="flex items-center gap-1 text-[11px] text-[#735F52] mt-0.5">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      <span>≈ {bcvBreakdown.bolivaresFormatted}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#8C7464] leading-relaxed">
              Los cambios que realices se guardarán de forma permanente en el catálogo de tu librería.
            </p>
          </div>

          {/* Right Inputs Column */}
          <div className="lg:col-span-8 space-y-4">
            {/* Title & Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                  Título de la Publicación *
                </label>
                <input
                  type="text"
                  required
                  id="inline-input-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej. El Principito"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                  Autor *
                </label>
                <input
                  type="text"
                  required
                  id="inline-input-author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="ej. Antoine de Saint-Exupéry"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Genre & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                  Género Literario *
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    id="inline-input-genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="Escribe o selecciona abajo"
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white"
                  />
                  <div className="flex flex-wrap gap-1">
                    {COMMON_GENRES.slice(0, 6).map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setGenre(g)}
                        className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                          genre === g
                            ? 'bg-[#5C3218] text-white border-[#5C3218] font-bold'
                            : 'bg-white text-[#735F52] hover:bg-[#FAF7F2] border-[#E8DFC8]'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218]">
                  Moneda y Precio de Venta *
                </label>

                {/* Currency Selector (USD, EUR, VES) */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FAF7F2] rounded-xl border border-[#E5DACB]">
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      currency === 'USD'
                        ? 'bg-[#5C3218] text-white shadow-xs'
                        : 'text-[#6E5A4E] hover:bg-[#EFE8DF]'
                    }`}
                  >
                    <span>$ Dólares</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('EUR')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      currency === 'EUR'
                        ? 'bg-[#5C3218] text-white shadow-xs'
                        : 'text-[#6E5A4E] hover:bg-[#EFE8DF]'
                    }`}
                  >
                    <span>€ Euros</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('VES')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      currency === 'VES'
                        ? 'bg-[#5C3218] text-white shadow-xs'
                        : 'text-[#6E5A4E] hover:bg-[#EFE8DF]'
                    }`}
                  >
                    <span>Bs. Bolívares</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#8C7464]">
                      {currentSymbol}
                    </span>
                    <input
                      type="number"
                      required
                      min={0}
                      step={currency === 'VES' ? 10 : 0.5}
                      id="inline-input-price"
                      value={price}
                      onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-10 pr-4 py-2 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm font-bold text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white"
                    />
                  </div>

                  {/* Quick delta buttons based on currency */}
                  <div className="flex gap-1.5">
                    {(currency === 'VES' ? [-1000, -500, 500, 1000] : [-5, -1, 1, 5, 10]).map((delta) => (
                      <button
                        type="button"
                        key={delta}
                        onClick={() => adjustPrice(delta)}
                        className="text-[10px] font-bold px-2 py-1 bg-[#FAF7F2] hover:bg-[#EFE8DF] border border-[#E5DACB] rounded-lg text-[#5C3218] cursor-pointer"
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>

                  {/* Live BCV official conversion notice */}
                  {bcvBreakdown && (
                    <div className="bg-[#FAF7F2] border border-[#EAE1D4] rounded-xl p-2.5 text-[11px] space-y-1 text-[#735F52]">
                      <div className="flex items-center justify-between font-medium">
                        <span className="flex items-center gap-1 text-[#5C3218] font-bold">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Equivalente BCV:</span>
                        </span>
                        <span className="font-mono font-bold text-[#2D241E]">
                          {currency !== 'VES' ? bcvBreakdown.bolivaresFormatted : `${bcvBreakdown.usdFormatted} / ${bcvBreakdown.eurFormatted}`}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#8C7464]">
                        Tasa oficial Banco Central de Venezuela ({bcvBreakdown.rateAppliedText})
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status & Featured */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE1D4]">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1.5">
                  Estado de Disponibilidad
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'disponible', label: 'Disponible', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                    { id: 'bajo_pedido', label: 'Bajo Pedido', color: 'border-amber-500 bg-amber-50 text-amber-800' },
                    { id: 'agotado', label: 'Agotado', color: 'border-stone-400 bg-stone-100 text-stone-700' },
                  ].map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setStatus(s.id as BookStatus)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                        status === s.id ? `${s.color} ring-2 ring-[#5C3218]/20 shadow-2xs` : 'bg-white border-[#E5DACB] text-[#735F52] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1.5">
                  Visibilidad Destacada
                </label>
                <label className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#E5DACB] cursor-pointer hover:bg-[#FAF7F2] transition-colors">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 text-[#5C3218] rounded focus:ring-[#8C5E3C] cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5">
                    <Star className={`w-4 h-4 ${featured ? 'fill-amber-400 text-amber-500' : 'text-[#8C7464]'}`} />
                    <span className="text-xs font-bold text-[#2D241E]">
                      Mostrar como Libro Destacado
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Cover Image Controls - ONLY photo upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1.5">
                Foto de Portada del Libro *
              </label>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                id="inline-file-upload-cover"
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />

              {coverUrl ? (
                /* Card showing current uploaded photo with action to change or delete */
                <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DACB] rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-18 rounded-lg overflow-hidden border border-[#D5C7B7] bg-white shrink-0 shadow-2xs">
                      <img
                        src={coverUrl}
                        alt="Portada seleccionada"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>Foto de portada cargada</span>
                      </div>
                      <p className="text-[11px] text-[#735F52] truncate mt-0.5">
                        Imagen lista para la publicación
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      id="inline-btn-change-photo"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-white hover:bg-[#F4ECE3] border border-[#D5C7B7] text-[#5C3218] rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Cambiar Foto</span>
                    </button>
                    <button
                      type="button"
                      id="inline-btn-remove-photo"
                      onClick={() => setCoverUrl('')}
                      className="p-2 text-[#8C7464] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Quitar foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Card when no photo has been uploaded yet */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group p-6 bg-[#FAF7F2] hover:bg-[#F5ECE0] border-2 border-dashed border-[#D5C7B7] hover:border-[#8C5E3C] rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5DACB] text-[#5C3218] group-hover:scale-105 flex items-center justify-center mb-2.5 transition-transform shadow-2xs">
                    <Upload className="w-6 h-6 stroke-[2]" />
                  </div>
                  <span className="text-sm font-bold text-[#3B2213] block">
                    Subir Foto de Portada
                  </span>
                  <span className="text-xs text-[#735F52] mt-1 block">
                    Haz clic aquí para seleccionar la foto desde tu dispositivo
                  </span>
                  <span className="text-[10px] text-[#8C7464] mt-0.5 block">
                    Formatos admitidos: JPG, PNG o WebP (máx. 3.5 MB)
                  </span>

                  <button
                    type="button"
                    id="inline-btn-upload-photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="mt-3.5 px-4 py-2 bg-[#5C3218] hover:bg-[#452410] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Seleccionar Archivo</span>
                  </button>
                </div>
              )}
            </div>

            {/* Synopsis */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3218] mb-1">
                Sinopsis o Reseña del Libro *
              </label>
              <textarea
                required
                rows={4}
                id="inline-input-synopsis"
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder="Escribe un resumen cautivador del libro, su trama y motivos para leerlo..."
                className="w-full p-3 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#8C5E3C] focus:bg-white leading-relaxed"
              />
            </div>

            {/* Advanced Metadata Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C3218] hover:text-[#3B2213] cursor-pointer"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>
                  {showAdvanced ? 'Ocultar datos editoriales adicionales' : 'Ver datos editoriales adicionales (Editorial, Páginas, ISBN)'}
                </span>
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3 p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFC8] animate-in fade-in">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#735F52] mb-1">
                      Editorial
                    </label>
                    <input
                      type="text"
                      value={editorial}
                      onChange={(e) => setEditorial(e.target.value)}
                      placeholder="ej. Planeta"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E5DACB] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#735F52] mb-1">
                      ISBN
                    </label>
                    <input
                      type="text"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      placeholder="ej. 978-84-..."
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E5DACB] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#735F52] mb-1">
                      Páginas
                    </label>
                    <input
                      type="number"
                      value={pages}
                      onChange={(e) => setPages(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="ej. 430"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E5DACB] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#735F52] mb-1">
                      Año de Publicación
                    </label>
                    <input
                      type="number"
                      value={publishedYear}
                      onChange={(e) => setPublishedYear(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="ej. 2021"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E5DACB] rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[#EFE8DF] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E5DACB] text-xs font-bold text-[#6E5A4E] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            ← Cancelar y Volver a la Lista
          </button>
          <button
            type="submit"
            id="inline-save-publication-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#5C3218] hover:bg-[#472611] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{bookToEdit ? 'Guardar Cambios de la Publicación' : 'Publicar Libro en el Catálogo'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
