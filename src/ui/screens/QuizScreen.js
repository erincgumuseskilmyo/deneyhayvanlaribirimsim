import { el, kv } from '../dom.js';
import { QUIZ_LIST } from '../../data/quizzes.js';
import { getKnowledge, SOURCE_LABELS, BOOK } from '../../data/knowledge.js';

/**
 * Bölüm sonu quiz: 5-10 soru, başarı puanı, yanlış konular ve tekrar önerisi.
 */
export function quizScreen(state, systems, bus, modal) {
  const wrap = el('div');
  wrap.append(el('p', { class: 'hint', text:
    'Bölüm quizleri oyun ilerledikçe açılır. Yanlış yanıtlanan konular için tekrar önerisi verilir.' }));

  for (const quiz of QUIZ_LIST) {
    const unlocked = state.day >= quiz.unlockAtDay;
    const previous = state.quizResults.filter((r) => r.quizId === quiz.id);
    const best = previous.length ? Math.max(...previous.map((r) => r.score)) : null;

    wrap.append(el('div', { class: 'list-item' }, [
      el('h4', { text: quiz.title }),
      el('div', {}, [
        el('span', { class: 'tag', text: `${quiz.questions.length} soru` }),
        unlocked
          ? el('span', { class: 'tag good', text: 'Açık' })
          : el('span', { class: 'tag warn', text: `Gün ${quiz.unlockAtDay}'de açılır` }),
        best !== null ? el('span', { class: 'tag', text: `En iyi: %${best}` }) : null
      ]),
      unlocked
        ? el('button', { class: 'primary', onClick: () => runQuiz(quiz, state, bus, modal) }, 'Quizi başlat')
        : null
    ]));
  }

  if (state.quizResults.length) {
    wrap.append(el('h3', { text: 'Geçmiş Sonuçlar' }));
    for (const r of [...state.quizResults].reverse().slice(0, 8)) {
      wrap.append(kv(`${r.title} (Gün ${r.day})`, `%${r.score}`));
    }
  }

  return wrap;
}

function runQuiz(quiz, state, bus, modal) {
  let index = 0;
  const answers = [];

  const showQuestion = () => {
    const q = quiz.questions[index];
    const body = el('div');
    body.append(el('p', { text: `Soru ${index + 1} / ${quiz.questions.length}` }));
    body.append(el('p', { html: `<strong>${q.q}</strong>` }));

    const optionButtons = [];
    q.options.forEach((opt, i) => {
      const btn = el('button', {
        class: 'quiz-option',
        onClick: () => {
          if (btn.dataset.locked) return;
          optionButtons.forEach((b) => { b.dataset.locked = '1'; });
          const correct = i === q.answer;
          btn.classList.add(correct ? 'correct' : 'wrong');
          if (!correct) optionButtons[q.answer].classList.add('correct');
          answers.push({ topic: q.topic, correct, question: q.q, ref: q.ref });
          if (!correct && q.ref) {
            body.append(el('p', { class: 'hint', text: `Kaynak: ${q.ref}` }));
          }
          setTimeout(() => {
            index += 1;
            modal.close();
            setTimeout(() => (index < quiz.questions.length ? showQuestion() : showResult()), 60);
          }, 850);
        }
      }, opt);
      optionButtons.push(btn);
      body.append(btn);
    });

    modal.show({ title: quiz.title, body, actions: [] });
  };

  const showResult = () => {
    const correct = answers.filter((a) => a.correct).length;
    const score = Math.round((correct / quiz.questions.length) * 100);
    const wrongTopics = [...new Set(answers.filter((a) => !a.correct).map((a) => a.topic))];

    state.quizResults.push({ quizId: quiz.id, title: quiz.title, score, day: state.day, wrongTopics });
    // Quiz başarısı bilimsel itibarı hafifçe etkiler (eğitim kalitesi göstergesi)
    state.adjust('scientificReputation', score >= 80 ? 2 : score >= 60 ? 0 : -1);

    const body = el('div');
    body.append(el('p', { html: `<strong>Başarı puanı: %${score}</strong> (${correct}/${quiz.questions.length})` }));

    if (wrongTopics.length) {
      body.append(el('h3', { text: 'Tekrar Önerilen Konular' }));
      for (const t of wrongTopics) {
        const k = getKnowledge(t);
        if (!k) continue;
        body.append(el('div', { class: 'knowledge' }, [
          el('strong', { text: k.title }),
          el('p', { text: k.text }),
          el('span', { class: 'src', text: k.ref
            ? `Kaynak: ${BOOK.title} — ${k.ref}`
            : SOURCE_LABELS[k.source] })
        ]));
      }
    } else {
      body.append(el('p', { text: 'Tüm soruları doğru yanıtladınız.' }));
    }

    modal.show({
      title: `${quiz.title} — Sonuç`, body,
      actions: [{ label: 'Kapat', primary: true, onClick: () => bus.emit('ui:openTab', 'quiz') }]
    });
  };

  modal.close();
  setTimeout(showQuestion, 60);
}
