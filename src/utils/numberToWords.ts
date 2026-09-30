/**
 * Converts a numeric amount to Bangladeshi Taka words (Crore, Lakh, Thousand, Hundred)
 */
export function numberToWordsBDT(amount: number): string {
  if (!amount || isNaN(amount) || amount <= 0) return 'Zero Taka Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertLessThanThousand(n: number): string {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + ' ';
    }
    return str.trim();
  }

  const integerPart = Math.floor(amount);
  let remaining = integerPart;

  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;

  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;

  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;

  const hundreds = remaining;

  const parts: string[] = [];

  if (crore > 0) {
    parts.push(convertLessThanThousand(crore) + ' Crore');
  }
  if (lakh > 0) {
    parts.push(convertLessThanThousand(lakh) + ' Lakh');
  }
  if (thousand > 0) {
    parts.push(convertLessThanThousand(thousand) + ' Thousand');
  }
  if (hundreds > 0) {
    parts.push(convertLessThanThousand(hundreds));
  }

  const words = parts.join(' ').replace(/\s+/g, ' ').trim();
  return words ? `${words} Taka Only` : 'Zero Taka Only';
}
