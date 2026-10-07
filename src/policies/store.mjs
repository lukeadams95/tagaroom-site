// Store Policies (/policies). Privacy and Tax are copied word for word from the
// client's original policies page; Customer Service, Shipping, Customer Pickup and
// Returns are the client-approved text from the October 2026 meeting.
// Do not edit the wording without the client's approval.

import { shippingSection, pickupSection, shippingSummary } from './shipping.mjs';

export default {
  out: 'policies.html',
  title: 'Store Policies',
  pageTitle: 'Store Policies | TAG-A-ROOM®',
  description: 'TAG-A-ROOM® store policies: customer service, privacy, sales tax, shipping, customer pickup and returns.',
  updated: 'October 7, 2026',
  // The source's "About Us" section is replaced by a link to the About page.
  intro: { link: 'Learn more about TAG-A-ROOM →', href: 'about.html' },
  related: [
    { t: 'Shipping Policy', href: 'shipping-policies.html' },
    { t: 'Return Policy', href: 'return-policies.html' },
  ],
  sections: [
    {
      h: 'Customer Service',
      body: [
        ['p', 'We respond to all emails within one business day, excluding weekends and holidays. Phone support is available Monday–Friday, 9:00 am – 4:00 pm Central Time.'],
      ],
    },
    {
      h: 'Privacy Policy',
      body: [
        ['p', 'Tag-A-Room is committed to protecting your privacy. In order to best serve you, Tag-A-Room may need to gather some personal information from you including but not limited to: Your name, address, telephone number, email address, etc. Your personal information is stored in a secure location and is not accessible to the public. Tag-A-Room does not sell, rent release, or trade personal information to outside parties. Tag-A-Room reserves the right to disclose information, if necessary, to comply with legal investigations or proceedings. Tag-A-Room reserves the right to make necessary changes to its privacy policy at any time, and such changes will be displayed on any and all associated websites.'],
      ],
    },
    {
      h: 'TAX POLICY',
      body: [
        ['p', 'WE CHARGE SALES TAX IN THOSE STATES WHERE WE HAVE A PHYSICAL OR ECONOMIC NEXUS'],
      ],
    },
    { ...shippingSection, summary: shippingSummary },
    pickupSection,
    {
      h: 'Returns',
      body: [
        ['p', ['See our ', { a: 'Return Policy', href: 'return-policies.html' }, '.']],
      ],
    },
  ],
};
