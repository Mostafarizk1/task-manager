"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

interface Task {
  id: string;
  title: string;
  clientName: string;
  deadline: string;
  totalPrice: number;
  currency: string;
  collaboratorName: string | null;
  collaboratorCut: number;
  netProfit: number;
  status: string;
  userId: string;
  isFullyDelivered: boolean;
  isFullyPaid: boolean;
  clientPaidAmount: number;
  clientRemainingAmount: number;
  collaboratorPaid: boolean;
  collaboratorPaidAmount: number;
  collaboratorPaidCurrency: string;
  createdAt: string;
  updatedAt: string;
}

export default function TasksDashboard() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [completingTask, setCompletingTask] = useState<Task | null>(null);
  const [completionData, setCompletionData] = useState({
    isFullyDelivered: false,
    isFullyPaid: false,
    clientPaidAmount: 0,
    clientRemainingAmount: 0,
    collaboratorPaid: false,
    collaboratorPaidAmount: 0,
    collaboratorPaidCurrency: "USD",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    deadline: "",
    totalPrice: 0,
    currency: "USD",
    collaboratorName: "",
    collaboratorCut: 0,
    netProfit: 0,
    status: "ACTIVE",
    advancePayment: 0,
    advancePaymentCurrency: "USD",
  });

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    fetchTasks();
  }, []);

  const getMonthlyStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const stats: { [key: string]: { count: number; revenue: { [currency: string]: number }; month: string } } = {};
    
    tasks.forEach(task => {
      const taskDate = new Date(task.createdAt);
      const monthKey = `${taskDate.getFullYear()}-${taskDate.getMonth()}`;
      const monthName = taskDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
      
      if (!stats[monthKey]) {
        stats[monthKey] = { count: 0, revenue: {}, month: monthName };
      }
      
      stats[monthKey].count++;
      if (isAdmin) {
        const currency = task.currency || 'USD';
        if (!stats[monthKey].revenue[currency]) {
          stats[monthKey].revenue[currency] = 0;
        }
        stats[monthKey].revenue[currency] += task.netProfit;
      }
    });
    
    return Object.values(stats).sort((a, b) => b.month.localeCompare(a.month)).slice(0, 6);
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.sort((a: Task, b: Task) => 
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      ));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      ...formData,
      totalPrice: Number(formData.totalPrice),
      collaboratorCut: Number(formData.collaboratorCut),
      netProfit: Number(formData.netProfit),
      currency: formData.currency,
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
      
      await fetchTasks();
      resetForm();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المهمة؟")) return;
    
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      await fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقين");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    try {
      const res = await fetch("/api/users/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("تم تغيير كلمة المرور بنجاح");
        setShowPasswordForm(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        alert(data.error || "حدث خطأ أثناء تغيير كلمة المرور");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("حدث خطأ أثناء تغيير كلمة المرور");
    }
  };

  const formRef = useRef<HTMLDivElement>(null);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      clientName: task.clientName,
      deadline: task.deadline.split("T")[0],
      totalPrice: task.totalPrice,
      currency: task.currency || "USD",
      collaboratorName: task.collaboratorName || "",
      collaboratorCut: task.collaboratorCut,
      netProfit: task.netProfit,
      status: task.status,
      advancePayment: 0,
      advancePaymentCurrency: "USD",
    });
    setShowForm(true);
    
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (newStatus === "COMPLETED") {
      setCompletingTask(task);
      setShowCompletionDialog(true);
      return;
    }

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, status: newStatus }),
      });
      await fetchTasks();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleCompleteTask = async () => {
    if (!completingTask) return;

    try {
      await fetch(`/api/tasks/${completingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...completingTask,
          status: "COMPLETED",
          ...completionData,
        }),
      });
      await fetchTasks();
      setShowCompletionDialog(false);
      setCompletingTask(null);
      setCompletionData({
        isFullyDelivered: false,
        isFullyPaid: false,
        clientPaidAmount: 0,
        clientRemainingAmount: 0,
        collaboratorPaid: false,
        collaboratorPaidAmount: 0,
        collaboratorPaidCurrency: "USD",
      });
    } catch (error) {
      console.error("Error completing task:", error);
      alert("حدث خطأ أثناء إتمام المهمة");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      clientName: "",
      deadline: "",
      totalPrice: 0,
      currency: "USD",
      collaboratorName: "",
      collaboratorCut: 0,
      netProfit: 0,
      status: "ACTIVE",
      advancePayment: 0,
      advancePaymentCurrency: "USD",
    });
    setEditingTask(null);
    setShowForm(false);
  };

  const calculateNetProfit = (total: number, cut: number) => {
    return total - cut;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-blue-500";
      case "REVIEW": return "bg-yellow-500";
      case "COMPLETED": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE": return "نشط";
      case "REVIEW": return "مراجعة";
      case "COMPLETED": return "مكتمل";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                مرحباً {session?.user?.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                الدور: <span className="font-semibold">{isAdmin ? "مدير" : "مستخدم"}</span>
              </p>
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <>
                  <a
                    href="/admin/panel"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    👥 إدارة المستخدمين
                  </a>
                  <a
                    href="/admin/expenses"
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    💰 المصاريف النثرية
                  </a>
                  <a
                    href="/admin/reports"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    📊 التقارير الشهرية
                  </a>
                </>
              )}
              <button
                onClick={() => {
                  setShowPasswordForm(!showPasswordForm);
                  setShowForm(false);
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition"
              >
                🔒 تغيير كلمة المرور
              </button>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setShowPasswordForm(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                {showForm ? "إلغاء" : "+ مهمة جديدة"}
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

        {/* Monthly Statistics */}
        {isAdmin && tasks.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              📊 الإحصائيات الشهرية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getMonthlyStats().map((stat, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    {stat.month}
                  </h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.count}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">مهمة</p>
                    </div>
                    <div className="text-right">
                      {Object.entries(stat.revenue).map(([currency, amount]) => (
                        <p key={currency} className="text-lg font-bold text-green-600 dark:text-green-400">
                          {currency} {amount.toFixed(2)}
                        </p>
                      ))}
                      <p className="text-xs text-gray-600 dark:text-gray-400">صافي الربح</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Password Change Form */}
        {showPasswordForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🔒 تغيير كلمة المرور
            </h2>
            <form onSubmit={handlePasswordChange} className="max-w-md">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  كلمة المرور الحالية
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
                >
                  تغيير كلمة المرور
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Completion Dialog */}
        {showCompletionDialog && completingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ✅ إتمام المهمة: {completingTask.title}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-900 dark:text-white font-medium mb-2">
                    هل تم تسليم العمل بالكامل؟
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCompletionData({ ...completionData, isFullyDelivered: true })}
                      className={`flex-1 px-4 py-2 rounded-lg transition ${
                        completionData.isFullyDelivered
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      نعم
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompletionData({ ...completionData, isFullyDelivered: false })}
                      className={`flex-1 px-4 py-2 rounded-lg transition ${
                        !completionData.isFullyDelivered
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      لا
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-gray-900 dark:text-white font-medium mb-2">
                    هل تم دفع المبلغ بالكامل؟
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCompletionData({ ...completionData, isFullyPaid: true })}
                      className={`flex-1 px-4 py-2 rounded-lg transition ${
                        completionData.isFullyPaid
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      نعم
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompletionData({ ...completionData, isFullyPaid: false })}
                      className={`flex-1 px-4 py-2 rounded-lg transition ${
                        !completionData.isFullyPaid
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      لا
                    </button>
                  </div>
                </div>

                {!completionData.isFullyPaid && (
                  <div className="ml-8 space-y-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        💰 المبلغ المدفوع
                      </label>
                      <input
                        type="number"
                        value={completionData.clientPaidAmount}
                        onChange={(e) => {
                          const paid = Number(e.target.value);
                          const remaining = completingTask.totalPrice - paid;
                          setCompletionData({ 
                            ...completionData, 
                            clientPaidAmount: paid,
                            clientRemainingAmount: remaining > 0 ? remaining : 0
                          });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        📊 المبلغ الباقي
                      </label>
                      <input
                        type="number"
                        value={completionData.clientRemainingAmount}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-600"
                      />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      السعر الإجمالي: {completingTask.totalPrice} {completingTask.currency}
                    </div>
                  </div>
                )}

                {completingTask.collaboratorName && (
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium mb-2">
                      هل تم تحويل فلوس المتعاون ({completingTask.collaboratorName})؟
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCompletionData({ ...completionData, collaboratorPaid: true })}
                        className={`flex-1 px-4 py-2 rounded-lg transition ${
                          completionData.collaboratorPaid
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        نعم
                      </button>
                      <button
                        type="button"
                        onClick={() => setCompletionData({ ...completionData, collaboratorPaid: false })}
                        className={`flex-1 px-4 py-2 rounded-lg transition ${
                          !completionData.collaboratorPaid
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        لا
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCompleteTask}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
                >
                  إتمام المهمة
                </button>
                <button
                  onClick={() => {
                    setShowCompletionDialog(false);
                    setCompletingTask(null);
                    setCompletionData({
                      isFullyDelivered: false,
                      isFullyPaid: false,
                      clientPaidAmount: 0,
                      clientRemainingAmount: 0,
                      collaboratorPaid: false,
                      collaboratorPaidAmount: 0,
                      collaboratorPaidCurrency: "USD",
                    });
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div ref={formRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {editingTask ? "تعديل المهمة" : "إضافة مهمة جديدة"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  عنوان المهمة
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اسم العميل
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الموعد النهائي
                </label>
                <input
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  السعر الإجمالي
                </label>
                <input
                  type="number"
                  required
                  value={formData.totalPrice}
                  onChange={(e) => {
                    const total = Number(e.target.value);
                    setFormData({ 
                      ...formData, 
                      totalPrice: total,
                      netProfit: calculateNetProfit(total, formData.collaboratorCut)
                    });
                  }}
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
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="EGP">جنيه مصري (EGP)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اسم المتعاون (اختياري)
                </label>
                <input
                  type="text"
                  value={formData.collaboratorName}
                  onChange={(e) => setFormData({ ...formData, collaboratorName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نصيب المتعاون
                </label>
                <input
                  type="number"
                  value={formData.collaboratorCut}
                  onChange={(e) => {
                    const cut = Number(e.target.value);
                    setFormData({ 
                      ...formData, 
                      collaboratorCut: cut,
                      netProfit: calculateNetProfit(formData.totalPrice, cut)
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  صافي الربح
                </label>
                <input
                  type="number"
                  value={formData.netProfit}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  المبلغ المقدم من العميل
                </label>
                <input
                  type="number"
                  value={formData.advancePayment}
                  onChange={(e) => setFormData({ ...formData, advancePayment: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  عملة المبلغ المقدم
                </label>
                <select
                  value={formData.advancePaymentCurrency}
                  onChange={(e) => setFormData({ ...formData, advancePaymentCurrency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="EGP">جنيه مصري (EGP)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الحالة
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="ACTIVE">نشط</option>
                  <option value="REVIEW">مراجعة</option>
                  <option value="COMPLETED">مكتمل</option>
                </select>
              </div>

              <div className="col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
                >
                  {editingTask ? "تحديث" : "إضافة"}
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

        {/* Tasks List */}
        {isAdmin ? (
          <>
            {/* ADMIN's Own Tasks */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                مهامي الشخصية ({tasks.filter(t => t.userId === session?.user?.id).length})
              </h2>
              
              {tasks.filter(t => t.userId === session?.user?.id).length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  لا توجد مهام شخصية حالياً
                </p>
              ) : (
                <div className="space-y-4">
                  {tasks.filter(t => t.userId === session?.user?.id).map((task) => (
                    <div
                      key={task.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {task.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            العميل: {task.clientName}
                          </p>
                          {task.collaboratorName && (
                            <p className="text-gray-600 dark:text-gray-400">
                              المتعاون: {task.collaboratorName}
                            </p>
                          )}
                        </div>
                        <span className={`${getStatusColor(task.status)} text-white px-3 py-1 rounded-full text-sm`}>
                          {getStatusText(task.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">تاريخ الإنشاء</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {new Date(task.createdAt).toLocaleDateString("ar-EG")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">الموعد النهائي</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {new Date(task.deadline).toLocaleDateString("ar-EG")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">السعر الإجمالي</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {task.currency} {task.totalPrice}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">نصيب المتعاون</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {task.currency} {task.collaboratorCut}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">صافي الربح</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            {task.currency} {task.netProfit}
                          </p>
                        </div>
                      </div>

                      {task.status === "COMPLETED" && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">التسليم:</span>
                            <span className={`text-sm font-semibold ${task.isFullyDelivered ? 'text-green-600' : 'text-red-600'}`}>
                              {task.isFullyDelivered ? '✅ تم التسليم' : '❌ لم يتم'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">الدفع:</span>
                            <span className={`text-sm font-semibold ${task.isFullyPaid ? 'text-green-600' : 'text-orange-600'}`}>
                              {task.isFullyPaid ? '✅ تم الدفع بالكامل' : `⚠️ مدفوع ${task.clientPaidAmount} - باقي ${task.clientRemainingAmount}`}
                            </span>
                          </div>
                          {task.collaboratorName && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">المتعاون:</span>
                              <span className={`text-sm font-semibold ${task.collaboratorPaid ? 'text-green-600' : 'text-red-600'}`}>
                                {task.collaboratorPaid ? '✅ تم التحويل' : '❌ لم يتم'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleEdit(task)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                        >
                          حذف
                        </button>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        >
                          <option value="ACTIVE">نشط</option>
                          <option value="REVIEW">مراجعة</option>
                          <option value="COMPLETED">مكتمل</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Team Tasks */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                مهام الفريق ({tasks.filter(t => t.userId !== session?.user?.id).length})
              </h2>
              
              {tasks.filter(t => t.userId !== session?.user?.id).length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  لا توجد مهام للفريق حالياً
                </p>
              ) : (
                <div className="space-y-4">
                  {tasks.filter(t => t.userId !== session?.user?.id).map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {task.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        العميل: {task.clientName}
                      </p>
                      {task.collaboratorName && (
                        <p className="text-gray-600 dark:text-gray-400">
                          المتعاون: {task.collaboratorName}
                        </p>
                      )}
                    </div>
                    <span className={`${getStatusColor(task.status)} text-white px-3 py-1 rounded-full text-sm`}>
                      {getStatusText(task.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">تاريخ الإنشاء</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(task.createdAt).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">الموعد النهائي</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(task.deadline).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                    
                    {isAdmin && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">السعر الإجمالي</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {task.currency} {task.totalPrice}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">نصيب المتعاون</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {task.currency} {task.collaboratorCut}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">صافي الربح</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            {task.currency} {task.netProfit}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {task.status === "COMPLETED" && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">التسليم:</span>
                        <span className={`text-sm font-semibold ${task.isFullyDelivered ? 'text-green-600' : 'text-red-600'}`}>
                          {task.isFullyDelivered ? '✅ تم التسليم' : '❌ لم يتم'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">الدفع:</span>
                        <span className={`text-sm font-semibold ${task.isFullyPaid ? 'text-green-600' : 'text-orange-600'}`}>
                          {task.isFullyPaid ? '✅ تم الدفع بالكامل' : `⚠️ مدفوع ${task.clientPaidAmount} - باقي ${task.clientRemainingAmount}`}
                        </span>
                      </div>
                      {task.collaboratorName && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">المتعاون:</span>
                          <span className={`text-sm font-semibold ${task.collaboratorPaid ? 'text-green-600' : 'text-red-600'}`}>
                            {task.collaboratorPaid ? '✅ تم التحويل' : '❌ لم يتم'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(task)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      حذف
                    </button>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="ACTIVE">نشط</option>
                      <option value="REVIEW">مراجعة</option>
                      <option value="COMPLETED">مكتمل</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              مهامي ({tasks.length})
            </h2>
            
            {tasks.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                لا توجد مهام حالياً
              </p>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          العميل: {task.clientName}
                        </p>
                        {task.collaboratorName && (
                          <p className="text-gray-600 dark:text-gray-400">
                            المتعاون: {task.collaboratorName}
                          </p>
                        )}
                      </div>
                      <span className={`${getStatusColor(task.status)} text-white px-3 py-1 rounded-full text-sm`}>
                        {getStatusText(task.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">تاريخ الإنشاء</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {new Date(task.createdAt).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">الموعد النهائي</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {new Date(task.deadline).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      {task.status !== "COMPLETED" && (
                        <>
                          <button
                            onClick={() => handleEdit(task)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                          >
                            تعديل
                          </button>
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          >
                            <option value="ACTIVE">نشط</option>
                            <option value="REVIEW">مراجعة</option>
                            <option value="COMPLETED">مكتمل</option>
                          </select>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
