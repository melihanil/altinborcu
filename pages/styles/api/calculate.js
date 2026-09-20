export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { debts } = req.body;

    if (!debts || debts.length === 0) {
      return res.status(400).json({ error: 'Borç listesi boş' });
    }

    // Fallback fiyatları
    const todaysPrices = {
      gold_gram: 2650,
      gold_quarter: 10600,
      gold_half: 21200,
      gold_full: 42400,
      usd: 48.5,
      eur: 53.0,
    };

    const calculatedDebts = debts.map((debt) => {
      const newPrice = todaysPrices[debt.type];
      const oldPrice = parseFloat(debt.oldPrice) || newPrice;
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
