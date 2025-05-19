import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../../layout';
import Link from 'next/link';
import { useRouter } from 'next/router';

function OperatorDetail({ operator }) {
  const router = useRouter();

  if (!operator) {
    return (
      <DashboardLayout pageTitle="Detalle del operador">
        <p>Operador no encontrado.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Detalle del operador">
      <h1>Detalle del operador</h1>

      <p><strong>Nombre:</strong> {operator.name || '-'}</p>
      <p><strong>Email:</strong> {operator.email}</p>
      <p><strong>Rol:</strong> {operator.role}</p>

      <div style={{ margin: '1rem 0' }}>
        <Link href={`/dashboard/operators/${operator.id}/edit`}>
          <button>Editar</button>
        </Link>
      </div>

      <div>
        <button onClick={() => router.push('/dashboard/operators')}>
          Volver
        </button>
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (ctx) => {
  const token = ctx.req.cookies.token || '';
  const { id } = ctx.params;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operators/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return { notFound: true };

    const operator = await res.json();
    return { props: { operator } };
  } catch {
    return { notFound: true };
  }
});

export default OperatorDetail;
