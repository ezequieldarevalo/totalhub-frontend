import styled from 'styled-components';
import Link from 'next/link';
import Head from 'next/head';

const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.nav`
  width: 220px;
  background: #f4f4f4;
  padding: 2rem 1rem;
`;

const Main = styled.main`
  flex: 1;
  padding: 2rem;
`;

export default function DashboardLayout({ children, pageTitle = 'Dashboard' }) {
  return (
    <Wrapper>
      <Head>
        <title>{pageTitle} - Dashboard</title>
      </Head>

      <Sidebar>
        <h3>Panel</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><Link href="/dashboard">Inicio</Link></li>

          <li><strong>Reservas:</strong></li>
          <li style={{ marginLeft: '1rem' }}><Link href="/dashboard/reservations">Todas las reservas</Link></li>
          <li style={{ marginLeft: '1rem' }}><Link href="/dashboard/reservations/upcoming">Próximas reservas</Link></li>
          <li style={{ marginLeft: '1rem' }}><Link href="/dashboard/reservations/history">Historial de reservas</Link></li>

          <li style={{ marginTop: '1rem' }}><strong>Gestión:</strong></li>
          <li style={{ marginLeft: '1rem' }}><Link href="/dashboard/rooms">Habitaciones</Link></li>
          <li style={{ marginLeft: '1rem' }}><Link href="/dashboard/day-prices">Precios diarios</Link></li>

          <li style={{ marginTop: '1rem' }}><strong>Reportes:</strong></li>
          <li style={{ marginLeft: '1rem' }}><Link href="/dashboard/reports/occupancy">Ocupación</Link></li>
          <li style={{ marginLeft: '1rem' }}><Link href="/dashboard/reports/income">Ingresos</Link></li>
        </ul>
      </Sidebar>

      <Main>{children}</Main>
    </Wrapper>
  );
}
