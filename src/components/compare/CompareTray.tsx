import { Link } from 'react-router-dom';
import { ArrowUpLeft, GitCompareArrows, X } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useCompareStore } from '@/features/compare/compare.store';
export function CompareTray(){const fa=useAppStore(s=>s.locale==='fa');const ids=useCompareStore(s=>s.ids);const remove=useCompareStore(s=>s.remove);if(!ids.length)return null;return <div className="mx-compare-tray"><div className="mx-shell"><div className="mx-compare-tray-inner"><div className="flex items-center gap-2"><GitCompareArrows size={17}/><strong>{ids.length}/4</strong><span>{fa?'مقایسه':'comparison'}</span></div><div className="mx-compare-chips">{ids.map(id=><button key={id} onClick={()=>remove(id)}>{id.slice(0,8)}<X size={12}/></button>)}</div><Link to="/compare" className="mx-button mx-button-primary mx-button-sm">{fa?'مقایسه کن':'Compare'} <ArrowUpLeft size={13}/></Link></div></div></div>}
