import { Types } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

const objectIdPattern = /^[a-f\d]{24}$/i;
const focusByActivityType: Record<string, string> = {
  run: 'endurance',
  cycle: 'endurance',
  walk: 'endurance',
  swim: 'endurance',
  strength: 'strength',
};

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && objectIdPattern.test(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const body = (input ?? {}) as Record<string, unknown>;
  const { userId, teamId, type, minutes } = body;
  if (!isObjectId(userId)) throw httpError(400, 'Informe um userId válido');
  if (!isObjectId(teamId)) throw httpError(400, 'Informe um teamId válido');
  if (typeof type !== 'string' || type.trim() === '') throw httpError(400, 'Informe o tipo da atividade');
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) throw httpError(400, 'Informe minutos maiores que zero');

  const [user, team] = await Promise.all([User.exists({ _id: userId }), Team.exists({ _id: teamId })]);
  if (!user || !team) throw httpError(404, 'Pessoa ou equipe não encontrada');

  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const body = (input ?? {}) as Record<string, unknown>;
  const { name, mascot, members = [] } = body;
  if (typeof name !== 'string' || name.trim() === '') throw httpError(400, 'Informe o nome da equipe');
  if (typeof mascot !== 'string' || mascot.trim() === '') throw httpError(400, 'Informe o mascote da equipe');
  if (!Array.isArray(members) || !members.every(isObjectId)) throw httpError(400, 'Os integrantes devem ser IDs válidos');

  const uniqueMembers = [...new Set(members)];
  const existingMembers = await User.countDocuments({ _id: { $in: uniqueMembers } });
  if (existingMembers !== uniqueMembers.length) throw httpError(404, 'Algum integrante não foi encontrado');

  const team = await Team.create({ name: name.trim(), mascot: mascot.trim(), members: uniqueMembers });
  return team.toObject();
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate<{ _id: Types.ObjectId; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map((total) => [total._id.toString(), total.totalPoints]));

  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(team._id.toString()) ?? 0 }))
    .sort((a, b) => b.totalPoints - a.totalPoints || a.teamName.localeCompare(b.teamName, 'pt-BR'))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).select('fitnessGoal').lean();
  if (!user) throw httpError(404, 'Pessoa não encontrada para o e-mail informado');

  const latest = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).select('type').lean();
  const focus = (latest && focusByActivityType[latest.type]) ?? user.fitnessGoal;
  const reason = latest
    ? `Sua atividade recente (${latest.type}) indica foco em ${focus}.`
    : `Sua meta (${user.fitnessGoal}) orienta este treino.`;

  const workouts = await Workout.find({ focus }).lean();
  return workouts.map((workout) => ({ ...workout, reason }));
}

export { User };
