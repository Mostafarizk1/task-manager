"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";

interface CurrencyReport {
  totalRevenue: number;
  taskProfit: number;
  totalExpenses: number;
  netProfit: number;
  taskCount: number;
  expenseCount: number;
}

interface MonthlyReport {
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  report: {
    SAR: CurrencyReport;
    USD: CurrencyReport;
    EGP: CurrencyReport;
  };
}

export default function MonthlyReports() {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchReport();
  }, [selectedMonth, selectedYear]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reports/monthly?month=${selectedMonth}&year=${selectedYear}`
      );
      const data = await res.json();
      setReport(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching report:", error);
      setLoading(false);
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "SAR":
        return "ر.س";
      case "USD":
        return "$";
      case "EGP":
        return "ج.م";
      default:
        return currency;
    }
  };

  const getCurrencyName = (currency: string) => {
    switch (currency) {
      case "SAR":
        return "ريال سعودي";
      case "USD":
        return "دولار أمريكي";
      case "EGP":
        return "جنيه مصري";
      default:
        return currency;
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];
    return months[month];
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">
          جاري تحميل التقرير...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                📊 التقارير الشهرية
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                تقرير مفصل للأرباح والمصاريف حسب العملة
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
            اختر الشهر والسنة
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الشهر
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {getMonthName(i)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                السنة
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {report && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                تقرير {getMonthName(report.month)} {report.year}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                من {new Date(report.startDate).toLocaleDateString("ar-EG")} إلى{" "}
                {new Date(report.endDate).toLocaleDateString("ar-EG")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(["SAR", "USD", "EGP"] as const).map((currency) => {
                const currencyData = report.report[currency];
                const isProfit = currencyData.netProfit >= 0;

                return (
                  <div
                    key={currency}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {getCurrencyName(currency)}
                      </h3>
                      <span className="text-3xl">
                        {currency === "SAR" && "🇸🇦"}
                        {currency === "USD" && "🇺🇸"}
                        {currency === "EGP" && "🇪🇬"}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          إجمالي الدخل
                        </p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {getCurrencySymbol(currency)}{" "}
                          {currencyData.totalRevenue.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          من {currencyData.taskCount} مهمة مكتملة
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          صافي ربح المهام
                        </p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {getCurrencySymbol(currency)}{" "}
                          {currencyData.taskProfit.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          بعد خصم أجور المتعاونين
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          المصاريف النثرية
                        </p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {getCurrencySymbol(currency)}{" "}
                          {currencyData.totalExpenses.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          من {currencyData.expenseCount} مصروف
                        </p>
                      </div>

                      <div
                        className={`p-4 rounded-lg ${
                          isProfit
                            ? "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40"
                            : "bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40"
                        }`}
                      >
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          صافي الربح النهائي
                        </p>
                        <p
                          className={`text-3xl font-bold ${
                            isProfit
                              ? "text-green-700 dark:text-green-300"
                              : "text-red-700 dark:text-red-300"
                          }`}
                        >
                          {getCurrencySymbol(currency)}{" "}
                          {currencyData.netProfit.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          {isProfit ? "ربح ✓" : "خسارة ✗"}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p className="mb-1">
                            المعادلة: صافي ربح المهام - المصاريف النثرية
                          </p>
                          <p className="font-mono text-xs">
                            {currencyData.taskProfit.toFixed(2)} -{" "}
                            {currencyData.totalExpenses.toFixed(2)} ={" "}
                            {currencyData.netProfit.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                📈 ملخص عام
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    إجمالي المهام المكتملة
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {report.report.SAR.taskCount +
                      report.report.USD.taskCount +
                      report.report.EGP.taskCount}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    إجمالي المصاريف النثرية
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {report.report.SAR.expenseCount +
                      report.report.USD.expenseCount +
                      report.report.EGP.expenseCount}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    العملات النشطة
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {[
                      report.report.SAR.taskCount > 0 ||
                      report.report.SAR.expenseCount > 0,
                      report.report.USD.taskCount > 0 ||
                      report.report.USD.expenseCount > 0,
                      report.report.EGP.taskCount > 0 ||
                      report.report.EGP.expenseCount > 0,
                    ].filter(Boolean).length}{" "}
                    / 3
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
