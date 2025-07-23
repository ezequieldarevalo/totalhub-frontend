import React, { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from 'next-i18next';
import ReactDOM from 'react-dom';
import {
  StyledBackButton,
  Title,
  Form,
  Field,
  Input,
  Button,
  Message,
  OptionGroup,
  PriceLine,
  ModalBackdrop,
  ModalBox,
  ModalButton,
  DiscountOption,
  ReservationSummary,
} from './NewReservation.styles';
import { parseISO } from 'date-fns';

const NewReservation = ({ slug, roomId, roomSlug, from, to, guests }) => {
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [useMuchiCard, setUseMuchiCard] = useState(false);
  const [discountType, setDiscountType] = useState(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [totalPrice, setTotalPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);

  const numGuests = parseInt(guests || '0', 10);
  const numNights = from && to
    ? (parseISO(to).getTime() - parseISO(from).getTime()) / (1000 * 60 * 60 * 24)
    : 0;

  const formatDate = (str) =>
    new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long' }).format(parseISO(str));

  useEffect(() => {
    if (!slug || !roomId || !from || !to || !guests) {
      setError(t('missing_data'));
    }
  }, [slug, roomId, from, to, guests, t]);

  const fetchPrices = useCallback(async () => {
    if (!slug || !roomId || !from || !to || !guests || !selectedOption) return;

    setPriceLoading(true);

    const isResident = selectedOption.startsWith('argentino');
    let paymentMethod = 'card';

    if (isResident) {
      paymentMethod = selectedOption.includes('tarjeta') ? 'card' : 'cash';
    } else {
      if (useMuchiCard && discountType) {
        paymentMethod = discountType; // puede ser 'cash', 'debit' o 'credit'
      } else {
        paymentMethod = 'card';
      }
    }



    try {
      const res = await fetch(
        `/api/backend/public/hostels/preview/${slug}/${roomId}?from=${from}&to=${to}&guests=${guests}&isResident=${isResident}&paymentMethod=${paymentMethod}&hasMuchiCard=${!isResident && useMuchiCard}&muchiCardType=${discountType || ''}`
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setBreakdown(data.breakdown);
      setTotalPrice(data.total);
    } catch (err) {
      setError(t('price_error'));
    } finally {
      setPriceLoading(false);
    }
  }, [slug, roomId, from, to, guests, selectedOption, useMuchiCard, discountType, t]);


  useEffect(() => {
    const shouldFetch =
      slug &&
      roomId &&
      from &&
      to &&
      guests &&
      selectedOption &&
      (!useMuchiCard || (useMuchiCard && discountType));

    if (shouldFetch) {
      fetchPrices();
    }
  }, [
    slug,
    roomId,
    from,
    to,
    guests,
    selectedOption,
    useMuchiCard,
    discountType,
  ]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!selectedOption || !form.name || !form.email) {
      setError(t('complete_all_fields'));
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: form.name,
        email: form.email,
        roomId,
        from,
        to,
        guests: numGuests,
        paymentMethod: (() => {
          const isResident = selectedOption.startsWith('argentino');
          if (isResident) {
            return selectedOption.includes('tarjeta') ? 'card' : 'cash';
          } else {
            return discountType === 'cash' ? 'cash' : 'card';
          }
        })(),
        isResident: selectedOption.startsWith('argentino'),
        hasMuchiCard: useMuchiCard,
        muchiCardType: useMuchiCard && discountType ? discountType : undefined,
        lang: i18n.language,
      };

      const res = await fetch(`/api/backend/public/hostels/${slug}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t('reservation_error'));

      router.push({
        pathname: `/hostels/${slug}/confirmation`,
        query: { email: form.email, slug },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscountSelect = (type) => {
    setUseMuchiCard(true);
    setDiscountType(type);
    setShowDiscountModal(false);
  };


  const clearDiscount = () => {
    setUseMuchiCard(false);
    setDiscountType(null);
  };

  return (
    <Layout>
      <StyledBackButton onClick={() => router.back()}>
        ← {t('back', { defaultValue: 'Back' })}
      </StyledBackButton>
      <Title>{t('confirm_title')}</Title>

      <ReservationSummary>
        <div className="reservation-details">
          <p><strong>{t('room')}:</strong> {t(`roomType.${roomSlug}`)}</p>
          <p><strong>{t('from')}:</strong> {formatDate(from)}</p>
          <p><strong>{t('to')}:</strong> {formatDate(to)}</p>
          <p><strong>{t('guests')}:</strong> {guests}</p>
          <p><strong>{t('nights')}:</strong> {numNights}</p>
        </div>

        <div className="price-options">
          <h3>{t('choose_price')}:</h3>
          <OptionGroup>
            {[
              ['argentino-efectivo', t('resident_cash')],
              ['argentino-tarjeta', t('resident_card')],
              ['no-argentino', t('foreigner')],
            ].map(([option, label]) => (
              <PriceLine key={option}>
                <input
                  type="radio"
                  name="priceOption"
                  value={option}
                  checked={selectedOption === option}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    console.log('Selected option:', newValue);
                    setSelectedOption(newValue);

                    if (!newValue.startsWith('no-argentino')) {
                      clearDiscount();
                    }
                  }}
                />
                <span>{label}</span>
              </PriceLine>
            ))}
          </OptionGroup>
        </div>
      </ReservationSummary>

      {selectedOption?.startsWith('no-argentino') && (
        <>
          <Button type="button" onClick={() => setShowDiscountModal(true)} style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
            {useMuchiCard ? t('change_discount_option') : t('select_discount_option')}
          </Button>
          {useMuchiCard && discountType && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '0.5rem',
                marginTop: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              <span>
                {t('muchicard_applied')}: {
                  discountType === 'cash' ? '15%' :
                    discountType === 'debit' ? '10%' :
                      discountType === 'credit' ? '5%' : ''
                }
              </span>
              <Button
                type="button"
                onClick={clearDiscount}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
              >
                {t('remove_discount_option', { defaultValue: 'Quitar MuchiCard' })}
              </Button>
            </div>
          )}
        </>
      )}

      {priceLoading || totalPrice === null ? (
        <p>{t('loading_price', { defaultValue: 'Calculando precio...' })}</p>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            margin: '1rem 0',
          }}
        >
          <span style={{ fontWeight: 600 }}>{t('total')}: USD {totalPrice.toFixed(2)}</span>
          <Button type="button" onClick={() => setShowBreakdownModal(true)} disabled={priceLoading} style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
            {t('see_breakdown')}
          </Button>
        </div>
      )}


      <Form onSubmit={handleSubmit}>
        <Field>
          {t('name')}:
          <Input type="text" name="name" value={form.name} onChange={handleChange} required />
        </Field>
        <Field>
          {t('email')}:
          <Input type="email" name="email" value={form.email} onChange={handleChange} required />
        </Field>
        <Button type="submit" disabled={loading || priceLoading}>
          {loading ? t('confirm') + '...' : t('confirm')}
        </Button>
      </Form>

      {error && <Message style={{ color: 'red' }}>{error}</Message>}
      {success && (
        <Message style={{ color: 'green' }}>
          ¡{t('confirm_title')}! ID: {success.reservation.id} – Total: USD {Number(success.total).toFixed(2)}
        </Message>
      )}

      {showDiscountModal &&
        ReactDOM.createPortal(
          <ModalBackdrop onClick={() => setShowDiscountModal(false)}>
            <ModalBox onClick={(e) => e.stopPropagation()}>
              <p>{t('muchicard_modal_text')}</p>
              <DiscountOption>
                <button onClick={() => handleDiscountSelect('cash')}>{t('discount_cash_15')}</button>
                <button onClick={() => handleDiscountSelect('debit')}>{t('discount_debit_10')}</button>
                <button onClick={() => handleDiscountSelect('credit')}>{t('discount_credit_5')}</button>
              </DiscountOption>
              <ModalButton onClick={() => setShowDiscountModal(false)}>{t('close')}</ModalButton>
            </ModalBox>
          </ModalBackdrop>,
          document.body
        )}

      {showBreakdownModal &&
        ReactDOM.createPortal(
          <ModalBackdrop onClick={() => setShowBreakdownModal(false)}>
            <ModalBox onClick={(e) => e.stopPropagation()}>
              <h4>{t('breakdown')}:</h4>
              <ul style={{ textAlign: 'left', marginTop: '1rem' }}>
                {breakdown.map((item) => {
                  const unitPrice = guests > 0 ? item.finalPrice / guests : null;
                  return (
                    <li key={item.date}>
                      {formatDate(item.date)}: USD {item.finalPrice.toFixed(2)}
                      {unitPrice !== null && <> ({guests} x USD {unitPrice.toFixed(2)})</>}
                    </li>
                  );
                })}
              </ul>
              <ModalButton onClick={() => setShowBreakdownModal(false)}>{t('close')}</ModalButton>
            </ModalBox>
          </ModalBackdrop>,
          document.body
        )}
    </Layout>
  );
};

export default NewReservation;
