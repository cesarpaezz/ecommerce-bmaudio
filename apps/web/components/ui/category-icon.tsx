import { 
  Speaker, 
  Headphones, 
  Mic, 
  Volume2, 
  SlidersHorizontal, 
  Cable, 
  Lightbulb,
  Music,
  Radio,
  MonitorSpeaker,
  LucideIcon
} from 'lucide-react';

const categoryIcons: Record<string, LucideIcon> = {
  'caixas-de-som': Speaker,
  'fones-de-ouvido': Headphones,
  'microfones': Mic,
  'amplificadores': Volume2,
  'mesas-de-som': SlidersHorizontal,
  'cabos-conectores': Cable,
  'cabos-e-conectores': Cable,
  'iluminacao': Lightbulb,
  'instrumentos': Music,
  'receivers': Radio,
  'monitores': MonitorSpeaker,
};

interface CategoryIconProps {
  slug: string;
  className?: string;
}

export function CategoryIcon({ slug, className = "h-10 w-10" }: CategoryIconProps) {
  const Icon = categoryIcons[slug] || Speaker;
  return <Icon className={className} />;
}
