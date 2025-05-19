import Layout from '@/components/Layout';
import { withAuth } from '@/lib/withAuth';
import { useRouter } from 'next/router';

export default function HostelCalendar({ calendar, dates, selected }) {
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    const from = e.target.from.value;
    const to = e.target.to.value;
    router.push({
      pathname: '/dashboard/calendar-hostel',
      query: { from, to },
    });
  };

  return (
    <Layout>
      <Head>
        <title>Calendario general de disponibilidad - Dashboard</title>
      </Head>
      <h1>Calendario general de disponibilidad</h1>

      <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
        <label>
          Desde: <input type="date" name="from" defaultValue={selected.from} required />
        </label>{' '}
        <label>
          Hasta: <input type="date" name="to" defaultValue={selected.to} required />
        </label>{' '}
        <button type="submit">Consultar</button>
      </form>

      {calendar.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table border="1" cellPadding="6" style={{ minWidth: '900px', textAlign: 'center' }}>
            <thead>
              <tr>
                <th>Habitación</th>
                {dates.map((d) => (
                  <th key={d}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendar.map((room) => (
                <tr key={room.id}>
                  <td style={{ fontWeight: 'bold' }}>{room.name}</td>
                  {room.availability.map((a) => (
                    <td
                      key={a.date}
                      style={{
                        backgroundColor: a.guests < room.capacity ? '#d4edda' : '#f8d7da',
                        color: a.guests < room.capacity ? 'green' : 'red',
                      }}
                    >
                      {a.guests}/{room.capacity}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No hay datos disponibles para ese rango de fechas.</p>
      )}
    </Layout>
  );
}

export const getServerSideProps = withAuth(async (ctx, user) => {
  const token = ctx.req.cookies.token || '';
  const { from = '', to = '' } = ctx.query;

  let calendar = [];
  let dates = [];

  if (from && to) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reservations/calendar/hostel?from=${from}&to=${to}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.ok) {
      calendar = await res.json();
      dates = calendar[0]?.availability.map((d) => d.date) || [];
    }
  }

  return {
    props: {
      calendar,
      dates,
      selected: { from, to },
    },
  };
});
