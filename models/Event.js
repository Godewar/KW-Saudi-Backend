import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },             // Event name
  subtitle: { type: String },                          // Optional sub-title

  // Dates
  startDate: { type: Date, required: true },           // Start date
  endDate: { type: Date },                             // End date (null if single-day)

  // Session info (supports single or multiple sessions)
  sessions: [
    {
      sessionTitle: { type: String },                  // e.g., "Session 1"
      date: { type: Date, required: true },            // Session date
      time: { type: String, required: true }           // e.g., "10:00 AM - 12:00 PM CT"
    }
  ],

  // General details
  time: { type: String },                              // Overall event time (if same for all)
  location: { type: String, default: 'Online' },
  cost: { type: String, default: 'Free' },

  // Presenters
  presentedBy: { type: String },                       // e.g., "KTTT"
  team: { type: String },                              // e.g., "KWU Tech Training Team"

  // Media
  coverImage: { type: String },                        // Single cover image 

  // Content
  description: { type: String },                       // Main description
  audience: { type: String },                          // "Who should attend"
  contactEmail: { type: String },                      // e.g., faculty@kw.com

}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
