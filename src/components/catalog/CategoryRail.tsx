import { ArrowUpLeft, Smartphone, Headphones, Watch, Cable, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CategorySummary } from '@/types/catalog';
const icons=[Smartphone,Headphones,Watch,Cable,BookOpen];
export function CategoryRail({categories}:{categories:CategorySummary[]}){const list=categories.slice(0,8);if(!list.length)return null;return <div className="mx-category-rail">{list.map((c,i)=>{const Icon=icons[i%icons.length];return <Link key={c.id} to={`/products?category=${encodeURIComponent(c.id)}`} className="mx-category-tile"><span className="mx-category-icon"><Icon size={19}/></span><span><strong>{c.nameFa||c.nameEn}</strong><small>{c.slug||c.id}</small></span><ArrowUpLeft size={14}/></Link>})}</div>}
