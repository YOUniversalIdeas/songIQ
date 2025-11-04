import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Market from '../src/models/Market';
import User from '../src/models/User';

// Load environment variables
dotenv.config({ path: '../.env.production' });

const sampleMarkets = [
  {
    title: 'Will "Summer Vibes 2025" reach Top 10 on Billboard Hot 100?',
    description: 'This market predicts whether the upcoming single "Summer Vibes 2025" by emerging artist Luna Sky will make it to the Top 10 on the Billboard Hot 100 chart within 3 months of release.',
    category: 'chart_position',
    outcomes: [
      {
        name: 'Yes, Top 10',
        description: 'Song reaches Top 10 within 3 months',
      },
      {
        name: 'No, Top 10',
        description: 'Song does not reach Top 10 within 3 months',
      },
    ],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
  },
  {
    title: 'Will Drake release a new album in 2025?',
    description: 'Predict whether Drake will release a new studio album (not mixtape or EP) before December 31, 2025.',
    category: 'release_success',
    outcomes: [
      {
        name: 'Yes, in 2025',
        description: 'Drake releases a new studio album in 2025',
      },
      {
        name: 'No, not in 2025',
        description: 'Drake does not release a new studio album in 2025',
      },
    ],
    endDate: new Date('2025-12-31'),
  },
  {
    title: 'Taylor Swift - Album of the Year at 2026 Grammys',
    description: 'Will Taylor Swift win Album of the Year at the 2026 Grammy Awards?',
    category: 'awards',
    outcomes: [
      {
        name: 'Yes, wins',
        description: 'Taylor Swift wins Album of the Year',
      },
      {
        name: 'No, does not win',
        description: 'Taylor Swift does not win Album of the Year',
      },
    ],
    endDate: new Date('2026-02-08'), // Grammy Awards date
  },
  {
    title: 'Will Afrobeats become the #1 global genre by streams in 2025?',
    description: 'Predict whether Afrobeats will overtake other genres to become the most-streamed music genre globally in 2025.',
    category: 'genre_trend',
    outcomes: [
      {
        name: 'Yes, #1 genre',
        description: 'Afrobeats becomes most-streamed genre globally',
      },
      {
        name: 'No, not #1',
        description: 'Afrobeats does not become most-streamed genre',
      },
    ],
    endDate: new Date('2025-12-31'),
  },
  {
    title: 'Bad Bunny - 1 Billion Spotify Streams in First Month',
    description: 'Will Bad Bunny\'s next album surpass 1 billion streams on Spotify in its first month?',
    category: 'streaming_numbers',
    outcomes: [
      {
        name: 'Yes, 1B+ streams',
        description: 'Album reaches 1 billion streams in first month',
      },
      {
        name: 'No, less than 1B',
        description: 'Album does not reach 1 billion streams in first month',
      },
    ],
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
  },
  {
    title: 'Which artist will have the most monthly Spotify listeners by end of 2025?',
    description: 'Predict which artist will top Spotify\'s monthly listeners chart by December 31, 2025.',
    category: 'artist_popularity',
    outcomes: [
      {
        name: 'The Weeknd',
        description: 'The Weeknd has most monthly listeners',
      },
      {
        name: 'Taylor Swift',
        description: 'Taylor Swift has most monthly listeners',
      },
      {
        name: 'Bad Bunny',
        description: 'Bad Bunny has most monthly listeners',
      },
      {
        name: 'Other artist',
        description: 'Another artist not listed has most monthly listeners',
      },
    ],
    endDate: new Date('2025-12-31'),
  },
  {
    title: 'Will hyperpop break into mainstream Top 40 radio in 2025?',
    description: 'Will a hyperpop song reach the Top 40 on mainstream radio (Mediabase) in 2025?',
    category: 'genre_trend',
    outcomes: [
      {
        name: 'Yes, Top 40',
        description: 'Hyperpop song reaches Top 40 on mainstream radio',
      },
      {
        name: 'No, not Top 40',
        description: 'Hyperpop song does not reach Top 40',
      },
    ],
    endDate: new Date('2025-12-31'),
  },
  {
    title: 'Olivia Rodrigo - Grammy for Best New Artist 2026',
    description: 'Will Olivia Rodrigo win Best New Artist at the 2026 Grammy Awards? (Assuming eligibility)',
    category: 'awards',
    outcomes: [
      {
        name: 'Yes, wins',
        description: 'Olivia Rodrigo wins Best New Artist',
      },
      {
        name: 'No, does not win',
        description: 'Olivia Rodrigo does not win Best New Artist',
      },
    ],
    endDate: new Date('2026-02-08'),
  },
];

async function seedMarkets() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Find or create a user to be the creator
    let creator = await User.findOne({ role: 'admin' });
    
    if (!creator) {
      // Try to find any user
      creator = await User.findOne();
    }

    if (!creator) {
      console.log('❌ No users found. Please create a user first.');
      process.exit(1);
    }

    console.log(`📝 Using user ${creator.email} as market creator`);

    // Clear existing markets (optional - comment out if you want to keep existing markets)
    // await Market.deleteMany({});
    // console.log('🗑️  Cleared existing markets');

    // Create markets
    for (const marketData of sampleMarkets) {
      const initialPrice = 1 / marketData.outcomes.length;
      const formattedOutcomes = marketData.outcomes.map((outcome, index) => ({
        id: `outcome_${index + 1}`,
        name: outcome.name,
        description: outcome.description,
        shares: 100,
        price: initialPrice,
        totalVolume: 0,
      }));

      const market = new Market({
        ...marketData,
        outcomes: formattedOutcomes,
        status: 'active',
        creatorId: creator._id,
        totalVolume: 0,
        totalLiquidity: 1000,
        fee: 0.02,
      });

      await market.save();
      console.log(`✅ Created market: ${market.title}`);
    }

    console.log(`\n🎉 Successfully seeded ${sampleMarkets.length} prediction markets!`);
    console.log('\n📊 Market Categories:');
    const categoryCounts = sampleMarkets.reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} market(s)`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding markets:', error);
    process.exit(1);
  }
}

// Run the seed function
seedMarkets();

