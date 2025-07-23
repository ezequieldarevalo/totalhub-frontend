import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { i18n } from 'next-i18next';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import en from 'date-fns/locale/en-US';
import { useRouter } from 'next/router';
import { format, isBefore } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

const GlobalStyle = createGlobalStyle`
  .react-datepicker-popper {
    z-index: 9999 !important;
  }
`;

const Wrapper = styled.main`
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  font-family: sans-serif;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h3`
  margin-top: 2rem;
`;

const RoomList = styled.ul`
  list-style: none;
  padding-left: 0;
`;

const RoomItem = styled.li`
  padding: 8px 0;
  border-bottom: 1px solid #eee;
`;

const Form = styled.form`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  font-weight: bold;
`;

const Input = styled.input`
  padding: 6px;
  font-size: 1rem;
  margin-top: 4px;
`;

const Button = styled.button`
  padding: 10px;
  background: #004aad;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background: #003580;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  padding: 6px;
  font-size: 1rem;
  margin-top: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const DateFieldWrapper = styled.div`
  position: relative;
`;

export default function HostelPage({ hostel, rooms }) {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [guests, setGuests] = useState(1);
  const { t } = useTranslation('common');
  const router = useRouter();

  useEffect(() => {
    if (i18n?.language === 'es') {
      registerLocale('es', es);
    } else {
      registerLocale('en', en);
    }
  }, [i18n?.language]);

  useEffect(() => {
    if (from && (!to || to <= from)) {
      const nextDay = new Date(from);
      nextDay.setDate(from.getDate() + 1);
      setTo(nextDay);
    }
  }, [from]);

  useEffect(() => {
    if (to && !from) {
      const prevDay = new Date(to);
      prevDay.setDate(to.getDate() - 1);
      setFrom(prevDay);
    }
  }, [to]);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // asegurar comparación sin hora

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from || !to) return;

    const formattedFrom = format(from, 'yyyy-MM-dd');
    const formattedTo = format(to, 'yyyy-MM-dd');

    const params = new URLSearchParams({
      from: formattedFrom,
      to: formattedTo,
      guests: guests.toString(),
    });

    router.push(`/hostels/${hostel.slug}/availability?${params.toString()}`);
  };

  return (
    <Layout>
      <GlobalStyle />
      <Wrapper>
        <Title>{hostel.name}</Title>

        <SectionTitle>{t('rooms_title')}</SectionTitle>
        <RoomList>
          {rooms.map((room) => (
            <RoomItem key={room.id}>
              <strong>{t(`roomType.${room.slug}`)}</strong> – {room.capacity} {t('guests')}
            </RoomItem>
          ))}
        </RoomList>

        <SectionTitle>{t('availability_title')}</SectionTitle>
        <Form onSubmit={handleSubmit}>
          <Field>
            {t('from')}:
            <DateFieldWrapper>
              <StyledDatePicker
                selected={from}
                onChange={(date) => {
                  setFrom(date);
                  setFromOpen(false); // fuerza cierre
                }}
                onClickOutside={() => setFromOpen(false)}
                onSelect={() => setFromOpen(false)}
                onFocus={() => setFromOpen(true)}
                open={fromOpen}
                name="from"
                locale={i18n?.language}
                dateFormat="P"
                popperPlacement="bottom-start"
                required
                autoComplete="off"
                minDate={today}
              />
            </DateFieldWrapper>
          </Field>

          <Field>
            {t('to')}:
            <DateFieldWrapper>
              <StyledDatePicker
                selected={to}
                onChange={(date) => {
                  setTo(date);
                  setToOpen(false); // fuerza cierre
                }}
                onClickOutside={() => setToOpen(false)}
                onSelect={() => setToOpen(false)}
                onFocus={() => setToOpen(true)}
                open={toOpen}
                name="to"
                locale={i18n?.language}
                dateFormat="P"
                popperPlacement="bottom-start"
                required
                autoComplete="off"
                minDate={from ? new Date(from.getTime() + 86400000) : new Date(today.getTime() + 86400000)}
              />
            </DateFieldWrapper>
          </Field>

          <Field>
            {t('guests')}:
            <select
              name="guests"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              style={{ padding: '6px', fontSize: '1rem', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>

          <Button type="submit">{t('search')}</Button>
        </Form>
      </Wrapper>
    </Layout>
  );
}

export async function getServerSideProps({ params, locale }) {
  const { slug } = params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/hostels/${slug}/rooms`);
  if (!res.ok) {
    return { notFound: true };
  }

  const data = await res.json();

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      hostel: data.hostel,
      rooms: data.rooms,
    },
  };
}
