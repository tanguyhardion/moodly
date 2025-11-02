# ✨ Moodly - Daily Check-In Journal

A beautiful, cozy daily journal app to track your mood, energy, sleep, and focus. All data is stored locally in your browser for complete privacy.

## 🌟 Features

- **Daily Check-Ins**: Log your mood, energy, sleep quality, and focus on a 1-5 scale
- **Personal Notes**: Add optional text notes to any entry
- **Visual History**: Browse all your past entries with beautiful cards
- **Statistics & Insights**: View trends and averages with interactive charts
- **Dark Mode**: Seamless light/dark theme switching
- **Local Storage**: All data stays on your device - no servers, no accounts
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Cozy Aesthetics**: Soft pastel gradients, smooth animations, rounded cards

## 🎨 Design Philosophy

Moodly embraces a warm, inviting design with:

- Soft pastel color gradients
- Rounded cards with subtle shadows
- Smooth animations for sliders and transitions
- Clean, modern sans-serif typography
- Animated background shapes
- Intuitive, minimal interface

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

```bash
# Install dependencies
npm install
```

### Development

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

### Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview

# Generate static site
npm run generate
```

## 📁 Project Structure

```
/moodly
  ├── app/
  │   ├── assets/
  │   │   └── css/
  │   │       └── main.css           # Global styles & CSS variables
  │   ├── components/
  │   │   ├── EntryCard.vue          # Card for displaying entries
  │   │   ├── MetricSlider.vue       # Interactive slider for metrics
  │   │   └── MiniChart.vue          # Mini chart component
  │   ├── composables/
  │   │   ├── useLocalStorage.ts     # Local storage wrapper
  │   │   └── useMoodly.ts           # Main app state & logic
  │   ├── layouts/
  │   │   └── default.vue            # Default layout with nav
  │   ├── pages/
  │   │   ├── index.vue              # Home - Daily check-in
  │   │   ├── history.vue            # View all entries
  │   │   └── stats.vue              # Statistics & insights
  │   └── app.vue                    # Root component
  ├── types/
  │   └── index.ts                   # TypeScript type definitions
  ├── public/                        # Static assets
  ├── nuxt.config.ts                 # Nuxt configuration
  └── package.json
```

## 🎯 How to Use

1. **Create Your First Entry**: Click on the home page and adjust the sliders for mood, energy, sleep, and focus
2. **Add a Note**: Optionally write about your day in the text area
3. **Save**: Click "Save Entry" to store your check-in
4. **View History**: Navigate to "History" to see all your past entries
5. **Track Progress**: Visit "Stats" to view trends, averages, and insights

## 🔒 Privacy

Moodly is 100% private:

- All data is stored in your browser's local storage
- No servers, no accounts, no tracking
- Your data never leaves your device
- Clear your browser data to reset everything

## 🛠️ Technologies

- **Nuxt 4**: Vue.js meta-framework for SSR/SSG
- **Vue 3**: Reactive UI framework
- **TypeScript**: Type-safe development
- **CSS Variables**: Dynamic theming
- **Local Storage API**: Client-side data persistence
- **@nuxt/icon**: Beautiful icon library
- **@nuxt/fonts**: Optimized font loading

## 📝 Metrics Explained

- **Mood**: Your overall emotional state (😢 → 😊)
- **Energy**: Your physical and mental energy levels (😴 → ⚡)
- **Sleep**: Quality of your last night's sleep (😵 → 😴)
- **Focus**: Your ability to concentrate (🤯 → 🧠)

## 🎨 Customization

The app uses CSS variables for easy theming. Edit `app/assets/css/main.css` to customize:

- Color palette
- Typography
- Spacing
- Border radius
- Shadows
- Animations

## 📱 Browser Support

Modern browsers with ES2020+ support:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ✨ Future Ideas

- Export data as JSON/CSV
- Import existing data
- Custom metrics
- Reminders & notifications
- Data visualization improvements
- Journaling prompts
- Mood correlations

---

Made with ❤️ for personal wellness and mindfulness
