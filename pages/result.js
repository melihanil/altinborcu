import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Result() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (!router.query.data) return;

    const fetchResults = async () => {
      try {
        const data = JSON.parse(router.query.data);
        setResults(data);
        setLastUpdate(new Date());
      } catch (err) {
        setError('Veri yükleme hatası');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [router.query.data]);

  if (loading) {
    return <div style={styles.container}><p>Yükleniyor...</p></div>;
  }

  if (error || !results) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.errorTitle}>❌ Hata</h2>
          <p>{error || 'Sonuç bulunamadı'}</p>
          <button onClick={() => router.back()} style={styles.button}>
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const debtTypes = {
    gold_gram: { label: 'Gram Altın', unit: 'gram' },
    gold_quarter: { label: 'Çeyrek Altın', unit: 'çeyrek' },
    gold_half: { label: 'Yarım Altın', unit: 'yarım' },
    gold_full: { label: 'Tam Altın', unit: 'tam' },
    usd: { label: 'USD (Dolar)', unit: 'USD' },
    eur: { label: 'EUR (Euro)', unit: 'EUR' },
  };

  const totalProfitLoss = results.debts.reduce((sum, d) => sum + d.profitLoss, 0);
  const isPositive = totalProfitLoss > 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Hesaplama Sonucu</h1>
        <p style={styles.subtitle}>Borçlarınızın kar/zarar durumu</p>
      </div>

      <div style={styles.card}>
        {/* Detaylı Borçlar */}
        <div style={styles.detailsSection}>
          <h2 style={styles.sectionTitle}>Borç Detayları</h2>
          {results.debts.map((debt, idx) => (
            <div key={idx} style={styles.debtDetail}>
              <div style={styles.debtHeader}>
                <strong>{debtTypes[debt.type].label}</strong>
                <span style={styles.debtAmount}>{debt.amount} {debtTypes[debt.type].unit}</span>
              </div>
              <div style={styles.debtInfo}>
                <p>📅 Borç Tarihi: <strong>{new Date(debt.date).toLocaleDateString('tr-TR')}</strong></p>
                <p>💰 O Günkü Fiyat: <strong>{debt.oldPrice.toFixed(2)} TL</strong></p>
                <p>📈 Bugünkü Fiyat: <strong>{debt.newPrice.toFixed(2)} TL</strong></p>
                <p>
                  Fark: <strong style={{ color: debt.profitLoss > 0 ? '#27ae60' : '#e74c3c' }}>
                    {debt.profitLoss > 0 ? '+' : ''}{debt.profitLoss.toFixed(2)} TL
                  </strong>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* TOPLAM KAR/ZARAR */}
        <div style={{ ...styles.totalSection, borderColor: isPositive ? '#27ae60' : '#e74c3c' }}>
          <h2 style={styles.totalLabel}>TOPLAM KAR/ZARAR</h2>
          <div
            style={{
              ...styles.totalAmount,
              backgroundColor: isPositive ? '#d5f4e6' : '#fadbd8',
              color: isPositive ? '#27ae60' : '#e74c3c',
            }}
          >
            {isPositive ? '✅ KAZANÇ' : '⚠️ ZARAR'}: {isPositive ? '+' : ''}{totalProfitLoss.toFixed(2)} TL
          </div>
        </div>

        {/* Uyarı Metni */}
        <div style={styles.warningBox}>
          <p style={styles.warningText}>
            ⚠️ <strong>Önemli Not:</strong> Bu hesaplama yalnızca bilgilendirme amaçlıdır.
            <br />
            <strong>Yatırım tavsiyesi değildir.</strong>
            <br />
            Fiyat verileri TCMB (Türkiye Cumhuriyet Merkez Bankası) tarafından sağlanmaktadır.
            <br />
            Son güncelleme: {lastUpdate?.toLocaleString('tr-TR')}
          </p>
        </div>

        {/* Butonlar */}
        <div style={styles.buttonGroup}>
          <button onClick={() => router.push('/')} style={styles.buttonPrimary}>
            ← Yeni Borç Hesapla
          </button>
        </div>
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
    maxWidth: '700px',
    margin: '0 auto',
    background: '#fff',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  },
  detailsSection: {
    marginBottom: '30px',
  },
  sectionTitle: {
    color: '#1a3a52',
    fontSize: '18px',
    marginBottom: '20px',
    borderBottom: '2px solid #D4AF37',
    paddingBottom: '10px',
  },
  debtDetail: {
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '15px',
    borderLeft: '4px solid #D4AF37',
  },
  debtHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    fontSize: '16px',
  },
  debtAmount: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  debtInfo: {
    fontSize: '14px',
    color: '#555',
  },
  totalSection: {
    border: '3px solid #e74c3c',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    background: '#fef5f5',
  },
  totalLabel: {
    color: '#1a3a52',
    fontSize: '16px',
    marginBottom: '15px',
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: '28px',
    fontWeight: 'bold',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  warningBox: {
    background: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
  },
  warningText: {
    color: '#856404',
    fontSize: '13px',
    lineHeight: '1.6',
    margin: 0,
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  buttonPrimary: {
    flex: 1,
    padding: '12px',
    background: '#D4AF37',
    color: '#1a3a52',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
  },
};
