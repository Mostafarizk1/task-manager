export async function sendTelegramMessage(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Telegram credentials not configured");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    const data = await response.json();
    
    if (!data.ok) {
      console.error("Telegram API error:", data);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return false;
  }
}

export function formatTaskNotification(
  upcomingTasks: any[],
  overdueTasks: any[],
  activeTasks: number
) {
  let message = "🔔 <b>تنبيه يومي - Task Manager</b>\n\n";

  if (overdueTasks.length > 0) {
    message += "⚠️ <b>مهام متأخرة:</b>\n";
    overdueTasks.forEach((task) => {
      const daysLate = Math.floor(
        (Date.now() - new Date(task.deadline).getTime()) / (1000 * 60 * 60 * 24)
      );
      message += `• ${task.title} - متأخر بـ ${daysLate} يوم\n`;
      message += `  العميل: ${task.clientName}\n`;
    });
    message += "\n";
  }

  if (upcomingTasks.length > 0) {
    message += "⏰ <b>مهام قريبة (خلال 3 أيام):</b>\n";
    upcomingTasks.forEach((task) => {
      const daysLeft = Math.ceil(
        (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      message += `• ${task.title} - باقي ${daysLeft} يوم\n`;
      message += `  العميل: ${task.clientName}\n`;
    });
    message += "\n";
  }

  message += `📊 <b>إجمالي المهام النشطة:</b> ${activeTasks}`;

  if (upcomingTasks.length === 0 && overdueTasks.length === 0) {
    message = "✅ <b>كل شيء تمام!</b>\n\n";
    message += "لا توجد مهام متأخرة أو قريبة من الموعد النهائي.\n\n";
    message += `📊 <b>إجمالي المهام النشطة:</b> ${activeTasks}`;
  }

  return message;
}
