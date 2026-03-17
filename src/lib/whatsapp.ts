import { CONTACT } from './constants';

export function generateWhatsAppOrderLink(order: {
  name: string;
  phone: string;
  products: string[];
  quantity: string;
  city: string;
  totalAmount?: number;
}): string {
  const productNames = order.products.join(', ');
  const message = encodeURIComponent(
    `🛒 *New Order — Crafted by Amma*\n\n` +
    `👤 Name: ${order.name}\n` +
    `📱 Phone: ${order.phone}\n` +
    `📦 Products: ${productNames}\n` +
    `⚖️ Quantity: ${order.quantity}\n` +
    `📍 City: ${order.city}\n` +
    `${order.totalAmount ? `💰 Total: ₹${order.totalAmount}\n` : ''}` +
    `\nPlease confirm my order. Thank you! 🙏`
  );
  return `https://wa.me/${CONTACT.whatsapp}?text=${message}`;
}

export function generateAdminNotification(order: {
  id: string;
  name: string;
  phone: string;
  products: string[];
  quantity: string;
  city: string;
  address: string;
  totalAmount?: number;
}): string {
  const productNames = order.products.join(', ');
  const message = encodeURIComponent(
    `📋 *New Order Received!*\n\n` +
    `🆔 Order: ${order.id}\n` +
    `👤 ${order.name}\n` +
    `📱 ${order.phone}\n` +
    `📦 ${productNames} (${order.quantity})\n` +
    `📍 ${order.city}\n` +
    `🏠 ${order.address}\n` +
    `${order.totalAmount ? `💰 ₹${order.totalAmount}` : ''}`
  );
  return `https://wa.me/${CONTACT.whatsapp}?text=${message}`;
}
