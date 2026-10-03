import { UserRound } from 'lucide-react';
import { cn } from '@/lib/ui/cn';

type AvatarProps={src?:string|null;name?:string;size?:'sm'|'md'|'lg'|'xl';status?:'online'|'offline'|'busy'};
export function Avatar({src,name,size='md',status}:AvatarProps){const initials=(name||'U').trim().split(/\s+/).slice(0,2).map(v=>v[0]).join('').toUpperCase();return <span className={cn('mx-avatar',`mx-avatar-${size}`)} aria-label={name||'User'}>{src?<img src={src} alt=""/>:name?<span>{initials}</span>:<UserRound size={size==='sm'?14:17}/>} {status&&<i className={cn('mx-avatar-status',`is-${status}`)}/>}</span>;}
