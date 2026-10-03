import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { logger } from '@/lib/logger/logger';
import { Button } from '@/components/ui/Button';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; message: string; errorId: string; }

function createErrorId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '', errorId: '' };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : 'Unknown application error', errorId: createErrorId() };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    logger.error('Unhandled render error', error, { componentStack: info.componentStack?.slice(0, 2000) });
  }

  reset = (): void => this.setState({ hasError: false, message: '', errorId: '' });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="error-screen">
        <section className="error-card glass-panel">
          <div className="error-icon"><AlertTriangle size={28} /></div>
          <span className="eyebrow">MOBILEX 2.0</span>
          <h1>یک خطای پیش‌بینی‌نشده رخ داد</h1>
          <p>رابط کاربری در یک بخش متوقف شد. با تلاش دوباره، همین مسیر را دوباره اجرا کن.</p>
          <div className="error-id">Error ID: <code>{this.state.errorId}</code></div>
          {import.meta.env.DEV && (
            <details><summary>جزئیات فنی (development)</summary><code>{this.state.message}</code></details>
          )}
          <Button icon={<RotateCcw size={17} />} onClick={this.reset}>تلاش مجدد</Button>
        </section>
      </main>
    );
  }
}
