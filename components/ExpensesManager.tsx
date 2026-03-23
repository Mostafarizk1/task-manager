"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

interface Expense {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string | null;
  date: string;
  createdAt: string;
}

export default function ExpensesManager() {
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    type: "",
    amount: 0,
    currency: "SAR",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      setExpenses(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingExpense) {
        await fetch(`/api/expenses/${editingExpense.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      await fetchExpenses();
      resetForm();
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المصروف؟")) return;

    try {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      await fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      type: expense.type,
      amount: expense.amount,
      currency: expense.currency,
      description: expense.description || "",
      date: expense.date.split("T")[0],
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      type: "",
      amount: 0,
      currency: "SAR",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setEditingExpense(null);
    setShowForm(false);
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "SAR": return "ر.س";
      case "USD": return "$";
      case "EGP": return "ج.م";
      default: return currency;
    }
  };

  const getTotalByCurrency = () => {
    const totals: Record<string, number> = {};
    expenses.forEach((expense) => {
      if (!totals[expense.currency]) {
        totals[expense.currency] = 0;
      }
      totals[expense.currency] += expense.amount;
    });
    return totals;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">جاري التحميل...</div>
      </div>
    );
  }

  const totals = getTotalByCurrency();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                💰 المصاريف النثرية
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                إدارة المصاريف العامة (نت، سلف، فواتير، اشتراكات)
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
              >
                ← العودة للوحة التحكم
              </a>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                {showForm ? "إلغاء" : "+ مصروف جديد"}
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            📊 إجمالي المصاريف
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["SAR", "USD", "EGP"].map((currency) => (
              <div
                key={currency}
                className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg"
              >
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  {currency === "SAR" && "ريال سعودي"}
                  {currency === "USD" && "دولار أمريكي"}
                  {currency === "EGP" && "جنيه مصري"}
                </h3>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {getCurrencySymbol(currency)} {(totals[currency] || 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {expenses.filter((e) => e.currency === currency).length} مصروف
                </p>
              </div>
            ))}
          </div>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {editingExpense ? "تعديل المصروف" : "إضافة مصروف جديد"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نوع المصروف
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">اختر النوع</option>
                  <option value="نت">نت</option>
                  <option value="سلف">سلف</option>
                  <option value="فواتير">فواتير</option>
                  <option value="اشتراكات">اشتراكات</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  المبلغ
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  العملة
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="EGP">جنيه مصري (EGP)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  التاريخ
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ملاحظات (اختياري)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
                >
                  {editingExpense ? "تحديث" : "إضافة"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            قائمة المصاريف ({expenses.length})
          </h2>

          {expenses.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              لا توجد مصاريف حالياً
            </p>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {expense.type}
                      </h3>
                      {expense.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {expense.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {getCurrencySymbol(expense.currency)} {expense.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">التاريخ</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(expense.date).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">العملة</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {expense.currency}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
