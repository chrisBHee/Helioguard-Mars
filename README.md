# HelioGuard Mars 🚀

**Mars Solar Storm Early Warning System** for the Challenger Center Space Challenge

A cutting-edge real-time dashboard built with Next.js that integrates NASA's Surya AI to provide critical solar storm predictions and alerts for Mars missions, ensuring astronaut safety and operational efficiency.

## 🌟 Features

### Real-Time Monitoring
- **Solar Activity Dashboard**: Live tracking of solar flux, sunspot numbers, solar wind speed, proton density, magnetic field strength, and geomagnetic indices
- **Solar Proton Monitor**: Real-time NOAA Space Weather data for solar proton flux levels with alert classifications
- **Mars Weather Station**: Continuous monitoring of Martian temperature, atmospheric pressure, radiation levels, and dust storm probability
- **Comms Status Widget**: NASA DSN tracking data showing which antenna is currently tracking MAVEN and MRO spacecraft
- **Mission Status Tracking**: Real-time updates on crew count, mission phase, Earth-Mars distances, and communication delays

### Intelligent Alert System
- **Active Alerts**: Immediate notifications for current solar events (Solar Flares, CMEs, Geomagnetic Storms)
- **Predictive Analytics**: AI-powered forecasting of potential solar storms using NASA Surya models
- **Severity Classification**: Color-coded alerts ranging from LOW to EXTREME with actionable recommendations
- **Regional Impact Mapping**: Identification of affected mission areas (Surface, Orbit, Transit Corridor)

### Astronaut-Centric Design
- **Responsive Interface**: Optimized for mission control centers and spacecraft displays
- **Instant Visual Feedback**: Glanceable severity indicators and real-time data visualization
- **Actionable Intelligence**: Clear recommendations for crew safety protocols
- **Space-Grade Reliability**: Production-ready with fallback systems and error handling

## 🛠️ Technical Stack

- **Frontend**: Next.js 14+ with TypeScript and Tailwind CSS
- **Animations**: Framer Motion for smooth transitions
- **Data Visualization**: Recharts for interactive charts
- **Icons**: Lucide React for consistent iconography
- **API Integration**: Custom NASA Surya AI service layer
- **Real-time Updates**: Automatic polling with configurable intervals

## 🚀 Getting Started

1. **Install Dependencies**:
```bash
npm install
```

2. **Run Development Server**:
```bash
npm run dev
```

3. **Open Browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Configuration

Create a `.env.local` file with NASA API credentials:
```env
NASA_SURYA_API_URL=https://api.nasa.gov/surya/v1
NASA_API_KEY=your_api_key_here
```

## 📊 Data Sources

The system integrates with multiple authoritative sources:

### NASA Integration
- **NASA Surya AI Platform**: Solar activity predictions and space weather modeling
- **NASA Deep Space Network**: Real-time spacecraft tracking data for MAVEN and MRO missions

### NOAA Integration  
- **NOAA Space Weather Prediction Center**: Real-time solar proton flux measurements from GOES satellites
- **Space Weather Scales**: Official NOAA classification system for solar proton events (S1-S4+)

### Data Processing
- Real-time API polling with automatic fallback to mock data
- NOAA Space Weather Scale implementation for proton flux alerting
- XML parsing for NASA DSN tracking information
- Graceful error handling with informative user feedback

## 🎯 Key Components

### Core Services
- `NasaSuryaDataService`: Handles all NASA API communications and data processing
- `NoaaSpaceWeatherService`: Fetches real solar proton flux data from NOAA SWPC API
- `NasaDSNService`: Parses NASA DSN XML feed for spacecraft tracking information
- Mock data generation for demonstration purposes when APIs are unavailable

### UI Components
- `SolarActivityDashboard`: Comprehensive solar monitoring interface
- `SolarMonitor`: Displays real NOAA solar proton flux data with alert levels
- `CommsStatusWidget`: Shows NASA DSN tracking status for MAVEN and MRO spacecraft
- `MarsWeatherDashboard`: Martian environmental conditions tracker
- `AlertCard`: Interactive alert display with severity indicators

### Data Models
- `SolarStormAlert`: Structured alert information with recommendations
- `SolarActivityData`: Real-time solar measurements and indices
- `SolarProtonFluxData`: NOAA solar proton flux readings with alert classifications
- `DSNTrackingData`: NASA DSN spacecraft tracking information
- `MarsWeatherData`: Martian atmospheric and radiation data
- `MissionStatus`: Current mission parameters and crew information

## 🛡️ Safety Features

- **Automated Alert Generation**: Proactive warning system based on threshold monitoring
- **Multiple Severity Levels**: Granular risk assessment from LOW to EXTREME
- **Regional Impact Analysis**: Specific guidance for different mission phases
- **Communication Delay Compensation**: Real-time adjustment for Earth-Mars communication lag
- **Redundant Data Sources**: Fallback mechanisms for continuous operation

## 🏆 Challenger Center Space Challenge

This project addresses critical challenges in Mars exploration:
- **Crew Safety**: Real-time radiation and solar storm monitoring
- **Mission Efficiency**: Predictive analytics for operational planning
- **Emergency Response**: Immediate alerting for critical situations
- **Decision Support**: Actionable intelligence for mission controllers

## 🌌 Future Enhancements

- Integration with actual NASA Surya API endpoints
- Advanced machine learning for improved prediction accuracy
- Mobile-responsive design for handheld devices
- Multi-language support for international missions
- Historical data analysis and trend visualization

---

*"Protecting humanity's journey to the Red Planet, one solar storm at a time."*

**Built with ❤️ for space exploration**