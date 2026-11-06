/* Default copy for the Home & About pages. Admins edit it under Admin → Pages; saved values override these. */
import type { AboutContent, HomeContent } from "@/types";

export const DEFAULT_HOME: HomeContent = {
  heroLabel: "ERA Interior Products",
  heroTitle: "Feel the nature with us",
  heroText: "Premium stone, wood, WPC, wallpaper and décor for beautiful homes, offices and outdoor spaces.",
  heroImage: "/images/cov.jpg",
  slides: [
    { image: "/images/about.jpg", title: "Premium materials for beautiful spaces", text: "Flooring, cladding, walls, ceilings and outdoor décor in one place.", href: "/about" },
    { image: "/images/ipe_s.jpg", title: "Decks that love the outdoors", text: "Natural IPE hardwood for pool decks and terraces.", href: "/products/ipe" },
    { image: "/images/wpc_s.jpg", title: "Wood warmth, zero fuss", text: "WPC flooring and cladding that resists water and termites.", href: "/products/wpc" },
    { image: "/images/stone_s.jpg", title: "Stone with character", text: "Natural stone for walls and floors, indoors and out.", href: "/products/stone" },
    { image: "/images/glass_s.jpg", title: "Colour that never fades", text: "Glass mosaic for pools, bathrooms and feature walls.", href: "/products/glass" },
    { image: "/images/engineered_s.jpg", title: "Warm floors, calm rooms", text: "Engineered and laminate wood floors for every room.", href: "/products/engineered" },
  ],
  aboutLabel: "About ERA Interior",
  aboutTitle: "Materials that make a space feel alive",
  aboutText:
    "ERA Interior brings premium materials, modern design and lasting quality together. We supply natural and engineered products for homes, offices, hotels, showrooms and outdoor areas.\n\nFrom natural stone and IPE decking to wallpaper, carpet and soffit panels, you get flooring, cladding, wall, ceiling and outdoor solutions from one trusted source.",
  aboutPoints: ["Premium quality", "Wide product range", "Modern designs", "Reliable supply"],
  aboutImage: "/images/about.jpg",
  aboutImage2: "/images/laminate_h.jpg",
  offerLabel: "What we offer",
  offerTitle: "Find the right finish for every corner",
  offerText: "Choose by the part of your space you are working on.",
  tiles: [
    { title: "Outdoor decking", text: "IPE hardwood for pools and terraces", href: "/products/ipe", image: "/images/ipe_s.jpg" },
    { title: "Cladding", text: "WPC panels for facades", href: "/products/wpc", image: "/images/wpc_s.jpg" },
    { title: "Natural stone", text: "Walls, floors and landscapes", href: "/products/stone", image: "/images/stone_s.jpg" },
    { title: "Walls", text: "Wallpaper in many designs", href: "/products/wallpaper", image: "/images/wallpaper_s.jpg" },
    { title: "Pools & bathrooms", text: "Glass mosaic in vivid colours", href: "/products/glass", image: "/images/glass_s.jpg" },
    { title: "Comfort floors", text: "Soft carpet for homes and offices", href: "/products/carpet", image: "/images/carpet_s.jpg" },
  ],
  whyLabel: "Why choose ERA",
  whyTitle: "Quality you can see and feel",
  why: [
    { title: "Premium quality", text: "Carefully selected products built to last in real homes and projects." },
    { title: "Wide range", text: "Stone, wood, WPC, carpet, glass mosaic, wallpaper, grass and more." },
    { title: "Modern designs", text: "Current colours, textures and patterns for contemporary interiors." },
    { title: "Reliable support", text: "Dependable supply and guidance from enquiry to delivery." },
    { title: "Indoor & outdoor", text: "Solutions for living rooms, offices, pool decks, terraces and gardens." },
  ],
  stepsLabel: "How it works",
  stepsTitle: "From idea to finished space",
  steps: [
    { title: "Tell us", text: "Share your space, style and budget." },
    { title: "Choose", text: "We suggest suitable materials and samples." },
    { title: "Quote", text: "Get clear pricing for your project." },
    { title: "Delivery", text: "Supply and support until you are happy." },
  ],
  ctaTitle: "Let's create beautiful spaces together",
  ctaText: "Tell us about your project and we will suggest the right materials.",
  ctaImage: "/images/cov.jpg",
};

export const DEFAULT_ABOUT: AboutContent = {
  bannerTitle: "About Us",
  bannerSubtitle: "Premium materials for beautiful spaces",
  label: "Who we are",
  title: "Trusted supplier of interior and exterior products",
  text:
    "At ERA Interior, we bring together premium materials, modern design and lasting quality to create beautiful spaces.\n\nWe offer a wide range of natural and engineered materials for homes, offices, commercial spaces and outdoor areas.",
  points: ["Premium quality products", "Wide product range", "Modern & trendy designs", "Reliable supply & support", "Indoor & outdoor solutions"],
  image: "/images/about.jpg",
  image2: "/images/engineered_h.jpg",
};
