"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, DollarSign, TrendingDown, Users } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

type Expense = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  category: string;
  date: Date;
};

type Task = {
  id: string;
  collaboratorName: string | null;
  collaboratorCut: number;
  currency: string;
};

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "دولار" },
  { code: "SAR", symbol: "﷼", name: "ريال سعودي" },
  { code: "EGP", symbol: "ج.م", name: "جنيه مصري" },
];

const EXPENSE_CATEGORIES = [
  "اشتراك الإنترنت",
  "اشتراكات المواقع",
  "أدوات وبرامج",
  "أخرى",
];

export default function ExpensesClient({
  initialExpenses,
  tasks,
  user,
}: {
  initialExpenses: Expense[];
  tasks: Task[];
  user: any;
}) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    currency: "USD",
    category: "اشتراك الإنترنت",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          category: formData.category,
          date: formData.date,
        }),
      });

      router.refresh();
      setShowModal(false);
      setFormData({
        name: "",
        amount: "",
        currency: "USD",
        category: "اشتراك الإنترنت",
        date: format(new Date(), "yyyy-MM-dd"),
      });
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المصروف؟")) return;

    try {
      await fetch(`/api/expenses/${expenseId}`, {
        method: "DELETE",
      });

      router.refresh();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find((c) => c.code === code)?.symbol || "$";
  };

  // حساب إجمالي المصاريف حسب العملة
  const totalExpensesByCurrency = expenses.reduce((acc, expense) => {
    if (!acc[expense.currency]) {
      acc[expense.currency] = 0;
    }
    acc[expense.currency] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // حساب إجمالي أجور المساعدين
  const collaboratorPayments = tasks.reduce((acc, task) => {
    if (task.collaboratorName && task.collaboratorCut > 0) {
      const key = task.collaboratorName;
      if (!acc[key]) {
        acc[key] = {};
      }
      if (!acc[key][task.currency]) {
        acc[key][task.currency] = 0;
      }
      acc[key][task.currency] += task.collaboratorCut;
    }
    return acc;
  }, {} as Record<string, Record<string, number>>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  المصاريف
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  إدارة المصاريف الشهرية
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              إضافة مصروف
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* إحصائيات المصاريف */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                إجمالي المصاريف
              </h2>
            </div>
            <div className="space-y-2">
              {Object.entries(totalExpensesByCurrency).map(([currency, amount]) => (
                <div key={currency} className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    {CURRENCIES.find((c) => c.code === currency)?.name}:
                  </span>
                  <span className="text-xl font-bold text-red-600 dark:text-red-400">
                    {getCurrencySymbol(currency)}
                    {amount.toFixed(2)}
                  </span>
                </div>
              ))}
              {Object.keys(totalExpensesByCurrency).length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">لا توجد مصاريف</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                أجور المساعدين
              </h2>
            </div>
            <div className="space-y-3">
              {Object.entries(collaboratorPayments).map(([name, currencies]) => (
                <div key={name} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <p className="font-medium text-gray-900 dark:text-white mb-1">{name}</p>
                  {Object.entries(currencies).map(([currency, amount]) => (
                    <div key={currency} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {CURRENCIES.find((c) => c.code === currency)?.name}:
                      </span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {getCurrencySymbol(currency)}
                        {amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
              {Object.keys(collaboratorPayments).length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">لا توجد مدفوعات للمساعدين</p>
              )}
            </div>
          </div>
        </div>

        {/* قائمة المصاريف */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              سجل المصاريف ({expenses.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {expense.name}
                      </h3>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs rounded-full">
                        {expense.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(expense.date), "dd MMMM yyyy", { locale: ar })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="text-xl font-bold text-red-600 dark:text-red-400">
                        {getCurrencySymbol(expense.currency)}
                        {expense.amount.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <div className="p-12 text-center">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  لا توجد مصاريف مسجلة
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                إضافة مصروف جديد
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اسم المصروف *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="مثال: اشتراك Adobe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الفئة *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    المبلغ *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    العملة *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  التاريخ *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  إضافة
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
