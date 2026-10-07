// Shipping & Delivery Policies. Text copied word for word from the client's
// live site (https://tagaroom.com/policies/ and /shipping-policies/, identical
// text, provided Oct 2026). Used by both the Store Policies and Shipping Policy
// pages so they can't drift apart.
// Formatting only: empty list items removed, nested lists flattened.
// Do not edit the wording without the client's approval.

export const SHIPPING_HEADING = 'SHIPPING & DELIVERY POLICIES';

// Visual summary for the Store Policies page. Every fact is quoted from the text below.
export const shippingSummary = [
        { icon: 'truck', t: 'Free Shipping', facts: [
          ['Carriers', 'UPS, FedEx, or USPS'],
          ['Delivery', '3-5 business days'],
          ['Order cutoff', 'Ships the same day before 4 pm CST'],
        ] },
        { icon: 'store', t: 'Local Pickup', facts: [
          ['Stores', 'San Antonio & Corpus Christi'],
          ['Same day', 'Order before 3 pm CST, ready by 4 pm'],
          ['Next day', 'Order before 3 pm CST, ready by 8 am'],
          ['Pick-up times', 'Monday-Friday, 8 am – 4 pm'],
        ] },
        { icon: 'clock', t: 'Same-Day Local Delivery', facts: [
          ['Minimum charge', '$75'],
          ['Deadline', '12 PM CST'],
          ['Delivery hours', 'Monday-Friday, 12 pm – 3 pm'],
        ] },
        { icon: 'calendar', t: 'Next-Day Local Delivery', facts: [
          ['Free delivery', 'Orders over $150'],
          ['Delivery fee', '$75 under the $150 minimum'],
          ['Deadline', '3:00 PM CST'],
        ] },
      ];

export const shippingBlocks = [
        ['h3', 'Nationwide Shipping'],
        ['ul', [
          'FREE same-day shipping.',
          'Tag-A-Room ships non-local orders via UPS, FedEx, or USPS. Orders ship out the same day before 4 pm CST. We do not ship on Saturdays, Sundays, or holidays.',
          'Estimated delivery time is 3-5 business days. We are not responsible for weather delays or any unforeseen carrier delays.',
        ]],
        ['p', 'Tag-A-Room does not ship to Alaska, Hawaii, overseas, or APO Boxes.'],
        ['h3', 'Customer Pick-Up'],
        ['ul', [
          'Same Day pick-up order – order before the 3 pm CST cut-off time and the order will be ready for same-day pick-up by 4 pm.',
          'Next-day pick-up order – order before the 3 pm CST cut-off time and the order will be ready for next-day pick-up by 8 am.',
          'Pick-Up times are available ONLY Monday-Friday from 8 am – 4 pm.',
          'Pick-Up is limited locally in San Antonio & Corpus Christi stores.',
          'Please note the location, date, and time you wish to pick up your order in the Delivery Options and review your order before submitting it.',
        ]],
        ['note', '***Not all items are available at all stores. Please call to confirm availability.'],
        ['h3', 'Same-Day Local Delivery'],
        ['ul', [
          'This service is limited locally in San Antonio & Corpus Christi for a minimum $75 charge. The deadline for same-day courier service is 12 PM CST.',
          // TODO(client): the live page links "click here" to a price listing; the link URL wasn't in the copied text.
          'Prices may vary for surrounding areas. Please click here for a price listing according to your serviced area.',
          'Delivery services are available ONLY Monday-Friday from 12 pm – 3 pm. No weekend or holiday deliveries.',
          'Orders placed after 12 PM CST on a Friday will default to Monday delivery.',
          'Please note the location, date, and time you wish to receive your order in the Delivery Options and review your order before submitting it.',
        ]],
        ['note', '***Not all items are available at all stores. Please call to confirm availability.'],
        ['h3', 'Next-Day Local Delivery'],
        ['ul', [
          ['Local service is available in San Antonio, Corpus Christi, and surrounding areas. ', { a: 'Click here for a map of our delivery area.', href: 'https://www.google.com/maps/d/embed?mid=1Yg8I5H8Y8FVOfomQOYz0jL6DKAc&hl=en&ie=UTF8&msa=0&ll=30.54532572940828%2C-97.87210400000004&spn=2.276188%2C1.714669&output=embed&z=9' }],
          'Local delivery is free for orders over $150.',
          'There is a $75 delivery fee for local orders that do not meet the minimum requirement of $150 in San Antonio and Corpus Christi.',
          'Deadline for next-day delivery is 3:00 PM CST. We do not deliver on weekends or holidays.',
          'Note the order minimums for free delivery in the non-local areas are as follows: (1) San Antonio blue area minimum is $295 and the pink area is $400, and (2) Austin yellow and orange areas are $250.',
          'Please note the location, date, and time you wish to receive your order in the Delivery Options and review your order before submitting it.',
        ]],
        ['note', '***Not all items are available at all stores. Please call to confirm availability.'],
      ];

// Shipping Policy page: each subsection (h3 in the shared text) becomes a section.
const sections = [];
for (const b of shippingBlocks) {
  if (b[0] === 'h3') sections.push({ h: b[1], body: [] });
  else sections[sections.length - 1].body.push(b);
}

export default {
  out: 'shipping-policies.html',
  title: 'Shipping Policy',
  pageTitle: 'Shipping Policy | TAG-A-ROOM®',
  description: 'TAG-A-ROOM® shipping policy: nationwide shipping, customer pick-up in San Antonio and Corpus Christi, and same-day and next-day local delivery.',
  // TODO(client): confirm the date this policy was last updated.
  updated: 'October 7, 2026',
  lead: SHIPPING_HEADING,
  sections,
  related: [
    { t: 'Store Policies', href: 'policies.html' },
    { t: 'Return Policy', href: 'return-policies.html' },
  ],
};
