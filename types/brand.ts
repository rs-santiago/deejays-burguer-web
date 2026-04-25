// types/brand.ts
export interface BrandConfig {
  name: string;
  surname: string;
  tagline: string;
  hero: {
    title: string;
    highlight: string;
    description: string;
    image: string;
  };
  about: {
    title: string;
    highlight: string;
    since: string;
    description: string;
    subText: string;
    features: string[];
  };
  contact: {
    whatsapp: string;
    whatsappDisplay: string;
    instagram: string;
    instaLink: string;
    location: string;
  };
  colors: {
    primary: string;
    primaryHover: string;
    bg: string;
  };
}