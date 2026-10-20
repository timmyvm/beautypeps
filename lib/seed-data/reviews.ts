export type SeedReview = {
  productSlug: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  skinType?: string;
  daysAgo: number;
  verified?: boolean;
  status?: "pending" | "approved" | "rejected";
  adminReply?: string;
};

/* Author names that match a demo customer ("First L.") are linked to that account. */
export const seedReviews: SeedReview[] = [
  // GHK-Cu serum
  { productSlug: "ghk-cu-copper-peptide-serum", authorName: "Ava N.", rating: 5, title: "My skin feels so much calmer", body: "Eight weeks in, using it most nights. The biggest change is how settled my skin feels — less redness around my nose and my cheeks look smoother in daylight. The blue colour freaked me out at first but it disappears as it soaks in.", skinType: "Combination", daysAgo: 12 },
  { productSlug: "ghk-cu-copper-peptide-serum", authorName: "Olivia H.", rating: 5, title: "Worth the hype", body: "I've tried cheaper copper peptides that were basically green water. This one is a proper deep blue and absorbs in seconds. I alternate it with retinol and my skin texture is the best it's been in years.", skinType: "Normal", daysAgo: 28 },
  { productSlug: "ghk-cu-copper-peptide-serum", authorName: "Grace C.", rating: 4, title: "Subtle but real", body: "Don't expect overnight miracles. After about six weeks my neck looks a bit firmer and my moisturiser goes on smoother. Docked one star because the dropper delivers more than I need.", skinType: "Dry", daysAgo: 35 },
  { productSlug: "ghk-cu-copper-peptide-serum", authorName: "Mia P.", rating: 5, title: "Great after my peel", body: "Used this in the week after a light chemical peel (once my skin had settled) and it felt so soothing. Love that the ingredient list is short.", skinType: "Sensitive", daysAgo: 44 },
  { productSlug: "ghk-cu-copper-peptide-serum", authorName: "Emily O.", rating: 3, title: "Nice, still deciding", body: "Lovely texture and no irritation at all. A month in I can't say I see a dramatic difference yet, but I'll finish the bottle before I decide.", skinType: "Oily", daysAgo: 9, status: "pending" },

  // Matrixyl 3000
  { productSlug: "matrixyl-3000-serum", authorName: "Charlotte K.", rating: 5, title: "Holy grail under makeup", body: "Silky, never pills, and my foundation sits better over it. The fine lines under my eyes look softer after two months of morning and night use.", skinType: "Combination", daysAgo: 19 },
  { productSlug: "matrixyl-3000-serum", authorName: "Sophie M.", rating: 4, title: "Good everyday peptide", body: "Easy to fit into any routine and doesn't clash with my vitamin C. Results are gradual — exactly as the description says.", skinType: "Normal", daysAgo: 52 },
  { productSlug: "matrixyl-3000-serum", authorName: "Priya S.", rating: 5, title: "Gentle enough for my sensitive skin", body: "I react to almost everything with fragrance. This has been completely fine and my forehead lines look shallower in photos.", skinType: "Sensitive", daysAgo: 23 },

  // Argireline
  { productSlug: "argireline-10-serum", authorName: "Isla R.", rating: 5, title: "My 11s are softer", body: "I use this between injectable appointments and I've been able to stretch them out a little. The frown lines between my brows look noticeably softer after six weeks.", skinType: "Normal", daysAgo: 15 },
  { productSlug: "argireline-10-serum", authorName: "Ruby S.", rating: 4, title: "Good on crow's-feet", body: "Fast-absorbing, no sting around the eyes. I think it's helping with my crow's-feet. Would love a pump instead of a dropper.", skinType: "Dry", daysAgo: 31 },
  { productSlug: "argireline-10-serum", authorName: "Hannah L.", rating: 5, title: "Third bottle", body: "On my third bottle now. It's become a non-negotiable in my morning routine. Forehead lines look smoother especially when I'm tired.", skinType: "Combination", daysAgo: 6 },
  { productSlug: "argireline-10-serum", authorName: "Zara H.", rating: 3, title: "Fine, not life-changing", body: "Nice serum, no issues, but I expected more for the forehead. Might work better paired with SNAP-8 like some people suggest.", skinType: "Oily", daysAgo: 40 },

  // SNAP-8
  { productSlug: "snap-8-serum", authorName: "Lily N.", rating: 5, title: "Better than Argireline for me", body: "I've used Argireline for a year and switched to this. The lines across my forehead look softer than they did on Argireline alone. Now I layer both.", skinType: "Normal", daysAgo: 18 },
  { productSlug: "snap-8-serum", authorName: "Freya C.", rating: 4, title: "Lightweight and effective", body: "Feels like nothing on the skin. Nice subtle smoothing around my eyes after about a month.", skinType: "Dry", daysAgo: 4, status: "pending" },

  // Multi-peptide
  { productSlug: "multi-peptide-complex", authorName: "Amelia W.", rating: 5, title: "Replaced three serums", body: "I was using three different peptide serums and this replaced all of them. The champagne colour is pretty and it leaves a soft, almost blurred finish. My skin looks plumper by the end of the day.", skinType: "Mature", daysAgo: 11 },
  { productSlug: "multi-peptide-complex", authorName: "Chloe A.", rating: 5, title: "The one I'd save in a fire", body: "Expensive but the 50 mL lasts nearly three months. Skin looks firmer and bouncier. Works beautifully with my vitamin C in the morning.", skinType: "Combination", daysAgo: 26 },
  { productSlug: "multi-peptide-complex", authorName: "Imogen T.", rating: 4, title: "Lovely texture", body: "Slightly richer than I expected, which my dry skin loves. Fine lines around my mouth look less obvious. Took about 8 weeks to really notice.", skinType: "Dry", daysAgo: 47 },
  { productSlug: "multi-peptide-complex", authorName: "Maya W.", rating: 5, title: "Minimalist's dream", body: "Cleanser, this, SPF. That's my routine now and my skin has never looked better.", skinType: "Normal", daysAgo: 8 },

  // Leuphasyl + Syn-Ake
  { productSlug: "leuphasyl-syn-ake-serum", authorName: "Sienna R.", rating: 4, title: "Interesting combo", body: "I like that it targets lines differently from Argireline. I use it in the evening and Argireline in the morning. Smoother forehead after five weeks.", skinType: "Normal", daysAgo: 14 },

  // Nonapeptide
  { productSlug: "nonapeptide-brightening-serum", authorName: "Leah K.", rating: 5, title: "Post-acne marks fading", body: "My red-brown marks from old breakouts are fading faster than they used to. The milky texture is really soothing. Using it with SPF religiously.", skinType: "Oily", daysAgo: 10 },
  { productSlug: "nonapeptide-brightening-serum", authorName: "Aisha R.", rating: 4, title: "Brighter overall", body: "My skin looks more even and less dull. Hard to tell what's this vs. being diligent with sunscreen, but I'm repurchasing.", skinType: "Combination", daysAgo: 33 },

  // Eye gel
  { productSlug: "eye-peptide-gel", authorName: "Ava N.", rating: 5, title: "Fridge-cold every morning", body: "I keep it in the fridge and it's the nicest part of my morning. Puffiness goes down within minutes and concealer sits so much better on top.", skinType: "Combination", daysAgo: 3 },
  { productSlug: "eye-peptide-gel", authorName: "Chloe A.", rating: 5, title: "Puffiness gone", body: "I wake up very puffy and this genuinely helps. The airless pump is perfect — half a pump does both eyes.", skinType: "Normal", daysAgo: 20 },
  { productSlug: "eye-peptide-gel", authorName: "Ella F.", rating: 4, title: "Great for puffiness, less for circles", body: "Brilliant for morning puffiness. My dark circles are genetic so I didn't expect much there, and the description is honest about that.", skinType: "Sensitive", daysAgo: 38 },
  { productSlug: "eye-peptide-gel", authorName: "Matilda B.", rating: 5, title: "Gentle around my eyes", body: "I have very sensitive eyes and this doesn't make them water at all. Lovely cooling texture.", skinType: "Sensitive", daysAgo: 5, status: "pending" },

  // Lip balm
  { productSlug: "lip-peptide-plumping-balm", authorName: "Willow J.", rating: 5, title: "No sting plumper!", body: "Finally a plumping balm that doesn't burn. The rose tint is so flattering and my lips look smoother and a touch fuller after a few weeks.", skinType: "Dry", daysAgo: 16 },
  { productSlug: "lip-peptide-plumping-balm", authorName: "Harper N.", rating: 4, title: "Cushiony and glossy", body: "Not sticky at all. I reapply it all day. Would love an untinted version too.", skinType: "Normal", daysAgo: 29 },
  { productSlug: "lip-peptide-plumping-balm", authorName: "Jade T.", rating: 3, title: "Nice balm", body: "Feels nice and looks pretty but I haven't noticed much plumping yet.", skinType: "Normal", daysAgo: 45 },

  // Scalp serum
  { productSlug: "scalp-peptide-serum", authorName: "Grace C.", rating: 4, title: "Less shedding in the shower", body: "Three months in. I'm noticing less hair in the drain and some baby hairs along my part. Doesn't make my roots greasy, which was my biggest worry.", skinType: "Normal", daysAgo: 22 },
  { productSlug: "scalp-peptide-serum", authorName: "Olivia H.", rating: 5, title: "Postpartum saviour", body: "Started this a few months after having my daughter. My hairline is filling back in — I know some of that is natural regrowth but this has been part of my routine the whole time.", skinType: "Normal", daysAgo: 49 },

  // Night cream
  { productSlug: "peptide-night-cream", authorName: "Ava N.", rating: 5, title: "Perfect over retinol", body: "I use it after tretinoin and it stops all the flaking. Skin feels comfortable and bouncy in the morning — not greasy at all.", skinType: "Combination", daysAgo: 30 },
  { productSlug: "peptide-night-cream", authorName: "Emily O.", rating: 4, title: "Rich but absorbs", body: "Whipped texture that melts in. A little goes a long way. My dry patches have completely gone.", skinType: "Dry", daysAgo: 25 },
  { productSlug: "peptide-night-cream", authorName: "Sophie M.", rating: 5, title: "Winter essential", body: "Tassie winters destroy my skin barrier. This cream has been the fix. No fragrance, which I appreciate.", skinType: "Dry", daysAgo: 58 },

  // Pure actives
  { productSlug: "ghk-cu-pure-powder", authorName: "Priya S.", rating: 5, title: "Excellent quality powder", body: "Beautiful deep blue, dissolved instantly in distilled water. The formulation notes on pH were genuinely helpful — my first batch at pH 6 stayed perfectly blue.", skinType: "Normal", daysAgo: 17 },
  { productSlug: "argireline-pure-powder", authorName: "Zara H.", rating: 4, title: "Great for DIY", body: "Made a stock solution as suggested and it's so much easier to dose. COA came with the vial. Would love a 5 g size.", daysAgo: 36 },
  { productSlug: "matrixyl-pure-powder", authorName: "Freya C.", rating: 4, title: "Tricky but worth it", body: "Took me two tries to dissolve properly — the co-solvent tip is essential. Lovely quality once you get it right.", daysAgo: 41 },

  // Kits
  { productSlug: "copper-ritual-kit", authorName: "Matilda B.", rating: 5, title: "Gorgeous gift", body: "Bought this for my mum's birthday and the box is stunning. She's obsessed with the eye gel and the night cream.", daysAgo: 13, adminReply: "Thank you so much, Matilda — we're thrilled your mum is enjoying it! — The Beauty Peps team" },
  { productSlug: "copper-ritual-kit", authorName: "Charlotte K.", rating: 5, title: "Best value", body: "Saves a good chunk on buying separately and the routine card is actually useful. My whole evening routine sorted.", skinType: "Combination", daysAgo: 37 },
  { productSlug: "expression-line-duo", authorName: "Isla R.", rating: 5, title: "The combo works", body: "Using both together has made a bigger difference to my forehead than either alone. Layers without any pilling.", skinType: "Normal", daysAgo: 21 },
  { productSlug: "peptide-discovery-set", authorName: "Mia P.", rating: 5, title: "Perfect for a peptide newbie", body: "I had no idea where to start. After trying all five I've gone full-size on the Multi-Peptide and GHK-Cu. Love the little guide card.", skinType: "Sensitive", daysAgo: 7 },
  { productSlug: "peptide-discovery-set", authorName: "Jade T.", rating: 4, title: "Fun to try", body: "Great way to test. The minis are a decent size — I got about three weeks out of each.", skinType: "Normal", daysAgo: 2, status: "pending" },

  // Rejected (spam-like / off-topic)
  { productSlug: "argireline-10-serum", authorName: "Promo Bot", rating: 1, title: "Cheap followers", body: "Visit my profile for cheap followers and likes!!!", daysAgo: 3, verified: false, status: "rejected" },
];
