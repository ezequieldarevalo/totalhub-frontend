import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../layout';

export default function NewRoom({ token, roomTypes, features }) {
  const router = useRouter();
  const [selectedRoomType, setSelectedRoomType] = useState(roomTypes?.[0]?.id || '');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch(`/api/backend/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomTypeId: selectedRoomType,
          featureIds: selectedFeatures, // Nuevo campo
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear');

      router.push('/dashboard/rooms');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleFeatureChange = (e) => {
    const { value, checked } = e.target;
    setSelectedFeatures((prev) =>
      checked ? [...prev, value] : prev.filter((f) => f !== value)
    );
  };

  return (
    <DashboardLayout pageTitle="Creación de habitación">
      <h1>Crear nueva habitación</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Tipo de habitación:
          <select
            name="roomTypeId"
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            required
          >
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name} — {rt.capacity} personas
              </option>
            ))}
          </select>
        </label>

        <br /><br />

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
              {feature.name}
            </label>
          ))}
        </fieldset>

        <br />
        <button type="submit">Crear habitación</button>
      </form>

      {message && <p style={{ marginTop: '1rem', color: 'red' }}>{message}</p>}
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (ctx) => {
  const token = ctx.req.cookies.token || '';

  try {
    const [roomTypesRes, featuresRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/room-types`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/features`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const [roomTypesData, featuresData] = await Promise.all([
      roomTypesRes.json(),
      featuresRes.json(),
    ]);

    return {
      props: {
        token,
        roomTypes: roomTypesRes.ok && Array.isArray(roomTypesData) ? roomTypesData : [],
        features: featuresRes.ok && Array.isArray(featuresData) ? featuresData : [],
      },
    };
  } catch (err) {
    return {
      props: {
        token,
        roomTypes: [],
        features: [],
      },
    };
  }
});
