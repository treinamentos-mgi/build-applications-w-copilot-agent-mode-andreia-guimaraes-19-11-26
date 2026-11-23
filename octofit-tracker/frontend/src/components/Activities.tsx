import { getJson } from '../api/client.js';
import { useJsonResource } from '../hooks/useJsonResource.js';
import { CapabilityCard, ResourceContent } from './CapabilityCard.js';

type Activity = { _id?: string; type: string; minutes: number; points: number };
type ActivitiesResponse = { activities: Activity[] };

const activityLabels: Record<string, string> = {
  run: 'Corrida',
  cycle: 'Ciclismo',
  walk: 'Caminhada',
  swim: 'Natação',
  strength: 'Força',
};

export default function Activities() {
  const state = useJsonResource<ActivitiesResponse>('/api/activities', getJson<ActivitiesResponse>);
  return (
    <CapabilityCard title="Atividades" description="Acompanhe os minutos de atividade e os pontos das pessoas participantes.">
      <ResourceContent state={state} isEmpty={(data) => data.activities.length === 0} emptyMessage="Nenhuma atividade registrada ainda.">
        {(data) => (
          <ul className="list-group">
            {data.activities.map((activity, index) => (
              <li key={activity._id ?? index} className="list-group-item">
                {activityLabels[activity.type] ?? activity.type} · {activity.minutes} min · {activity.points} pontos
              </li>
            ))}
          </ul>
        )}
      </ResourceContent>
    </CapabilityCard>
  );
}
