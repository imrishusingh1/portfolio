import mongoose from 'mongoose'

const visitorSchema = new mongoose.Schema({
    ip: { type: String, required: true, index: true },
    visitCount: { type: Number, default: 1 },
    device: {
        type: { type: String, default: 'unknown' },   // mobile, tablet, desktop, etc.
        brand: { type: String, default: 'unknown' },   // Apple, Samsung, etc.
        model: { type: String, default: 'unknown' },   // iPhone 15, MacBook Pro, etc.
    },
    os: {
        name: { type: String, default: 'unknown' },    // iOS, macOS, Windows, Android
        version: { type: String, default: '' },
    },
    browser: {
        name: { type: String, default: 'unknown' },    // Chrome, Safari, Firefox
        version: { type: String, default: '' },
    },
    userAgent: { type: String, default: '' },
    firstVisit: { type: Date, default: Date.now },
    firstVisit_IST: { type: String, default: '' },
    lastVisit: { type: Date, default: Date.now },
    lastVisit_IST: { type: String, default: '' },
    visits: [{
        timestamp: { type: Date, default: Date.now },
        timestamp_IST: { type: String, default: '' },
        referrer: { type: String, default: '' },
        page: { type: String, default: '' },
    }],
    location: {
        country: { type: String, default: 'unknown' },
        countryCode: { type: String, default: 'XX' },
        city: { type: String, default: 'unknown' },
        isp: { type: String, default: 'unknown' },
    },
    // Per-session engagement data (sections viewed + time spent)
    sessions: [{
        recordedAt: { type: Date, default: Date.now },
        totalSeconds: { type: Number, default: 0 },
        sections: [{
            name: { type: String },
            seconds: { type: Number },
        }],
        navClicks: [{ type: String }],
        referrer: { type: String, default: '' },
    }],
})

export default mongoose.model('PortfolioVisitor', visitorSchema)
