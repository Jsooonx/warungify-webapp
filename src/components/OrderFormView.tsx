import React, { useState, useEffect, useRef } from 'react';
import type { Order, OrderStatus } from '../types';
import { ArrowLeft, Check } from 'lucide-react';
import { RollingText } from './RollingText';

type ParsedField = 'customerName' | 'whatsappNumber' | 'productName' | 'quantity' | 'totalPrice' | 'notes';

interface OrderFormViewProps {
  orderToEdit?: Order | null;
  onSave: (orderData: {
    customerName: string;
    whatsappNumber: string;
    productName: string;
    quantity: number;
    totalPrice: number;
    notes: string;
    status: OrderStatus;
    trackingNumber?: string;
  }) => void | Promise<void>;
  onCancel: () => void;
  onFormatCopied: () => void;
}

const parsePastedText = (text: string) => {
  const lines = text.split('\n');
  let parsedName = '';
  let parsedPhone = '';
  let parsedProduct = '';
  let parsedQty = 1;
  let parsedPrice = 0;
  let parsedNotes = '';
  const detectedFields: ParsedField[] = [];

  lines.forEach(line => {
    const cleanLine = line.trim();
    
    // Pattern matchers
    const nameMatch = cleanLine.match(/^(?:Nama|Name|Penerima)\s*:\s*(.+)$/i);
    const phoneMatch = cleanLine.match(/^(?:No WA|WhatsApp|WA|No HP|HP|Telepon|Phone|Telp)\s*:\s*(.+)$/i);
    const productMatch = cleanLine.match(/^(?:Produk|Product|Pesanan|Barang)\s*:\s*(.+)$/i);
    const qtyMatch = cleanLine.match(/^(?:Jumlah|Qty|Quantity|Pcs)\s*:\s*(\d+)/i);
    const priceMatch = cleanLine.match(/^(?:Total Harga|Total|Harga|Price|Bayar)\s*:\s*(?:Rp\s*)?([\d.,]+)/i);
    const notesMatch = cleanLine.match(/^(?:Catatan|Notes|Alamat|Address)\s*:\s*(.+)$/i);

    if (nameMatch) {
      parsedName = nameMatch[1].trim();
      detectedFields.push('customerName');
    }
    if (phoneMatch) {
      parsedPhone = phoneMatch[1].trim().replace(/[^0-9+() -]/g, '');
      detectedFields.push('whatsappNumber');
    }
    if (productMatch) {
      parsedProduct = productMatch[1].trim();
      detectedFields.push('productName');
    }
    if (qtyMatch) {
      parsedQty = parseInt(qtyMatch[1], 10);
      detectedFields.push('quantity');
    }
    if (priceMatch) {
      // Clean price characters (remove dots, commas, Rp currency prefixes)
      const cleanPrice = priceMatch[1].replace(/[.,]/g, '');
      parsedPrice = parseInt(cleanPrice, 10);
      detectedFields.push('totalPrice');
    }
    if (notesMatch) {
      parsedNotes = notesMatch[1].trim();
      detectedFields.push('notes');
    }
  });

  return {
    customerName: parsedName,
    whatsappNumber: parsedPhone,
    productName: parsedProduct,
    quantity: parsedQty,
    totalPrice: parsedPrice,
    notes: parsedNotes,
    detectedFields,
  };
};

export const OrderFormView: React.FC<OrderFormViewProps> = ({
  orderToEdit,
  onSave,
  onCancel,
  onFormatCopied
}) => {
  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<OrderStatus>('pending_payment');
  const [trackingNumber, setTrackingNumber] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [invalidField, setInvalidField] = useState<string | null>(null);
  const [parsedFields, setParsedFields] = useState<ParsedField[]>([]);
  const [flashParsedFields, setFlashParsedFields] = useState<ParsedField[]>([]);
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});

  // Magic Parser states
  const [pasteInput, setPasteInput] = useState('');
  const [copiedFormat, setCopiedFormat] = useState(false);

  const formatTemplate = `Nama: \nWhatsApp: \nProduk: \nJumlah: 1\nTotal Harga: \nCatatan: `;

  const handleCopyFormat = () => {
    navigator.clipboard.writeText(formatTemplate).then(() => {
      setCopiedFormat(true);
      setTimeout(() => setCopiedFormat(false), 2000);
      onFormatCopied();
    });
  };

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPasteInput(val);
    if (!val.trim()) {
      setCustomerName('');
      setWhatsappNumber('');
      setProductName('');
      setQuantity(1);
      setTotalPrice(0);
      setNotes('');
      setParsedFields([]);
      setFlashParsedFields([]);
      return;
    }

    const parsed = parsePastedText(val);
    
    if (parsed.customerName) {
      setCustomerName(parsed.customerName);
    }
    if (parsed.whatsappNumber) {
      setWhatsappNumber(parsed.whatsappNumber);
    }
    if (parsed.productName) {
      setProductName(parsed.productName);
    }
    if (parsed.detectedFields.includes('quantity')) {
      setQuantity(parsed.quantity);
    }
    if (parsed.totalPrice) {
      setTotalPrice(parsed.totalPrice);
    }
    if (parsed.notes) {
      setNotes(parsed.notes);
    }

    setParsedFields(parsed.detectedFields);
    setFlashParsedFields([]);
    window.requestAnimationFrame(() => {
      setFlashParsedFields(parsed.detectedFields);
      window.setTimeout(() => setFlashParsedFields([]), 1200);
    });
  };

  // Pre-fill form if editing an existing order
  useEffect(() => {
    if (orderToEdit) {
      setCustomerName(orderToEdit.customerName);
      setWhatsappNumber(orderToEdit.whatsappNumber);
      setProductName(orderToEdit.productName);
      setQuantity(orderToEdit.quantity);
      setTotalPrice(orderToEdit.totalPrice);
      setNotes(orderToEdit.notes);
      setStatus(orderToEdit.status);
      setTrackingNumber(orderToEdit.trackingNumber || '');
    } else {
      // Clear form for new order creation
      setCustomerName('');
      setWhatsappNumber('');
      setProductName('');
      setQuantity(1);
      setTotalPrice(0);
      setNotes('');
      setStatus('pending_payment');
      setTrackingNumber('');
      setPasteInput('');
      setParsedFields([]);
      setFlashParsedFields([]);
    }
  }, [orderToEdit]);

  const parsedLabels: Record<ParsedField, string> = {
    customerName: 'Name parsed',
    whatsappNumber: 'Phone parsed',
    productName: 'Product parsed',
    quantity: 'Qty parsed',
    totalPrice: 'Price parsed',
    notes: 'Notes parsed',
  };

  const getParsedDelay = (field: ParsedField) => `${Math.max(parsedFields.indexOf(field), 0) * 80}ms`;

  const getParsedStyle = (field: ParsedField) => ({
    '--parsed-delay': getParsedDelay(field),
  } as React.CSSProperties);

  const getParsedClass = (field: ParsedField) => (
    flashParsedFields.includes(field) ? 'parsed-field-flash' : ''
  );

  // Basic validation rules
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!whatsappNumber.trim()) {
      newErrors.whatsappNumber = 'WhatsApp number is required';
    } else if (!/^[0-9+() -]{7,20}$/.test(whatsappNumber)) {
      newErrors.whatsappNumber = 'Enter a valid phone number (digits/spaces/dashes)';
    }
    if (!productName.trim()) newErrors.productName = 'Product name is required';
    if (quantity <= 0) newErrors.quantity = 'Quantity must be at least 1';
    if (totalPrice < 0) newErrors.totalPrice = 'Price cannot be negative';

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      firstErrorField: Object.keys(newErrors)[0] || null,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm();
    if (!validation.isValid) {
      const field = validation.firstErrorField;
      setInvalidField(null);
      window.requestAnimationFrame(() => {
        if (!field) return;
        setInvalidField(field);
        inputRefs.current[field]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inputRefs.current[field]?.focus({ preventScroll: true });
        window.setTimeout(() => setInvalidField(null), 700);
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate slight save latency for smooth UX transitions
    setTimeout(() => {
      void Promise.resolve(onSave({
        customerName: customerName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        productName: productName.trim(),
        quantity: Number(quantity),
        totalPrice: Number(totalPrice),
        notes: notes.trim(),
        status,
        trackingNumber: trackingNumber.trim() || undefined
      })).finally(() => setIsSubmitting(false));
    }, 400);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-6 select-none bg-slate-50/50 page-transition-enter">
      {/* Back CTA Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 text-slate-500 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {orderToEdit ? `Edit Order #${orderToEdit.orderNumber}` : 'Create New Order'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {orderToEdit ? 'Modify order status, shipping code, or client details.' : 'Input order records from sales chats.'}
          </p>
        </div>
      </div>

      {/* Magic Parser Box Helper (Shown only for new orders creation) */}
      {!orderToEdit && (
        <div className="premium-card p-5 max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-5 bg-emerald-50/5/5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Magic Paste / Auto-Fill from Chat
            </label>
            <p className="text-[11px] text-slate-400">
              Paste the customer's text order format here to automatically extract details and populate the form.
            </p>
            <textarea
              value={pasteInput}
              onChange={handlePasteChange}
              rows={4}
              placeholder="Paste chat message here...&#10;e.g.&#10;Nama: Budi Santoso&#10;WhatsApp: 08129876543&#10;Produk: Nastar Box&#10;Total Harga: 180000"
              className="w-full p-3 border border-slate-200 bg-slate-50/50 rounded-lg text-xs transition-colors focus:bg-white focus:border-emerald-500 focus:outline-hidden resize-none h-28"
            />
            {parsedFields.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {parsedFields.map((field) => (
                  <span
                    key={field}
                    className="parsed-chip rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700"
                    style={getParsedStyle(field)}
                  >
                    {parsedLabels[field]}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2.5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Standard Order Format Template
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Copy and send this format to your customers so they can fill it out, making parsing 100% accurate.
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 font-mono text-[10px] text-slate-500 mt-2 whitespace-pre-line leading-relaxed">
                {formatTemplate}
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleCopyFormat}
              className={`group h-9 w-full rounded-lg border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all duration-500 ${
                copiedFormat
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-white border-transparent text-slate-600 hover:bg-slate-950 hover:text-white shadow-xs'
              }`}
            >
              <RollingText compact>{copiedFormat ? 'Format Copied!' : 'Copy Blank Format'}</RollingText>
            </button>
          </div>
        </div>
      )}

      {/* Main Form Box */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 max-w-4xl space-y-8">
        
        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Section 1: Customer Info */}
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              Customer Information
            </h3>

            {/* Customer Name */}
            <div className="space-y-1.5">
              <label htmlFor="customerName" className="text-xs font-semibold text-slate-700">
                Customer Name
              </label>
              <input
                id="customerName"
                ref={(node) => {
                  inputRefs.current.customerName = node;
                }}
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Budi Santoso"
                className={`w-full h-10 px-3 border rounded-lg text-xs transition-colors focus:bg-white focus:outline-hidden ${
                  errors.customerName 
                    ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500' 
                    : 'border-slate-200 bg-slate-50/50 focus:border-emerald-500'
                } ${invalidField === 'customerName' ? 'form-error-shake' : ''} ${getParsedClass('customerName')}`}
                style={getParsedStyle('customerName')}
              />
              {errors.customerName && (
                <span className="text-[10px] text-rose-600 font-semibold">{errors.customerName}</span>
              )}
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-1.5">
              <label htmlFor="whatsappNumber" className="text-xs font-semibold text-slate-700">
                WhatsApp Phone Number
              </label>
              <input
                id="whatsappNumber"
                ref={(node) => {
                  inputRefs.current.whatsappNumber = node;
                }}
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. 08129876543"
                className={`w-full h-10 px-3 border rounded-lg text-xs font-mono transition-colors focus:bg-white focus:outline-hidden ${
                  errors.whatsappNumber 
                    ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500' 
                    : 'border-slate-200 bg-slate-50/50 focus:border-emerald-500'
                } ${invalidField === 'whatsappNumber' ? 'form-error-shake' : ''} ${getParsedClass('whatsappNumber')}`}
                style={getParsedStyle('whatsappNumber')}
              />
              <span className="text-[10px] text-slate-400 block font-normal leading-normal">
                Use local formatting (e.g. 0812...) or international (e.g. 62812...).
              </span>
              {errors.whatsappNumber && (
                <span className="text-[10px] text-rose-600 font-semibold mt-1 block">{errors.whatsappNumber}</span>
              )}
            </div>

            {/* Notes / Address */}
            <div className="space-y-1.5">
              <label htmlFor="notes" className="text-xs font-semibold text-slate-700">
                Notes & Shipping Address
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Shipping details, card greeting message, custom product requests..."
                className={`w-full p-3 border border-slate-200 bg-slate-50/50 rounded-lg text-xs transition-colors focus:bg-white focus:border-emerald-500 focus:outline-hidden resize-none ${getParsedClass('notes')}`}
                style={getParsedStyle('notes')}
              />
            </div>
          </div>

          {/* Section 2: Order Info */}
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              Order Details
            </h3>

            {/* Product Name */}
            <div className="space-y-1.5">
              <label htmlFor="productName" className="text-xs font-semibold text-slate-700">
                Product Name
              </label>
              <input
                id="productName"
                ref={(node) => {
                  inputRefs.current.productName = node;
                }}
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Nastar Cake Box Premium"
                className={`w-full h-10 px-3 border rounded-lg text-xs transition-colors focus:bg-white focus:outline-hidden ${
                  errors.productName 
                    ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500' 
                    : 'border-slate-200 bg-slate-50/50 focus:border-emerald-500'
                } ${invalidField === 'productName' ? 'form-error-shake' : ''} ${getParsedClass('productName')}`}
                style={getParsedStyle('productName')}
              />
              {errors.productName && (
                <span className="text-[10px] text-rose-600 font-semibold">{errors.productName}</span>
              )}
            </div>

            {/* Quantity & Price row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="quantity" className="text-xs font-semibold text-slate-700">
                  Quantity
                </label>
                <input
                  id="quantity"
                  ref={(node) => {
                    inputRefs.current.quantity = node;
                  }}
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className={`w-full h-10 px-3 border rounded-lg text-xs transition-colors focus:bg-white focus:outline-hidden ${
                    errors.quantity 
                      ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500' 
                      : 'border-slate-200 bg-slate-50/50 focus:border-emerald-500'
                  } ${invalidField === 'quantity' ? 'form-error-shake' : ''} ${getParsedClass('quantity')}`}
                  style={getParsedStyle('quantity')}
                />
                {errors.quantity && (
                  <span className="text-[10px] text-rose-600 font-semibold">{errors.quantity}</span>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="totalPrice" className="text-xs font-semibold text-slate-700">
                  Total Price (Rp)
                </label>
                <input
                  id="totalPrice"
                  ref={(node) => {
                    inputRefs.current.totalPrice = node;
                  }}
                  type="number"
                  min={0}
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(Number(e.target.value))}
                  className={`w-full h-10 px-3 border rounded-lg text-xs font-mono transition-colors focus:bg-white focus:outline-hidden ${
                    errors.totalPrice 
                      ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500' 
                      : 'border-slate-200 bg-slate-50/50 focus:border-emerald-500'
                  } ${invalidField === 'totalPrice' ? 'form-error-shake' : ''} ${getParsedClass('totalPrice')}`}
                  style={getParsedStyle('totalPrice')}
                />
                {errors.totalPrice && (
                  <span className="text-[10px] text-rose-600 font-semibold">{errors.totalPrice}</span>
                )}
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-xs font-semibold text-slate-700">
                Order Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full h-10 px-3 border border-slate-200 bg-slate-50/50 rounded-lg text-xs outline-hidden focus:bg-white focus:border-emerald-500 cursor-pointer"
              >
                <option value="pending_payment">Pending Payment (Unpaid)</option>
                <option value="paid">Paid</option>
                <option value="packing">Packing</option>
                <option value="shipped">Shipped</option>
                <option value="done">Done (Delivered)</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Tracking Number (Optional) */}
            <div className="space-y-1.5">
              <label htmlFor="trackingNumber" className="text-xs font-semibold text-slate-700">
                Courier Tracking Code (Optional)
              </label>
              <input
                id="trackingNumber"
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. JNE123456789 / GOSEND-82910"
                className="w-full h-10 px-3 border border-slate-200 bg-slate-50/50 rounded-lg text-xs font-mono transition-colors focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="border-t border-slate-100 pt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="group h-10 px-5 rounded-lg border border-transparent bg-white text-slate-600 hover:bg-slate-950 hover:text-white text-xs font-semibold transition-all duration-500 cursor-pointer shadow-xs"
          >
            <RollingText compact>Cancel</RollingText>
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="group h-10 px-5 rounded-lg border border-transparent bg-slate-950 hover:bg-white active:bg-slate-50 text-white hover:text-slate-950 text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-500 cursor-pointer shadow-xs disabled:opacity-50 disabled:hover:bg-slate-950 disabled:hover:text-white"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Check className="w-4 h-4 transition-transform duration-500 group-hover:scale-110" />
            )}
            <RollingText compact>Save Order Details</RollingText>
          </button>
        </div>

      </form>
    </div>
  );
};
