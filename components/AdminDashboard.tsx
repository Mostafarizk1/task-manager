"use client";

import Link from "next/link";
import { ArrowLeft, Users, DollarSign, TrendingUp, Calendar } from "lucide-react";

type Task = {
  id: string;
  taskName: string;
  totalPrice: number;
  currency: string;
  netProfit: number;
  status: string;
  createdAt: Date;
};

type Expense = {
  id: string;
  amount: number;
  currency: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  tasks: Task[];
  expenses: Expense[];
  createdAt: Date;
};

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "دولار" },
  { code: "SAR", symbol: "﷼", name: "ريال سعودي" },
  { code: "EGP", symbol: "ج.م", name: "جنيه مصري" },
];

export default function AdminDashboard({
  users,
  admin,
}: {
  users: User[];
  admin: any;
}) {
  const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find((c) => c.code === code)?.symbol || "$";
  };

  // حساب إحصائيات كل مستخدم
  const userStats = users.map((user) => {
    const revenueByCurrency: Record<string, number> = {};
    const expensesByCurrency: Record<string, number> = {};

    user.tasks.forEach((task) => {
      if (!revenueByCurrency[task.currency]) {
        revenueByCurrency[task.currency] = 0;
      }
      revenueByCurrency[task.currency] += task.netProfit;
    });

    user.expenses.forEach((expense) => {
      if (!expensesByCurrency[expense.currency]) {
        expensesByCurrency[expense.currency] = 0;
      }
      expensesByCurrency[expense.currency] += expense.amount;
    });

    const netProfitByCurrency: Record<string, number> = {};
    Object.keys(revenueByCurrency).forEach((currency) => {
      netProfitByCurrency[currency] =
        revenueByCurrency[currency] - (expensesByCurrency[currency] || 0);
    });

    return {
      user,
      tasksCount: user.tasks.length,
      completedTasks: user.tasks.filter((t) => t.status === "Done").length,
      revenueByCurrency,
      expensesByCurrency,
      netProfitByCurrency,
    };
  });

  // إجمالي الإحصائيات
  const totalStats = {
    users: users.length,
    tasks: users.reduce((sum, u) => sum + u.tasks.length, 0),
    completedTasks: users.reduce(
      (sum, u) => sum + u.tasks.filter((t) => t.status === "Done").length,
      0
    ),
  };

  const totalRevenueByCurrency: Record<string, number> = {};
  users.forEach((user) => {
    user.tasks.forEach((task) => {
      if (!totalRevenueByCurrency[task.currency]) {
        totalRevenueByCurrency[task.currency] = 0;
      }
      totalRevenueByCurrency[task.currency] += task.netProfit;
    });
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  👑 لوحة تحكم المدير
                </h1>
                <p className="text-orange-100 mt-1">
                  مرحباً، {admin.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* إحصائيات عامة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">المستخدمين</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalStats.users}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المهام</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalStats.tasks}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">المهام المكتملة</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalStats.completedTasks}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الأرباح</p>
                <div className="space-y-1">
                  {Object.entries(totalRevenueByCurrency).map(([currency, amount]) => (
                    <p key={currency} className="text-lg font-bold text-green-600 dark:text-green-400">
                      {getCurrencySymbol(currency)}{amount.toFixed(0)}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* إحصائيات المستخدمين */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              تفاصيل المستخدمين
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {userStats.map(({ user, tasksCount, completedTasks, revenueByCurrency, expensesByCurrency, netProfitByCurrency }) => (
              <div key={user.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      انضم في {new Date(user.createdAt).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">المهام</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {tasksCount}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {completedTasks} مكتملة
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">الإيرادات</p>
                    {Object.entries(revenueByCurrency).map(([currency, amount]) => (
                      <p key={currency} className="text-lg font-bold text-green-600 dark:text-green-400">
                        {getCurrencySymbol(currency)}{amount.toFixed(2)}
                      </p>
                    ))}
                    {Object.keys(revenueByCurrency).length === 0 && (
                      <p className="text-lg font-bold text-gray-400">$0.00</p>
                    )}
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">المصاريف</p>
                    {Object.entries(expensesByCurrency).map(([currency, amount]) => (
                      <p key={currency} className="text-lg font-bold text-red-600 dark:text-red-400">
                        {getCurrencySymbol(currency)}{amount.toFixed(2)}
                      </p>
                    ))}
                    {Object.keys(expensesByCurrency).length === 0 && (
                      <p className="text-lg font-bold text-gray-400">$0.00</p>
                    )}
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">صافي الربح</p>
                    {Object.entries(netProfitByCurrency).map(([currency, amount]) => (
                      <p key={currency} className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {getCurrencySymbol(currency)}{amount.toFixed(2)}
                      </p>
                    ))}
                    {Object.keys(netProfitByCurrency).length === 0 && (
                      <p className="text-lg font-bold text-gray-400">$0.00</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  لا يوجد مستخدمين مسجلين
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
