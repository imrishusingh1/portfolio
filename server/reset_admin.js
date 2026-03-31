import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../vercel-deploy.env' });

const AdminSchema = new mongoose.Schema({
  email: String,
  passwordHash: String
});
const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function wipeAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected! Deleting existing admin credentials...');
    const result = await Admin.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} admin accounts.`);
    console.log('COMPLETE! You can now go to /admin on your website to set up a brand new email and password.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

wipeAdmin();
