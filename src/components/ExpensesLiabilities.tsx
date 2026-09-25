import React from 'react';
import { Expense, FinancialLiability } from '../types';
import { WalletCards, Plus } from 'lucide-react';

interface ExpensesLiabilitiesProps {
  expenses: Expense[];
  liabilities: FinancialLiability[];
}

export const ExpensesLiabilities: React.FC<ExpensesLiabilitiesProps> = ({ expenses, liabilities }) => {
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">Expenses & Financial Liabilities</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
          Track production overheads, office rent, salaries, and supplier payables.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses */}
        <div className="bg-[#0B192C] rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4 text-slate-200">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <WalletCards className="w-5 h-5 text-amber-400" />
              <span>Operating Expenses (Total: ৳ {totalExp.toLocaleString()}/-)</span>
            </h3>
          </div>

          <div className="space-y-3">
            {expenses.map((exp) => (
              <div key={exp.id} className="p-3.5 bg-[#07101C] rounded-xl border border-slate-800 flex justify-between items-center hover:border-slate-700 transition-colors">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    {exp.category}
                  </span>
                  <p className="font-bold text-xs text-white mt-1">{exp.description}</p>
                  <p className="text-[11px] text-slate-400">Paid to: {exp.paidTo} • {exp.date}</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-xs text-amber-400">৳ {exp.amount.toLocaleString()}/-</span>
                  <span className="block text-[10px] text-slate-500">{exp.paymentMethod}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Liabilities */}
        <div className="bg-[#0B192C] rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4 text-slate-200">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <WalletCards className="w-5 h-5 text-red-400" />
            <span>Supplier Payables & Liabilities</span>
          </h3>

          <div className="space-y-3">
            {liabilities.map((liab) => (
              <div key={liab.id} className="p-3.5 bg-[#07101C] rounded-xl border border-slate-800 flex justify-between items-center hover:border-slate-700 transition-colors">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                    {liab.status}
                  </span>
                  <p className="font-bold text-xs text-white mt-1">{liab.title}</p>
                  <p className="text-[11px] text-slate-400">Creditor: {liab.creditor} • Due: {liab.dueDate}</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-xs text-red-400">৳ {(liab.totalAmount - liab.paidAmount).toLocaleString()}/-</span>
                  <span className="block text-[10px] text-slate-500">Total: ৳ {liab.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
