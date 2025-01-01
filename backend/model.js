const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: String,
    name: String,
    email: String,
    password: String,
    phoneNumber: {type: Number, required: true},
    address: {type: String, required: true},
    profilePicture: {type: mongoose.Schema.Types.ObjectId, ref: 'File'},
  });

  UserSchema.pre('save', async function(next) {
    const User = mongoose.model('User', UserSchema);
    this.userId = "USER" + await User.countDocuments() + 1;
    next();
  });
  
const User = mongoose.model('User', UserSchema);

const InnovatorSchema = new mongoose.Schema({
    innovatorId: String,
    name: String,
    email: String,
    password: String,
    profilePicture: {type: mongoose.Schema.Types.ObjectId, ref: 'File'},
    phoneNumber: {type: Number, required: true},
    address: {type: String, required: true},
    about: {type: String, required: true},
    skills: [],
    projects: [{type: mongoose.Schema.Types.ObjectId, ref: 'Project'}],
    achievements: [String], 
    website: { type: String, required: true },
    socialLinks: [{type: mongoose.Schema.Types.ObjectId, ref: 'SocialLink'}], 
    availability: {type: mongoose.Schema.Types.ObjectId, ref: 'Availability'},
});


InnovatorSchema.pre('save', async function(next) {
    const Innovator = mongoose.model('Innovator', InnovatorSchema);
    this.innovatorId = "INNOVATOR" + await Innovator.countDocuments() + 1;
    next();
});

const Innovator = mongoose.model('Innovator', InnovatorSchema);

const BusinessSchema = new mongoose.Schema({
    businessId: String,
    name: String,
    email: String,
    password: String,
    profilePicture: {type: mongoose.Schema.Types.ObjectId, ref: 'File'},
    phoneNumber: String,
    address: String,
    about: String,
    skills: [],
    website: String,
    socialLinks: [{type: mongoose.Schema.Types.ObjectId, ref: 'SocialLink'}],
    availability: {type: mongoose.Schema.Types.ObjectId, ref: 'Availability'},
});

BusinessSchema.pre('save', async function(next) {
    const Business = mongoose.model('Business', BusinessSchema);
    this.businessId = "BUSINESS" + await Business.countDocuments() + 1;
    next();
});

const Business = mongoose.model('Business', BusinessSchema);

const FileSchema = new mongoose.Schema({
    fileID: String,
    contentType: String,
    data: Buffer,
});

FileSchema.pre('save', async function(next) {
    const File = mongoose.model('File', FileSchema);
    this.fileID = "FILE" + (await File.countDocuments() + 1);
    next();
});

const File = mongoose.model('File', FileSchema);

const AvailabilitySchema = new mongoose.Schema({
    availabilityId: String,
    startDate: Date,
    endDate: Date,
    startTime: String,
    endTime: String,
    day: String,
    innovator: {type: mongoose.Schema.Types.ObjectId, ref: 'Innovator'}
});

AvailabilitySchema.pre('save', async function(next) {
    const Availability = mongoose.model('Availability', AvailabilitySchema);
    this.availabilityId = "AVAILABILITY" + await Availability.countDocuments() + 1;
    next();
});

const Availability = mongoose.model('Availability', AvailabilitySchema);

const SocialLinkSchema = new mongoose.Schema({
    socialLinkId: String,
    platform: String,
    link: String
});

SocialLinkSchema.pre('save', async function(next) {
    const SocialLink = mongoose.model('SocialLink', SocialLinkSchema);
    this.socialLinkId = "SOCIALLINK" + await SocialLink.countDocuments() + 1;
    next();
});

const SocialLink = mongoose.model('SocialLink', SocialLinkSchema);


const ProjectSchema = new mongoose.Schema({
  projectId: String,
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['planning', 'in-progress', 'completed'],
    default: 'planning'
  },
  target: String,
  startDate: Date,
  endDate: Date,
  budget: Number,
  milestones: [String],
  risks: String,
  sustainabilityImpact: String,
  location: {
    type: {
      type: String, 
      enum: ['Point'], 
      required: true
    },
    coordinates: {
      type: [Number], 
      required: true
    }
  },
  projectType: ["innovation", "research", "development", "design", "testing", "deployment", "maintenance","schemes"],
  sustainabilityMetrics: {
    energyUsage: {
      baseline: Number, // Previous energy usage
      current: Number, // Current energy usage
      unit: { type: String, default: 'kWh' }
    },
    carbonFootprint: {
      baseline: Number, // Previous carbon emissions
      current: Number, // Current carbon emissions
      unit: { type: String, default: 'CO₂e' }
    },
    costSavings: {
      energyCosts: Number, // Money saved on energy
      implementationCosts: Number, // Cost of implementing the project
      netSavings: Number // Total cost savings
    },
    sustainabilityScore: {
      energyEfficiency: { type: Number, min: 0, max: 100 },
      carbonReduction: { type: Number, min: 0, max: 100 },
      costEffectiveness: { type: Number, min: 0, max: 100 },
      overallScore: { type: Number, min: 0, max: 100 }
    }
  },
  images: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File' 
  }],
  videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File' 
  }],
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  createdAt: { type: Date, default: Date.now }
});

ProjectSchema.index({ location: '2dsphere' });

ProjectSchema.pre('save', async function(next) {
  if (!this.projectId) {
    const Project = mongoose.model('Project', ProjectSchema);
    this.projectId = "PROJECT" + await Project.countDocuments() + 1;
  }
  next();
});

const Project = mongoose.model('Project', ProjectSchema);

const IssueSchema = new mongoose.Schema({
  issueId: String,
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['planning', 'in-progress', 'completed'],
    default: 'planning'
  },
  solution: { type: mongoose.Schema.Types.ObjectId, ref: "Innovation", default: '' },
  supportedBy: [{ title : String, description: String, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}, createdAt: { type: Date, default: Date.now } }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Innovator' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  createdAt: { type: Date, default: Date.now }
});

IssueSchema.pre('save', async function(next) {
  if (!this.issueId) {
    const Issue = mongoose.model('Issue', IssueSchema);
    this.issueId = "ISSUE" + await Issue.countDocuments() + 1;
  }
  next();
});

const Issue = mongoose.model('Issue', IssueSchema);

const AssetSchema = new mongoose.Schema({
  assetId: String,
  title: { type: String, required: true },
  description: { type: String, required: true },
  cost: Number,
  location: {
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 }
  },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  createdAt: { type: Date, default: Date.now }
});

AssetSchema.pre('save', async function(next) {
  if (!this.assetId) {
    const Asset = mongoose.model('Asset', AssetSchema);
    this.assetId = "ASSET" + await Asset.countDocuments() + 1;
  }
  next();
});

const Asset = mongoose.model('Asset', AssetSchema);

const InnovationSchema = new mongoose.Schema({
  innovationId: String,
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredTools: [String],
  requiredAssets: [String],
  cost: Number,
  location: {
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 }
  },
  project: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Innovator' },
  createdAt: { type: Date, default: Date.now }
})

InnovationSchema.pre('save', async function(next) {
  if (!this.innovationId) {
    const Innovation = mongoose.model('Innovation', InnovationSchema);
    this.innovationId = "INNOVATION" + await Innovation.countDocuments() + 1;
  }
  next();
});

const Innovation = mongoose.model('Innovation', InnovationSchema);



module.exports = {User, Innovator, Business, File, Project, Availability, SocialLink, Issue, Asset, Innovation};