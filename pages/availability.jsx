// pages/availability.jsx
import Head from 'next/head';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Container = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 1rem;
`;

const HostelCard = styled.div`
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const HostelName = styled.h2`
  margin-top: 0;
`;

const RoomList = styled.ul`
  margin-top: 1rem;
`;

const RoomItem = styled.li`
  margin-bottom: 0.75rem;
`;

const NoResults = styled.p`
  font-style: italic;
  color: #666;
`;

export default function Availability({ results }) {
  const router = useRouter();
  const { from, to, guests } = router.query;

  return (
    <>
      <Head>
        <title>Disponibilidad | TotalHub</title>
      </Head>
      <Container>
        <h1>Resultados de disponibilidad</h1>

        {results.length === 0 ? (
          <NoResults>No se encontraron habitaciones disponibles.</NoResults>
        ) : (
          results.map((hostel) => (
            <HostelCard key={hostel.slug}>
              <HostelName>{hostel.name}</HostelName>
              <p>Habitaciones disponibles: {hostel.availableRooms.length}</p>

              <RoomList>
                {hostel.availableRooms.map((room) => (
                  <RoomItem key={room.id}>
                    <Link
                      href={{
                        pathname: `/hostels/${hostel.slug}/rooms/${room.slug}`,
                        query: { from, to, guests },
                      }}
                    >
                      {room.name} – ${room.price}
                    </Link>
                  </RoomItem>
                ))}
              </RoomList>
            </HostelCard>
          ))
        )}
      </Container>
    </>
  );
}

export async function getServerSideProps(context) {
  const { from, to, guests } = context.query;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public-availability?from=${from}&to=${to}&guests=${guests}`
    );

    if (!res.ok) throw new Error('Error al obtener disponibilidad');

    const results = await res.json();

    return {
      props: {
        results: Array.isArray(results) ? results : [],
      },
    };
  } catch (error) {
    console.error('Error en getServerSideProps:', error);
    return {
      props: { results: [] },
    };
  }
}
