import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { Competition } from '../src/models/Competition.js';
import { Participation } from '../src/models/Participation.js';
import { Submission } from '../src/models/Submission.js';
import { User } from '../src/models/User.js';

const ids = {
  competition: new mongoose.Types.ObjectId('66f000000000000000000001'),
  demoUser: new mongoose.Types.ObjectId('66f000000000000000000101'),
  participant: new mongoose.Types.ObjectId('66f000000000000000000102'),
};
const hours = (amount) => amount * 60 * 60 * 1000;
const now = Date.now();

async function seed() {
  await connectDatabase();
  await Promise.all([
    Submission.deleteMany({ competitionId: ids.competition }),
    Participation.deleteMany({ competitionId: ids.competition }),
    Competition.deleteOne({ _id: ids.competition }),
    User.deleteMany({ _id: { $in: [ids.demoUser, ids.participant] } }),
  ]);
  await User.insertMany([
    { _id: ids.demoUser, name: 'Aanya Sharma', email: 'aanya.demo@feedants.local' },
    { _id: ids.participant, name: 'Seeded Participant', email: 'participant.demo@feedants.local' },
  ]);
  await Competition.create({
    _id: ids.competition,
    slug: 'classical-dance',
    title: 'Feedants Classical Dance',
    category: 'Dance',
    badges: ['Multi-Win'],
    description: 'An online classical dance competition for performers of every age group.',
    prizePool: 1500,
    entryFee: 99,
    maxParticipants: 20,
    registrationStart: new Date(now - hours(72)),
    registrationEnd: new Date(now + hours(54)),
    submissionStart: new Date(now - hours(1)),
    submissionEnd: new Date(now + hours(480)),
    resultDate: new Date(now + hours(528)),
    certificateText: 'Winners get certificate',
    judge: {
      name: 'Manju Dubey',
      title: 'Professional Kathak Dancer',
      experience: '12+ Years of Experience',
      imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=600&q=80',
      videoUrl: 'https://www.youtube.com/watch?v=VbZK1Jt0J6M',
    },
    previousWinners: [
      { name: 'Riya Shah', position: '1st Winner', imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=500&q=80' },
      { name: 'Aarav Mehta', position: '1st Winner', imageUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=500&q=80' },
      { name: 'Neha Verma', position: '2nd Winner', imageUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=500&q=80' },
      { name: 'Ishita Chopra', position: '3rd Winner', imageUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=500&q=80' },
    ],
    content: {
      about: 'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance while connecting with a community that celebrates Indian performing arts.',
      judgingParameters: ['Technique and posture - 30%', 'Expression and storytelling - 25%', 'Rhythm and musicality - 25%', 'Costume and presentation - 20%'],
      rules: ['Submit one unedited performance video.', 'The performance must be between 2 and 5 minutes.', 'Use a stable public video link.'],
      eligibility: ['Open to all age groups.', 'Participants may enter from any location.', 'A paid registration is required for judging.'],
    },
    rewards: [
      { position: 1, label: '1st Winner', amount: 550 },
      { position: 2, label: '2nd Winner', amount: 300 },
      { position: 3, label: '3rd Winner', amount: 240 },
      { position: 4, label: '4th Winner', amount: 200 },
      { position: 5, label: '5th Winner', amount: 130 },
      { position: 6, label: '6th Winner', amount: 80 },
    ],
    referral: { url: 'https://feedants.com/r/referral123', earningText: 'You earn Rs 10 for every signup' },
    paymentInfo: {
      prizeDelivery: 'Prize money is transferred to the verified payment account after results are finalized.',
      refundPolicy: 'Entry fees are refundable only if Feedants cancels the competition.',
      provider: 'Razorpay',
      explainerVideoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
    },
    reviews: [{ name: 'Sanya', quote: 'A smooth experience and thoughtful feedback from the judge.', rating: 5 }],
  });
  await Participation.create({
    competitionId: ids.competition,
    userId: ids.participant,
    slotNumber: 0,
    status: 'REGISTERED',
    paymentStatus: 'DEMO_PAID',
  });
  console.log('Seed complete');
  console.log(`Competition ID: ${ids.competition}`);
  console.log(`Demo user ID: ${ids.demoUser}`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
