import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';

interface BreadcrumbNavProps {
  province: { name: string; slug: string };
  city: { name: string; slug: string };
  rangeName: string;
}

export function BreadcrumbNav({ province, city, rangeName }: BreadcrumbNavProps) {
  const breadcrumbs = [
    { label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: province.name, href: `/${province.slug}` },
    { label: city.name, href: `/${province.slug}/${city.slug}` },
    { label: rangeName, href: null },
  ];

  return (
    <nav aria-label="Breadcrumb" className="bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center gap-1 py-4 text-sm overflow-x-auto">
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="flex items-center flex-shrink-0">
              {index > 0 && <ChevronRight className="w-4 h-4 text-stone-400 mx-2 flex-shrink-0" />}

              {crumb.href ? (
                <Link href={crumb.href} className="flex items-center gap-1.5 text-stone-600 hover:text-emerald-600 transition-colors whitespace-nowrap">
                  {crumb.icon}
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-stone-800 font-medium whitespace-nowrap truncate max-w-[200px]">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}