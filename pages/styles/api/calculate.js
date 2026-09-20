import axios from 'axios';

const TCMB_URL = 'https://www.tcmb.gov.tr/kurlar/today.xml';

// Fallback fiyatlar (TCMB erişilemezse)
const FALLBACK_PRICES = {
  gold_gram: 2650,
  gold_quarter: 10600,
  gold_half: 21200,
  gold_full: 42400,
  usd: 48.5,
  eur: 53.0,
};

async function getTodaysPrices() {
  try {
    const response = await axios.get(TCMB_URL);
    const parseString = require('xml2js').parseString;

    return new Promise((resolve, reject) => {
      parseString(response.data, (err, result) => {
        if (err) return reject(err);

        const rates = result.Tarih_Date.Currency;
        const usd = parseFloat(rates.find(r => r.$.Kod === 'USD')[0].BanknoteBuying[0]);
        const eur = parseFloat(rates.find(r => r.$.Kod === 'EUR')[0].BanknoteBuying[0]);

        resolve({
          usd,
          eur,
          gold_gram: 2650, // Bu taraftan alınamıyor, manuel
          gold_quarter: 10600,
          gold_half: 21200,
          gold_full: 42400,
        });
      });
    });
  } catch (error) {
    console.log('TCMB API hatası, fallback kullanılıyor');
    return FALLBACK_PRICES;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { debts } = req.body;

    if (!debts || debts.length === 0) {
      return res.status(400).json({ error: 'Borç listesi boş' });
    }

    const todaysPrices = await getTodaysPrices();

    const calculatedDebts = debts.map((debt) => {
      // Bu günün fiyatını al
      const newPrice = todaysPrices[debt.type];

      // Geçmiş fiyatı API'den al (TCMB arşivinden)
      // Not: Basit versiyonda sabit fiyat kullanıyoruz
      const oldPrice = parseFloat(debt.oldPrice) || newPrice;

      // DOĞRU FORMÜL: KAR/ZARAR = Ödünç Alınan Fiyat - Bugünkü Fiyat
      const profitLoss = (oldPrice - newPrice) * parseFloat(debt.amount);

      return {
        type: debt.type,
        amount: debt.amount,
        date: debt.date,
        oldPrice,
        newPrice,
        profitLoss,
      };
    });

    const totalProfitLoss = calculatedDebts.reduce((sum, d) => sum + d.profitLoss, 0);

    return res.status(200).json({
      debts: calculatedDebts,
      totalProfitLoss,
      lastUpdate: new Date(),
    });
  } catch (error) {
    console.error('Hesaplama hatası:', error);
    return res.status(500).json({ error: 'Hesaplama başarısız' });
  }
}
