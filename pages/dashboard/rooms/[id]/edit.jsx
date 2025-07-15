import { useState } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../../layout';

export default function EditRoom({ room, token, features }) {
  const router = useRouter();

  const [selectedFeatures, setSelectedFeatures] = useState(
    room.features?.map((f) => f.id) || []
  );
  const [message, setMessage] = useState(null);

  const handleFeatureChange = (e) => {
    const { value, checked } = e.target;
    setSelectedFeatures((prev) =>
      checked ? [...prev, value] : prev.filter((id) => id !== value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch(`/api/backend/rooms/${room.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          featureIds: selectedFeatures,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar');

      router.push('/dashboard/rooms');
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <DashboardLayout pageTitle="Edición de habitación">
      <h1>Editar habitación</h1>

      <p>
        <strong>Nombre:</strong> {room.roomType.name}
        <br />
        <strong>Capacidad:</strong> {room.roomType.capacity}
      </p>

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Comodidades:</legend>
          {features.map((feature) => (
            <label key={feature.id} style={{ display: 'block' }}>
              <input
                type="checkbox"
                value={feature.id}
                checked={selectedFeatures.includes(feature.id)}
                onChange={handleFeatureChange}
              />
              {feature.slug}
            </label>
          ))}
        </fieldset>

        <br />
        <button type="submit">Guardar cambios</button>
      </form>

      {message && <p style={{ marginTop: '1rem', color: 'red' }}>{message}</p>}
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (ctx) => {
  const { id } = ctx.params;
  const token = ctx.req.cookies.token || '';

  try {
    const [roomRes, featuresRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/room-features`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const [room, features] = await Promise.all([
      roomRes.json(),
      featuresRes.json(),
    ]);

    if (!roomRes.ok || !room) return { notFound: true };

    return {
      props: {
        room,
        features,
        token,
      },
    };
  } catch {
    return { notFound: true };
  }
});
