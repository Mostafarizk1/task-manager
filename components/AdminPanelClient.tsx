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
  totalTasks: number;
  completedTasks: number;
  totalRevenue: number;
  tasks: Task[];
}

export default function AdminPanelClient({ users }: { users: UserStats[] }) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

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
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                  مستخدم
                </span>
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
