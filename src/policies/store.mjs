// Store Policies (/policies). Text copied word for word from
// https://tagaroom.com/policies/ as provided by the client (Oct 2026).
// Formatting only: empty list items removed, nested lists flattened.
// Do not edit the wording without the client's approval.

import { SHIPPING_HEADING, shippingSummary, shippingBlocks } from './shipping.mjs';

export default {
  out: 'policies.html',
  title: 'Store Policies',
  pageTitle: 'Store Policies | TAG-A-ROOM®',
  description: 'TAG-A-ROOM® store policies: customer service, privacy, sales tax, and shipping, customer pick-up and local delivery.',
  // TODO(client): confirm the date these policies were last updated.
  updated: 'October 7, 2026',
  // The source's "About Us" section is replaced by a link to the About page.
  intro: { link: 'Learn more about TAG-A-ROOM →', href: 'about.html' },
  related: [
    { t: 'Shipping Policy', href: 'shipping-policies.html' },
    { t: 'Return Policy', href: 'return-policies.html' },
  ],
  sections: [
    {
      h: 'Customer Service Policy',
      body: [
        ['p', 'Tag-A-Room is committed to providing our customers with extraordinary products, value, service. We strive to provide a seamless, satisfying shopping experience for all our customers by, listening to their needs, evaluating the feedback, and ongoing process development. You can contact our dedicated Tag-A-Room support team at admin@tagaroom.com for an email response with 1 business day. If you need to reach us by phone, please contact us during customer service hours: Mon – Fri 9:00 am – 5:00 pm Central Standard Time.'],
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
    {
      h: SHIPPING_HEADING,
      summary: shippingSummary,
      body: shippingBlocks,
    },
  ],
};
