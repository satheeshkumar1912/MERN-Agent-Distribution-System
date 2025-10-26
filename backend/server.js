require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');


// --------------------
// Models
// --------------------
const mongooseOpts = { useNewUrlParser: true, useUnifiedTopology: true };

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) { next(err); }
});

UserSchema.methods.comparePassword = async function(candidate) {
  return await bcrypt.compare(candidate, this.password);
};

const AgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

AgentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) { next(err); }
});

const ListItemSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  phone: { type: String, required: true },
  notes: { type: String }
});

const ListSchema = new mongoose.Schema({
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  items: [ListItemSchema],
  uploadedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Agent = mongoose.model('Agent', AgentSchema);
const List = mongoose.model('List', ListSchema);

// --------------------
// App init
// --------------------
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------
// Auth middleware
// --------------------
function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

// --------------------
// Default admin creation
// --------------------
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      const admin = new User({ email: 'admin@example.com', password: 'admin123' });
      // const admin = new User({ email: 'admin@example.com', password: hashedPassword, isAdmin: true });
      await admin.save();
      console.log('Default admin user created');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// --------------------
// Auth routes
// --------------------
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (email === 'admin@example.com' && password === 'admin123') {
      let user = await User.findOne({ email: 'admin@example.com' });
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        user = new User({ email: 'admin@example.com', password: hashedPassword, isAdmin: true });
        await user.save();
        console.log('Admin user created during login');
      }
      const payload = { user: { id: user.id, isAdmin: true } };
      return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --------------------
// Agents routes
// --------------------
app.get('/api/agents', auth, async (req, res) => {
  try {
    const agents = await Agent.find().select('-password');
    res.json(agents);
  } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

app.post('/api/agents', auth, async (req, res) => {
  const { name, email, mobile, password } = req.body;
  try {
    let agent = await Agent.findOne({ email });
    if (agent) return res.status(400).json({ msg: 'Agent already exists' });
    agent = new Agent({ name, email, mobile, password });
    await agent.save();
    const agentResponse = { _id: agent._id, name: agent.name, email: agent.email, mobile: agent.mobile };
    res.status(201).json(agentResponse);
  } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

app.get('/api/agents/:id', auth, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select('-password');
    if (!agent) return res.status(404).json({ msg: 'Agent not found' });
    res.json(agent);
  } catch (err) { console.error(err.message); if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Agent not found' }); res.status(500).send('Server Error'); }
});

app.delete('/api/agents/:id', auth, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ msg: 'Agent not found' });
    await Agent.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Agent removed' });
  } catch (err) { console.error(err.message); if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Agent not found' }); res.status(500).send('Server Error'); }
});

// --------------------
// Upload handling
// --------------------
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) { cb(null, Date.now() + path.extname(file.originalname)); }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.csv', '.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true); else cb(new Error('Invalid file type. Only CSV, XLSX, and XLS files are allowed.'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }).single('file');

app.post('/api/upload', auth, (req, res) => {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ msg: err.message });
    processFile(req, res);
  });
});

app.get('/api/upload/lists', auth, async (req, res) => {
  try {
    const formattedLists = await getFormattedLists();
    res.json(formattedLists);
  } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

async function processFile(req, res) {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let records = [];
    if (fileExt === '.csv') records = await processCSV(filePath);
    else if (fileExt === '.xlsx' || fileExt === '.xls') records = processExcel(filePath);
    if (!validateRecords(records)) { fs.unlinkSync(filePath); return res.status(400).json({ msg: 'Invalid file format. File must contain firstName, phone, and notes columns.' }); }
    const agents = await Agent.find().select('_id');
    if (agents.length === 0) { fs.unlinkSync(filePath); return res.status(400).json({ msg: 'No agents found. Please add agents first.' }); }
    const distributedLists = distributeRecords(records, agents);
    await saveDistributedLists(distributedLists);
    fs.unlinkSync(filePath);
    res.status(200).json({ msg: 'File processed successfully', totalRecords: records.length, distributedLists: await getFormattedLists() });
  } catch (err) { console.error('Process file error:', err.message); res.status(500).json({ msg: 'Server Error' }); }
}

function processCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath).pipe(csv()).on('data', data => results.push(data)).on('end', () => resolve(results)).on('error', err => reject(err));
  });
}

function processExcel(filePath) { const workbook = xlsx.readFile(filePath); const sheetName = workbook.SheetNames[0]; const worksheet = workbook.Sheets[sheetName]; return xlsx.utils.sheet_to_json(worksheet); }

function validateRecords(records) {
  if (records.length === 0) return false;
  const firstRecord = records[0];
  const hasFirstName = 'firstName' in firstRecord || 'FirstName' in firstRecord;
  const hasPhone = 'phone' in firstRecord || 'Phone' in firstRecord;
  const hasNotes = 'notes' in firstRecord || 'Notes' in firstRecord;
  return hasFirstName && hasPhone && hasNotes;
}

function distributeRecords(records, agents) {
  const numAgents = agents.length;
  if (records.length < numAgents) {
    let extended = [...records];
    while (extended.length < numAgents) extended = [...extended, ...records].slice(0, numAgents);
    records = extended;
  }
  const recordsPerAgent = Math.floor(records.length / numAgents);
  const remainder = records.length % numAgents;
  const distributedLists = {};
  agents.forEach(agent => { distributedLists[agent._id] = []; });
  let currentIndex = 0;
  const activeAgents = agents;
  for (let i = 0; i < activeAgents.length; i++) {
    const agentId = activeAgents[i]._id;
    const numRecords = recordsPerAgent + (i < remainder ? 1 : 0);
    for (let j = 0; j < numRecords; j++) {
      if (currentIndex < records.length) {
        const record = records[currentIndex];
        const firstName = record.firstName || record.FirstName;
        const phone = record.phone || record.Phone;
        const notes = record.notes || record.Notes;
        distributedLists[agentId].push({ firstName, phone, notes });
        currentIndex++;
      }
    }
  }
  return distributedLists;
}

async function saveDistributedLists(distributedLists) {
  await List.deleteMany({});
  const savePromises = [];
  for (const agentId in distributedLists) {
    const items = distributedLists[agentId];
    if (items.length > 0) {
      const list = new List({ agent: agentId, items });
      savePromises.push(list.save());
    }
  }
  await Promise.all(savePromises);
}

async function getFormattedLists() {
  const allAgents = await Agent.find();
  const lists = await List.find().populate('agent', 'name email');
  const agentListMap = {};
  allAgents.forEach(agent => { agentListMap[agent._id] = { agentId: agent._id, agentName: agent.name, agentEmail: agent.email, itemCount: 0, items: [] }; });
  lists.forEach(list => {
    if (list.agent && list.agent._id) {
      agentListMap[list.agent._id] = { agentId: list.agent._id, agentName: list.agent.name, agentEmail: list.agent.email, itemCount: list.items.length, items: list.items };
    }
  });
  return Object.values(agentListMap);
}

// Basic route
app.get('/', (req, res) => res.send('API is running'));

// Connect and start
mongoose.connect(process.env.MONGODB_URI, mongooseOpts).then(() => { console.log('MongoDB connected'); createDefaultAdmin(); }).catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
