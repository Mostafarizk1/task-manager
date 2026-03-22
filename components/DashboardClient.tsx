"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun, Plus, LogOut, Edit2, Trash2, Save, X, CheckCircle, TrendingUp, DollarSign, Calendar, Receipt, Shield } from "lucide-react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ar } from "date-fns/locale";

type Task = {
  id: string;
  taskName: string;
  clientName: string;
  deadline: Date;
  totalPrice: number;
  currency: string;
  collaboratorName: string | null;
  collaboratorCut: number;
  netProfit: number;
  status: string;
  createdAt: Date;
};

type User = {
  id: string;
  email: string;
  name: string;
  role?: string;
};

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "دولار" },
  { code: "SAR", symbol: "﷼", name: "ريال سعودي" },
  { code: "EGP", symbol: "ج.م", name: "جنيه مصري" },
];

export default function DashboardClient({
  initialTasks,
  user,
}: {
  initialTasks: Task[];
  user: User;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [formData, setFormData] = useState({
    taskName: "",
    clientName: "",
    deadline: "",
    totalPrice: "",
    currency: "USD",
    collaboratorName: "",
    collaboratorCut: "",
    status: "To Do",
  });

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        taskName: task.taskName,
        clientName: task.clientName,
        deadline: format(new Date(task.deadline), "yyyy-MM-dd"),
        totalPrice: task.totalPrice.toString(),
        currency: task.currency || "USD",
        collaboratorName: task.collaboratorName || "",
        collaboratorCut: task.collaboratorCut.toString(),
        status: task.status,
      });
    } else {
      setEditingTask(null);
      setFormData({
        taskName: "",
        clientName: "",
        deadline: "",
        totalPrice: "",
        currency: "USD",
        collaboratorName: "",
        collaboratorCut: "",
        status: "To Do",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalPrice = parseFloat(formData.totalPrice) || 0;
    const collaboratorCut = parseFloat(formData.collaboratorCut) || 0;
    const netProfit = totalPrice - collaboratorCut;

    const taskData = {
      taskName: formData.taskName,
      clientName: formData.clientName,
      deadline: new Date(formData.deadline),
      totalPrice,
      currency: formData.currency,
      collaboratorName: formData.collaboratorName || null,
      collaboratorCut,
      netProfit,
      status: formData.status,
    };

    try {
      if (editingTask) {
        await fetch(`/api/tasks/${editingTask.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
      } else {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
      }
      
      router.refresh();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleMarkDone = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, status: "Done" }),
      });

      router.refresh();
    } catch (error) {
      console.error("Error marking task as done:", error);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المهمة؟")) return;

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      router.refresh();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "To Do":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Done":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find(c => c.code === code)?.symbol || "$";
  };

  // حساب الإحصائيات الشهرية
  const getMonthlyStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const stats: Record<string, { count: number; revenue: Record<string, number> }> = {};
    
    tasks.forEach(task => {
      const taskDate = new Date(task.createdAt);
      const monthKey = `${taskDate.getFullYear()}-${taskDate.getMonth() + 1}`;
      
      if (!stats[monthKey]) {
        stats[monthKey] = { count: 0, revenue: {} };
      }
      
      stats[monthKey].count++;
      if (!stats[monthKey].revenue[task.currency]) {
        stats[monthKey].revenue[task.currency] = 0;
      }
      stats[monthKey].revenue[task.currency] += task.netProfit;
    });
    
    return stats;
  };

  const monthlyStats = getMonthlyStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                لوحة التحكم
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                مرحباً، {user.name} {user.role === "admin" && "👑"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/expenses"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                <Receipt className="w-4 h-4" />
                المصاريف
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
                >
                  <Shield className="w-4 h-4" />
                  لوحة الأدمن
                </Link>
              )}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* إحصائيات شهرية */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(monthlyStats).slice(-3).reverse().map(([month, data]) => {
            const [year, monthNum] = month.split('-');
            const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
            
            return (
              <div key={month} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {monthNames[parseInt(monthNum) - 1]} {year}
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">المهام:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{data.count}</span>
                  </div>
                  {Object.entries(data.revenue).map(([currency, amount]) => (
                    <div key={currency} className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">الأرباح:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {getCurrencySymbol(currency)}{amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            المهام ({tasks.length})
          </h2>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            إضافة مهمة جديدة
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {task.taskName}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    task.status
                  )}`}
                >
                  {task.status}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">العميل:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {task.clientName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">التسليم:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {format(new Date(task.deadline), "dd MMM yyyy", {
                      locale: ar,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">تاريخ الإنشاء:</span>
                  <span className="font-medium text-gray-900 dark:text-white text-xs">
                    {format(new Date(task.createdAt), "dd MMM yyyy", {
                      locale: ar,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">السعر:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getCurrencySymbol(task.currency)}{task.totalPrice.toFixed(2)}
                  </span>
                </div>
                {task.collaboratorName && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        المساعد:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {task.collaboratorName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        أجر المساعد:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {getCurrencySymbol(task.currency)}{task.collaboratorCut.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 font-semibold">
                    صافي الربح:
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {getCurrencySymbol(task.currency)}{task.netProfit.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {task.status !== "Done" && (
                  <button
                    onClick={() => handleMarkDone(task.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    تم
                  </button>
                )}
                <button
                  onClick={() => handleOpenModal(task)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                >
                  <Edit2 className="w-4 h-4" />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              لا توجد مهام حالياً. ابدأ بإضافة مهمة جديدة!
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingTask ? "تعديل المهمة" : "إضافة مهمة جديدة"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اسم المهمة *
                </label>
                <input
                  type="text"
                  required
                  value={formData.taskName}
                  onChange={(e) =>
                    setFormData({ ...formData, taskName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اسم العميل *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  موعد التسليم *
                </label>
                <input
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    السعر الإجمالي *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.totalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, totalPrice: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    العملة *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
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
                  اسم المساعد
                </label>
                <input
                  type="text"
                  value={formData.collaboratorName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      collaboratorName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  أجر المساعد
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.collaboratorCut}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      collaboratorCut: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الحالة *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              {formData.totalPrice && formData.collaboratorCut && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      صافي الربح:
                    </span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      {getCurrencySymbol(formData.currency)}
                      {(
                        parseFloat(formData.totalPrice || "0") -
                        parseFloat(formData.collaboratorCut || "0")
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  <Save className="w-5 h-5" />
                  {editingTask ? "حفظ التعديلات" : "إضافة المهمة"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
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
