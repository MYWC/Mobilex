import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/ui/cn';

type AccordionItem={id:string;title:string;content:ReactNode;defaultOpen?:boolean};
type AccordionProps={items:AccordionItem[];single?:boolean};
export function Accordion({items,single=false}:AccordionProps){const first=items.find(i=>i.defaultOpen)?.id??null;const [open,setOpen]=useState<string|null>(first);const toggle=(id:string)=>setOpen(v=>v===id?null:(single?id:v));return <div className="mx-accordion">{items.map(item=>{const active=open?.split('|').includes(item.id);return <div key={item.id} className={cn('mx-accordion-item',active&&'is-open')}><button type="button" className="mx-accordion-trigger" onClick={()=>{if(single)toggle(item.id);else setOpen(v=>v?.split('|').filter(x=>x!==item.id).concat(v?.includes(item.id)?[]:[item.id]).filter(Boolean).join('|')??item.id)}} aria-expanded={active}><span>{item.title}</span><ChevronDown size={15}/></button>{active&&<div className="mx-accordion-content">{item.content}</div>}</div>})}</div>;}
