import { useEffect, useState } from 'react';
import { MessageCircleQuestion, Send, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/stores/useAppStore';
import { createQuestion, listAnswers, listQuestions } from '@/features/qa/qa.service';
import type { ProductAnswer, ProductQuestion } from '@/features/qa/qa.types';

export function ProductQuestions({ productId }: { productId: string }) {
  const fa = useAppStore((s) => s.locale === 'fa');
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, ProductAnswer[]>>({});
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void listQuestions(productId)
      .then(setQuestions)
      .catch(() => undefined);
  }, [productId]);
  const ask = async () => {
    if (value.trim().length < 8) return;
    setBusy(true);
    try {
      const q = await createQuestion(productId, value);
      setQuestions((x) => [q, ...x]);
      setValue('');
    } catch {
    } finally {
      setBusy(false);
    }
  };
  const expand = async (id: string) => {
    if (answers[id]) return;
    const rows = await listAnswers(id);
    setAnswers((x) => ({ ...x, [id]: rows }));
  };
  return (
    <div className="mx-qa">
      <Card className="mx-qa-form">
        <div className="mx-kicker">QUESTIONS & ANSWERS</div>
        <h3>{fa ? 'سؤال خودت را بپرس' : 'Ask a question'}</h3>
        <textarea
          className="mx-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            fa ? 'مثلاً درباره گارانتی، ارسال یا مشخصات…' : 'Ask about warranty, shipping, or specifications…'
          }
        />
        <Button loading={busy} onClick={() => void ask()} icon={<Send size={15} />}>
          {fa ? 'ارسال سؤال' : 'Ask question'}
        </Button>
      </Card>
      <div className="mx-qa-list">
        {questions.map((q) => (
          <Card key={q.id} className="mx-qa-card">
            <button className="mx-qa-question" onClick={() => void expand(q.id)}>
              <span>
                <MessageCircleQuestion size={17} />
                <strong>{q.question}</strong>
              </span>
              <Badge tone={q.answerCount ? 'success' : 'neutral'}>
                {q.answerCount} {fa ? 'پاسخ' : 'answers'}
              </Badge>
            </button>
            {answers[q.id] && (
              <div className="mx-qa-answers">
                {answers[q.id].map((a) => (
                  <div className="mx-qa-answer" key={a.id}>
                    <div className="mx-qa-answer-head">
                      <strong>{a.userName || (fa ? 'پاسخ‌دهنده' : 'Responder')}</strong>
                      {a.isOfficial && (
                        <Badge tone="primary" dot>
                          <ShieldCheck size={10} />
                          {fa ? 'رسمی' : 'Official'}
                        </Badge>
                      )}
                    </div>
                    <p>{a.body}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
