export const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(Number(val))) return '0';
  return Number(val).toLocaleString('en-IN');
};

export const formatMoneyText = (val: number | null | undefined): string => {
  return `৳ ${formatCurrency(val)}/-`;
};
