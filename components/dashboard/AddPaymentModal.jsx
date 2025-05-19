import { useState } from 'react';

export default function AddPaymentModal({ isOpen, onClose, onConfirm, reservationId }) {
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) {
      alert('Ingrese un monto válido.');
      return;
    }

    await onConfirm(reservationId, parseInt(amount, 10));
    setAmount('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', minWidth: '300px' }}>
        <h3>Registrar Pago</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Monto:
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: '100%', marginTop: '0.5rem' }}
              required
              min="1"
            />
          </label>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px' }}>
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
