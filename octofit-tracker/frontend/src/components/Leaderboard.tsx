import { getJson } from '../api/client.js';
import { useJsonResource } from '../hooks/useJsonResource.js';
import { CapabilityCard, ResourceContent } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  const state = useJsonResource<LeaderboardResponse>('/api/leaderboard', getJson<LeaderboardResponse>);
  return (
    <CapabilityCard title="Placar" description="Compare a pontuação total das equipes.">
      <ResourceContent state={state} isEmpty={(data) => data.leaderboard.length === 0} emptyMessage="Sem pontuação registrada no placar.">
        {(data) => (
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Posição</th>
                <th scope="col">Equipe</th>
                <th scope="col">Pontos</th>
              </tr>
            </thead>
            <tbody>
              {data.leaderboard.map((entry) => (
                <tr key={entry.teamName}>
                  <td>{entry.rank}</td>
                  <td>{entry.teamName}</td>
                  <td>{entry.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ResourceContent>
    </CapabilityCard>
  );
}
