"use client";

import { useState } from "react";
import Link from "next/link";

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
  createdAt: string;
}

interface UserStats {
  id: string;
  username: string;
  role: string;
  phoneNumber: string | null;
  totalTasks: number;
  completedTasks: number;
  totalRevenue: number;
  tasks: Task[];
}

export default function AdminPanelClient({ users }: { users: UserStats[] }) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [editingPhone, setEditingPhone] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        alert("تم تغيير الدور بنجاح");
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "حدث خطأ");
      }
    } catch (error) {
      console.error("Error changing role:", error);
      alert("حدث خطأ أثناء تغيير الدور");
    } finally {
      setChangingRole(null);
    }
  };

  const handlePhoneUpdate = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/phone`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      if (res.ok) {
        alert("تم تحديث رقم الهاتف بنجاح");
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "حدث خطأ");
      }
    } catch (error) {
      console.error("Error updating phone:", error);
      alert("حدث خطأ أثناء تحديث رقم الهاتف");
    } finally {
      setEditingPhone(null);
      setPhoneNumber("");
    }
  };

  const selectedUserData = users.find((u) => u.id === selectedUser);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              👥 لوحة إدارة المستخدمين
            </h1>
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              ← العودة للداشبورد
            </Link>
          </div>
        </div>

        {/* Users Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user.id)}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer transition hover:shadow-xl ${
                selectedUser === user.id ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.username}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`${user.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'} px-3 py-1 rounded-full text-sm`}>
                    {user.role === 'ADMIN' ? 'مدير' : 'مستخدم'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setChangingRole(user.id);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm transition"
                  >
                    تغيير الدور
                  </button>
                </div>
              </div>
              
              {changingRole === user.id && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">تغيير دور {user.username} إلى:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoleChange(user.id, 'ADMIN');
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition"
                    >
                      مدير
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoleChange(user.id, 'USER');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
                    >
                      مستخدم
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setChangingRole(null);
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">📱 رقم الهاتف:</span>
                  {editingPhone === user.id ? (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="رقم الهاتف"
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                      />
                      <button
                        onClick={() => handlePhoneUpdate(user.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition"
                      >
                        حفظ
                      </button>
                      <button
                        onClick={() => {
                          setEditingPhone(null);
                          setPhoneNumber("");
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {user.phoneNumber || "غير محدد"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPhone(user.id);
                          setPhoneNumber(user.phoneNumber || "");
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition"
                      >
                        تعديل
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">إجمالي المهام:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {user.totalTasks}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">المهام المكتملة:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {user.completedTasks}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">إجمالي الأرباح:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    ${user.totalRevenue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* User Tasks Detail */}
        {selectedUserData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              مهام {selectedUserData.username}
            </h2>
            
            {selectedUserData.tasks.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                لا توجد مهام لهذا المستخدم
              </p>
            ) : (
              <div className="space-y-4">
                {selectedUserData.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
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
                      <span
                        className={`${
                          task.status === "DONE"
                            ? "bg-green-500"
                            : task.status === "IN_PROGRESS"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        } text-white px-3 py-1 rounded-full text-sm`}
                      >
                        {task.status === "DONE"
                          ? "مكتملة"
                          : task.status === "IN_PROGRESS"
                          ? "جاري العمل"
                          : "قيد الانتظار"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        <p className="text-sm text-gray-600 dark:text-gray-400">صافي الربح</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          {task.currency} {task.netProfit}
                        </p>
                      </div>
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
