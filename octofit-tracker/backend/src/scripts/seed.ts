import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function seed() {
  await connectDatabase();
  try {
    // TODO: Learners implement stable seed data with idempotent upserts for User, Team, Activity and Workout.
    void User;
    void Team;
    void Activity;
    void Workout;
  } finally {
    await disconnectDatabase();
  }
}

if (process.argv[1]?.endsWith('seed.ts')) {
  await seed();
}
