// Return Policy. Client-approved text (October 2026 meeting).
// Do not edit the wording without the client's approval.

export default {
  out: 'return-policies.html',
  title: 'Return Policy',
  pageTitle: 'Return Policy | TAG-A-ROOM®',
  description: 'TAG-A-ROOM® return policy for website and direct orders, and how to return Amazon and Walmart.com purchases.',
  updated: 'October 7, 2026',
  sections: [
    {
      h: 'Website & Direct Orders',
      body: [
        ['p', 'For orders placed on tagaroom.com or directly with TAG-A-ROOM:'],
        ['ul', [
          'Returns may be made within 30 days of the order.',
          'Items must be in their original packaging and complete.',
          'Items received in error or damaged must be reported within 7 days of receipt.',
          'Returns that are not the fault of the seller are shipped at the customer\'s expense.',
          'Returns may incur a 15% restocking fee.',
          ['To start a return, contact us at ', { a: 'info@tagaroom.com', href: 'mailto:info@tagaroom.com' }, ' or ', { a: '(210) 564-0147', href: 'tel:+12105640147' }, '.'],
        ]],
      ],
    },
    {
      h: 'Amazon & Walmart.com Orders',
      body: [
        ['p', 'Purchases made through Amazon or Walmart.com must be returned or refunded through that marketplace. Please start your return in your Amazon or Walmart.com account. We are unable to process marketplace returns directly.'],
      ],
    },
  ],
  related: [
    { t: 'Store Policies', href: 'policies.html' },
    { t: 'Shipping Policy', href: 'shipping-policies.html' },
  ],
};
