import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Home() {
  const router = useRouter();
  const [debts, setDebts] = useState([]);
  const [newDebt, setNewDebt] = useState({
    type: 'gold_gram',
    amount: '',
    date: '',
  });
  const [loading, setLoading] = useState(false);

  const debtTypes = {
    gold_gram: { label: 'Gram Altın', unit: 'gram' },
    gold_quarter: { label: 'Çeyrek Altın', unit: 'çeyrek' },
    gold_half: { label: 'Yarım Altın', unit: 'yarım' },
    gold_full: { label: 'Tam Altın', unit: 'tam' },
    usd: { label: 'USD (Dolar)', unit: 'USD' },
    eur: { label: 'EUR (Euro)', unit: 'EUR' },
  };

  const handleAddDebt = () => {
    if (!newDebt.amount || !newDebt.date) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    const debtDate = new Date(newDebt.date);
    if (debtDate > new Date()) {
      alert('Gelecek tarih seçemezsiniz');
      return;
    }

    setDebts([...debts, { ...newDebt, id: Date.now() }]);
    setNewDebt({ type: 'gold_gram', amount: '', date: '' });
  };

  const handleRemoveDebt = (id) => {
    setDebts(debts.filter((d) => d.id !== id));
  };

  const handleCalculate = async () => {
    if (debts.length === 0) {
      alert('En az bir borç ekleyin');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/calculate', { debts });
      router.push({
        pathname: '/result',
        query: { data: JSON.stringify(response.data) },
      });
    } catch (error) {
      alert('Hesaplama hatası: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Altın, Dolar, Euro Borç Hesapla</h1>
        <p style={styles.subtitle}>Borç aldığınız günkü fiyat ile bugünkü fiyatı karşılaştırın</p>
      </div>

      <div style={styles.card}>
        <div style={styles.formSection}>
          <h2 style={styles.sectionTitle}>Yeni Borç Ekle</h2>

          <div style={styles.formGroup}>
            <label style={styles.label}>Borç Türü:</label>
            <select
              value={newDebt.type}
              onChange={(e) => setNewDebt({ ...newDebt, type: e.target.value })}
              style={styles.select}
            >
              {Object.entries(debtTypes).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Miktar:</label>
            <input
              type="number"
              step="0.01"
              placeholder="Örn: 1 veya 50.5"
              value={newDebt.amount}
              onChange={(e) => setNewDebt({ ...newDebt, amount: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Borç Tarihi:</label>
            <input
              type="date"
              value={newDebt.date}
              onChange={(e) => setNewDebt({ ...newDebt, date: e.target.value })}
              style={styles.input}
            />
          </div>

          <button onClick={handleAddDebt} style={styles.buttonAdd}>
            Borç Ekle
          </button>
        </div>

        {debts.length > 0 && (
          <div style={styles.debtsList}>
            <h2 style={styles.sectionTitle}>Eklenen Borçlar ({debts.length})</h2>
            {debts.map((debt) => (
              <div key={debt.id} style={styles.debtItem}>
                <div>
                  <strong>{debtTypes[debt.type].label}</strong> - {debt.amount} {debtTypes[debt.type].unit}
                  <br />
                  <small style={styles.debtDate}>{new Date(debt.date).toLocaleDateString('tr-TR')}</small>
                </div>
                <button
                  onClick={() => handleRemoveDebt(debt.id)}
                  style={styles.buttonRemove}
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        )}

        {debts.length > 0 && (
          <button onClick={handleCalculate} disabled={loading} style={styles.buttonCalculate}>
            {loading ? 'Hesaplanıyor...' : 'Hesapla →'}
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a3a52 0%, #2a5a7a 100%)',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    color: '#fff',
    marginBottom: '40px',
  },
  title: {
    fontSize: '36px',
    marginBottom: '10px',
    color: '#D4AF37',
  },
  subtitle: {
    fontSize: '16px',
    color: '#ccc',
  },
  card: {
    maxWidth: '600px',
    margin: '0 auto',
    background: '#fff',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  },
  formSection: {
    marginBottom: '30px',
  },
  sectionTitle: {
    color: '#1a3a52',
    fontSize: '20px',
    marginBottom: '20px',
    borderBottom: '2px solid #D4AF37',
    paddingBottom: '10px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    color: '#333',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  buttonAdd: {
    width: '100%',
    padding: '10px',
    background: '#2a5a7a',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  debtsList: {
    marginTop: '30px',
  },
  debtItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: '#f5f5f5',
    borderRadius: '6px',
    marginBottom: '10px',
    borderLeft: '4px solid #D4AF37',
  },
  debtDate: {
    color: '#666',
  },
  buttonRemove: {
    padding: '6px 12px',
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  buttonCalculate: {
    width: '100%',
    padding: '15px',
    background: '#D4AF37',
    color: '#1a3a52',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    marginTop: '20px',
    transition: 'all 0.3s',
  },
};
