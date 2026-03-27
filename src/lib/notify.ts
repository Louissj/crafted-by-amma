type OrderNotifyPayload = {
  orderId: string;
  name: string;
  phone: string;
  city: string;
  products: string;
  total: number;
  deliveryCharge: number;
  isKarnataka: boolean;
};

export async function notifyNewOrder(order: OrderNotifyPayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN || '8617040819:AAGbw1-7RVG1G_zV9O3vBoF1Iiz3TjwGpeg';
  const chatIds = process.env.TELEGRAM_CHAT_IDS || '1255645863';
  const siteUrl = (process.env.SITE_URL || 'https://craftedbyamma.com').replace(/\/$/, '');

  if (!token || !chatIds) return;
  const ids = chatIds.split(',').map(s => s.trim()).filter(Boolean);
  if (ids.length === 0) return;

  const orderId = order.orderId.slice(-8).toUpperCase();
  const productSubtotal = order.total - order.deliveryCharge;
  const now = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'Asia/Kolkata',
  });

  const msg =
    `🌾 <b>Crafted by Amma</b>\n` +
    `<i>New order just landed!</i>\n` +
    `<b>━━━━━━━━━━━━━━━━━━━━</b>\n\n` +

    `🧾 <b>ORDER</b>  <code>#${orderId}</code>\n` +
    `🕐 <i>${now} IST</i>\n\n` +

    `<b>━━━━━━━━━━━━━━━━━━━━</b>\n` +
    `👤  <b>${order.name}</b>\n` +
    `📞  <a href="tel:${order.phone}">${order.phone}</a>\n` +
    `🏙️  ${order.city}${order.isKarnataka ? '  <i>(Karnataka)</i>' : ''}\n\n` +

    `<b>━━━━━━━━━━━━━━━━━━━━</b>\n` +
    `🌾  <b>Products</b>\n` +
    `<code>${order.products}</code>\n\n` +

    `<b>━━━━━━━━━━━━━━━━━━━━</b>\n` +
    `💵  Products:   ₹${productSubtotal}\n` +
    `🚚  Delivery:   ${order.deliveryCharge === 0 ? 'FREE 🎉' : '₹' + order.deliveryCharge}\n` +
    `💰  <b>Total Paid:  ₹${order.total}</b>\n\n` +

    `<b>━━━━━━━━━━━━━━━━━━━━</b>\n` +
    `⚡ <i>Tap below to open the admin panel and confirm this order.</i>`;

  const replyMarkup = {
    inline_keyboard: [[
      { text: '🖥️ Open Admin Panel', url: `${siteUrl}/admin` },
    ], [
      { text: '💬 WhatsApp Customer', url: `https://wa.me/91${order.phone.replace(/[^0-9]/g, '').slice(-10)}` },
    ]],
  };

  await Promise.allSettled(
    ids.map(chatId =>
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: msg,
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        }),
      })
    )
  );
}
