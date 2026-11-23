import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function seed() {
  await connectDatabase();
  try {
    const octocats = await Team.findOneAndUpdate(
      { name: 'Octocats' },
      { $set: { name: 'Octocats', mascot: 'Mona' } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    const robocats = await Team.findOneAndUpdate(
      { name: 'Robocats' },
      { $set: { name: 'Robocats', mascot: 'Hubot' } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    async function upsertDemoUser(name: string, email: string, teamId: typeof octocats._id, fitnessGoal: string) {
      const previousUser = await User.findOne({ email }).select('_id team');
      if (previousUser?.team && previousUser.team.toString() !== teamId.toString()) {
        await Team.updateOne({ _id: previousUser.team }, { $pull: { members: previousUser._id } });
      }
      const user = await User.findOneAndUpdate(
        { email },
        { $set: { name, email, team: teamId, fitnessGoal } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      await Team.updateOne({ _id: teamId }, { $addToSet: { members: user._id } });
      return user;
    }

    const mona = await upsertDemoUser('Mona', 'mona@example.com', octocats._id, 'endurance');
    const hubot = await upsertDemoUser('Hubot', 'hubot@example.com', robocats._id, 'strength');

    const activities = [
      { user: mona, team: octocats, type: 'run', minutes: 40, points: 40, occurredAt: new Date('2026-01-10T12:00:00.000Z') },
      { user: hubot, team: robocats, type: 'cycle', minutes: 25, points: 25, occurredAt: new Date('2026-01-11T12:00:00.000Z') },
    ];
    for (const activity of activities) {
      await Activity.updateOne(
        { user: activity.user._id, team: activity.team._id, type: activity.type, occurredAt: activity.occurredAt },
        { $set: { user: activity.user._id, team: activity.team._id, type: activity.type, minutes: activity.minutes, points: activity.points, occurredAt: activity.occurredAt } },
        { upsert: true },
      );
    }

    const workouts = [
      { title: 'Intervalos', focus: 'endurance', minutes: 30, difficulty: 'moderate' },
      { title: 'Circuito de força', focus: 'strength', minutes: 30, difficulty: 'moderate' },
    ];
    for (const workout of workouts) {
      await Workout.updateOne(
        { title: workout.title },
        { $set: workout },
        { upsert: true },
      );
    }
  } finally {
    await disconnectDatabase();
  }
}

if (process.argv[1]?.endsWith('seed.ts')) {
  await seed();
}
