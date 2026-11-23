import { getJson } from '../api/client.js';
import { useJsonResource } from '../hooks/useJsonResource.js';
import { CapabilityCard, ResourceContent } from './CapabilityCard.js';

type Team = { _id?: string; name: string; mascot?: string; members: unknown[] };
type TeamsResponse = { teams: Team[] };

export default function Teams() {
  const state = useJsonResource<TeamsResponse>('/api/teams', getJson<TeamsResponse>);
  return (
    <CapabilityCard title="Equipes" description="Gerencie equipes e integrantes.">
      <ResourceContent state={state} isEmpty={(data) => data.teams.length === 0} emptyMessage="Nenhuma equipe cadastrada ainda.">
        {(data) => (
          <ul className="list-group">
            {data.teams.map((team, index) => (
              <li key={team._id ?? index} className="list-group-item">
                <strong>{team.name}</strong>
                {team.mascot ? <span> · Mascote: {team.mascot}</span> : null}
                <span> · {team.members.length} integrante(s)</span>
              </li>
            ))}
          </ul>
        )}
      </ResourceContent>
    </CapabilityCard>
  );
}
