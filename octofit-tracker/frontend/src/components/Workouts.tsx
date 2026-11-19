import { useState } from 'react';
import { useJsonResource } from '../hooks/useJsonResource.js';
import { CapabilityCard, ResourceContent } from './CapabilityCard.js';

type Suggestion = { _id?: string; title: string; focus: string; minutes: number; difficulty: string; reason: string };
type SuggestionsResponse = { suggestions: Suggestion[] };

const people = [
  { email: 'mona@example.com', name: 'Mona' },
  { email: 'hubot@example.com', name: 'Hubot' },
];

export default function Workouts() {
  const [email, setEmail] = useState(people[0].email);
  const state = useJsonResource<SuggestionsResponse>(`/api/workouts/suggestions/${encodeURIComponent(email)}`);
  return (
    <CapabilityCard title="Sugestões de treino" description="Receba recomendações de treino com base nos seus padrões de atividade.">
      <div className="mb-3">
        <label htmlFor="pessoa-sugestoes" className="form-label">Pessoa</label>
        <select id="pessoa-sugestoes" className="form-select w-auto" value={email} onChange={(event) => setEmail(event.target.value)}>
          {people.map((person) => <option key={person.email} value={person.email}>{person.name}</option>)}
        </select>
      </div>
      <ResourceContent state={state} isEmpty={(data) => data.suggestions.length === 0} emptyMessage="Nenhuma sugestão de treino disponível no momento.">
        {(data) => (
          <ul className="list-unstyled d-grid gap-3">
            {data.suggestions.map((suggestion, index) => (
              <li key={suggestion._id ?? index} className="border rounded p-3">
                <h3 className="h5">{suggestion.title}</h3>
                <p className="mb-1">{suggestion.minutes} min · Dificuldade: {suggestion.difficulty}</p>
                <p className="mb-0 text-muted">{suggestion.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </ResourceContent>
    </CapabilityCard>
  );
}
