// In-body internal links, applied to the rendered page body (copy unchanged).
// Each entry: [exact existing sentence, anchor text inside it, target page].
// The build fails if a sentence is missing or appears more than once, so a
// copy change in the design can't silently drop or misplace a link.
// Targets use the design's page paths; relocate()/cleanLinks() turn them
// into the site's clean relative URLs.
import { esc } from './lib/dc.mjs';

export const IN_BODY_LINKS = {
  // October 2026 internal-linking pass
  'blog/the-stress-free-move-why-color-coded-labels-are-a-game-changer-for-your-new-home.html': [
    ["There's a reason color-coded moving labels are recommended by professional movers.", 'moving labels', 'shop/moving-label-systems.html'],
    ['Color-coded moving labels simplify the process, reduce stress, and save you time and money.', 'Color-coded', 'shop/color-coding-labels.html'],
  ],
  'about.html': [
    ["The original color-coded moving and storage label system, created to answer moving's biggest question: \u201cWhere does it go?\u201d", 'label system', 'shop/moving-label-systems.html'],
    ['He created a color-coded label system that kept boxes and furniture organized, cut down on misplaced items and saved customers time and money.', 'color-coded label', 'shop/color-coding-labels.html'],
  ],
  'for/professional-movers.html': [
    ['Label systems for professional movers, straight from our store.', 'Label systems', 'shop/moving-label-systems.html'],
  ],
  'blog/moving-tip-label-strategically.html': [
    ['Now, think about the alternative: not using color-coded labels.', 'color-coded labels', 'shop/moving-label-systems.html'],
  ],
  'blog/complete-interstate-moving-checklist-2026.html': [
    ['Next, implementing the Tag-A-Room color-coding strategy can greatly reduce confusion during the move.', 'color-coding', 'shop/color-coding-labels.html'],
  ],
  'blog/simplify-your-home-downsizing-journey-with-tag-a-room-moving-labels.html': [
    ["Each color coded label corresponds to a specific room or category, so you'll always know exactly where your items belong.", 'color coded label', 'shop/color-coding-labels.html'],
  ],
  'blog/handling-with-care-the-art-of-protecting-fragile-items-during-your-move.html': [
    ['The idea of protecting fragile items might seem intuitive, but its impact on your move is substantial.', 'fragile', 'shop/alert-labels.html'],
  ],
  'blog/properly-pack-a-cardboard-box-for-moving-storage.html': [
    ["Add FRAGILE labels on boxes with delicate items to ensure they're handled with care.", 'FRAGILE labels', 'shop/alert-labels.html'],
  ],
};

export function applyInBodyLinks(out, body) {
  for (const [sentence, anchor, href] of IN_BODY_LINKS[out] || []) {
    const s = esc(sentence), a = esc(anchor);
    const n = body.split(s).length - 1;
    if (n !== 1) throw new Error(`In-body link: sentence found ${n} times in ${out}: ${sentence.slice(0, 80)}`);
    const i = s.indexOf(a);
    if (i < 0) throw new Error(`In-body link: anchor "${anchor}" not in sentence (${out})`);
    body = body.replace(s, s.slice(0, i) + `<a href="${href}">${a}</a>` + s.slice(i + a.length));
  }
  return body;
}
