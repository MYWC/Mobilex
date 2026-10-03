import { SkipLink } from './SkipLink';
import { RouteAnnouncer } from './RouteAnnouncer';
import { OfflineBanner } from './OfflineBanner';
import { InstallPrompt } from './InstallPrompt';
import { UpdatePrompt } from './UpdatePrompt';
import { NavigationEffects } from './NavigationEffects';
import { CommandPalette } from './CommandPalette';
import { usePlatformEffects } from '@/hooks/usePlatformEffects';

export function PlatformLayer() {
  usePlatformEffects();
  return <><SkipLink/><RouteAnnouncer/><OfflineBanner/><InstallPrompt/><UpdatePrompt/><NavigationEffects/><CommandPalette/></>;
}
