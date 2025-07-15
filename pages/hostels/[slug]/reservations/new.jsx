
import React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import NewReservation from '@/components/NewReservation';
import { useRouter } from 'next/router';


export default function NewReservationPage() {
  const router = useRouter();
  const { slug, roomId, roomSlug, from, to, guests } = router.query;

  return (
    <NewReservation
      slug={slug}
      roomId={roomId}
      roomSlug={roomSlug}
      from={from}
      to={to}
      guests={guests}
    />
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
