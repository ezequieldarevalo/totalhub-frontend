import { useState, useEffect } from 'react';
import { withAuth } from '@/lib/withAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../layout';

function IncomeReport({ initialReport }) {
  const [report, setReport] = useState(initialReport || []);
  const [message, setMessage] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [viewMode, setViewMode] = useState('table');

  const fetchReport = async () => {
    setMessage(null);
    try {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const res = await fetch(`/api/backend/reservations/income?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al obtener reporte');
      }

      const data = await res.json();
      setReport(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    if (from && to) {
      fetchReport();
    }
  }, [from, to]);

  return (
    <DashboardLayout pageTitle='Reporte de ingresos'>
      <h1>Reporte de Ingresos</h1>

      <div style={{ margin: '1rem 0' }}>
        <label>
          Desde:{' '}
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>{' '}
        <label>
          Hasta:{' '}
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>

      {message && <p style={{ color: 'red' }}>{message}</p>}

      {report.length > 0 && (
        <button
          style={{
            marginBottom: '1rem',
            padding: '0.5rem 1rem',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          onClick={() => setViewMode(viewMode === 'table' ? 'chart' : 'table')}
        >
          {viewMode === 'table' ? 'Ver gráfico' : 'Ver tabla'}
        </button>
      )}

      {report.length === 0 ? (
        <p>No hay datos de ingresos para el rango seleccionado.</p>
      ) : (
        <>
          {viewMode === 'table' ? (
            <table border="1" cellPadding="8" style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Ingresos Totales</th>
                </tr>
              </thead>
              <tbody>
                {report.map((r) => (
                  <tr key={r.date}>
                    <td>{r.date}</td>
                    <td>${r.totalIncome.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ width: '100%', height: 400, marginTop: '2rem' }}>
              <ResponsiveContainer>
                <BarChart data={report}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(tick) => `$${tick}`} />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="totalIncome" fill="#28a745" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (ctx) => {
  const token = ctx.req.cookies.token || '';

  return { props: { initialReport: [] } };
});

export default IncomeReport;
