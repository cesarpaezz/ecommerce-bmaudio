import Image from 'next/image';

interface LogoProps {
  className?: string;
  height?: number;
}

export function Logo({ className = "", height = 48 }: LogoProps) {
  return (
    <Image 
      src="/logo.png"
      alt="Dominus Audio"
      width={Math.round(height * 1.8)}
      height={height}
      className={className}
      priority
    />
  );
}
