"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

interface Task {
  id: string;
  title: string;
  clientName: string;
  deadline: string;
  totalPrice: number;
  collaboratorName: string | null;
  collaboratorCut: number;
  netProfit: number;
  status: string;
  createdAt: string;
}

export default function TasksDashboard() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    deadline: "",
    totalPrice: 0,
    collaboratorName: "",
    collaboratorCut: 0,
    netProfit: 0,
    status: "TODO",
  });

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.sort((a: Task, b: Task) => 
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      ));
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
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
      
      fetchTasks();
      resetForm();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المهمة؟")) return;
    
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      clientName: task.clientName,
      deadline: task.deadline.split("T")[0],
      totalPrice: task.totalPrice,
      collaboratorName: task.collaboratorName || "",
      collaboratorCut: task.collaboratorCut,
      netProfit: task.netProfit,
      status: task.status,
    });
    setShowForm(true);
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, status: newStatus }),
      });
      fetchTasks();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      clientName: "",
      deadline: "",
      totalPrice: 0,
      collaboratorName: "",
      collaboratorCut: 0,
      netProfit: 0,
      status: "TODO",
    });
    setEditingTask(null);
    setShowForm(false);
  };

  const calculateNetProfit = (total: number, cut: number) => {
    return total - cut;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO": return "bg-gray-500";
      case "IN_PROGRESS": return "bg-blue-500";
      case "DONE": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "TODO": return "قيد الانتظار";
      case "IN_PROGRESS": return "جاري العمل";
      case "DONE": return "مكتملة";
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
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                >
                  {showForm ? "إلغاء" : "+ مهمة جديدة"}
                </button>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && isAdmin && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
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
                  الحالة
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="TODO">قيد الانتظار</option>
                  <option value="IN_PROGRESS">جاري العمل</option>
                  <option value="DONE">مكتملة</option>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            المهام ({tasks.length})
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
                            ${task.totalPrice}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">نصيب المتعاون</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ${task.collaboratorCut}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">صافي الربح</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            ${task.netProfit}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    {!isAdmin && (
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      >
                        <option value="TODO">قيد الانتظار</option>
                        <option value="IN_PROGRESS">جاري العمل</option>
                        <option value="DONE">مكتملة</option>
                      </select>
                    )}
                    
                    {isAdmin && (
                      <>
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
                      </>
                    )}
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
