// Shipping and Customer Pickup. Client-approved text (October 2026 meeting).
// Used by both the Store Policies and Shipping Policy pages so they can't drift apart.
// Do not edit the wording without the client's approval.

const PHONE = { a: '(210) 564-0147', href: 'tel:+12105640147' };
const EMAIL = { a: 'info@tagaroom.com', href: 'mailto:info@tagaroom.com' };

export const shippingSection = {
  h: 'Shipping',
  body: [
    ['ul', [
      'Orders ship within 24 hours, Monday through Friday. We do not ship on Saturdays, Sundays or holidays. Orders placed on weekends or holidays ship the next business day.',
      'Free shipping on all orders, via UPS, FedEx or USPS. Delivery usually takes 3–5 business days after shipment.',
      'We do not ship to Alaska, Hawaii, international addresses or APO/FPO boxes.',
      'We are not responsible for delays caused by weather or the carrier.',
    ]],
  ],
};

export const pickupSection = {
  h: 'Customer Pickup',
  body: [
    ['p', ['Pickup is available by appointment only at our San Antonio location (11031 Perrin Beitel, San Antonio, TX 78217). To schedule, call ', PHONE, ' or email ', EMAIL, ', Monday–Friday, 9:00 am – 4:00 pm Central Time.']],
  ],
};

// At-a-glance cards for the Store Policies page; each line is quoted from the text above.
export const shippingSummary = [
  { icon: 'clock', t: 'Ships Within 24 Hours (Mon–Fri)', text: 'We do not ship on Saturdays, Sundays or holidays.' },
  { icon: 'truck', t: 'Free Shipping, 3–5 Business Days', text: 'Free shipping on all orders, via UPS, FedEx or USPS.' },
  { icon: 'store', t: 'San Antonio Pickup by Appointment', text: '11031 Perrin Beitel, San Antonio, TX 78217' },
];

export default {
  out: 'shipping-policies.html',
  title: 'Shipping Policy',
  pageTitle: 'Shipping Policy | TAG-A-ROOM®',
  description: 'TAG-A-ROOM® shipping policy: orders ship within 24 hours Monday–Friday, free shipping on all orders, and pickup by appointment in San Antonio.',
  updated: 'October 7, 2026',
  sections: [shippingSection, pickupSection],
  related: [
    { t: 'Store Policies', href: 'policies.html' },
    { t: 'Return Policy', href: 'return-policies.html' },
  ],
};
