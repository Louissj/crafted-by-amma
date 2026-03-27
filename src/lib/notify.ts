type OrderNotifyPayload = {
  orderId: string;
  name: string;
  phone: string;
  city: string;
  products: string;
  total: number;
};

export async function notifyNewOrder(order: OrderNotifyPayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN || '8617040819:AAGbw1-7RVG1G_zV9O3vBoF1Iiz3TjwGpeg';
  const chatIds = process.env.TELEGRAM_CHAT_IDS || '1255645863';
  if (!token || !chatIds) return;

  const ids = chatIds.split(',').map(s => s.trim()).filter(Boolean);
  if (ids.length === 0) return;

  const msg =
    `🛒 *New Order Received!*\n\n` +
    `📋 Order ID: \`${order.orderId.slice(-8).toUpperCase()}\`\n` +
    `👤 Name: ${order.name}\n` +
    `📞 Phone: ${order.phone}\n` +
    `🏙️ City: ${order.city}\n` +
    `🌾 Products: ${order.products}\n` +
    `💰 Total: ₹${order.total}\n\n` +
    `_Open admin panel to review & confirm._`;

  await Promise.allSettled(
    ids.map(chatId =>
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'Markdown' }),
      })
    )
  );
}
