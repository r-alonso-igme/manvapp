# ManvApp - Volleyball Scoreboard

A modern, responsive web application featuring a real-time volleyball scoreboard built with HTML, CSS, and JavaScript.

## � Live Demo

**[View Live Demo](https://r-alonso-igme.github.io/manvapp)**

## Features

### 🎨 Web Application
- Modern, clean design
- 📱 Fully responsive layout
- ⚡ Fast and lightweight
- 🎯 SEO optimized
- 🔧 Easy to customize

### 🏐 Volleyball Scoreboard
- **Real-time score tracking** for both teams
- **Official volleyball rules** (25 points, win by 2)
- **Best of 3 or Best of 5** match formats
- **Set history tracking** with visual results
- **Timeout management** (2 per team per set)
- **Export functionality** with custom format
- **Keyboard shortcuts** for fast scoring
- **Undo functionality** for mistake correction
- **Mobile-optimized** for courtside use

## Project Structure

```
manvapp/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Main stylesheet
├── js/
│   └── script.js       # JavaScript functionality
├── assets/             # Images and other assets
├── package.json        # Project dependencies
└── README.md          # This file
```

## Getting Started

### Prerequisites

- Node.js (for development server)
- Modern web browser

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:

```bash
npm run dev
```

This will start a live server on `http://localhost:3000` with auto-reload functionality.

### Building for Production

```bash
npm run build
```

## Features Overview

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Optimized for all screen sizes

### Navigation
- Sticky header navigation
- Mobile hamburger menu
- Smooth scrolling to sections

### Interactive Elements
- Contact form with validation
- Hover effects and animations
- Notification system

### Performance
- Optimized CSS and JavaScript
- Fast loading times
- Minimal dependencies

## Customization

### Colors
Update CSS custom properties in `css/styles.css`:

```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #64748b;
    /* Add your custom colors */
}
```

### Content
- Edit `index.html` to modify content
- Add your images to the `assets/` folder
- Customize styles in `css/styles.css`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 GitHub Pages Deployment

This project is configured for easy deployment to GitHub Pages:

1. **Push to GitHub** - Your code will be automatically available
2. **Enable GitHub Pages** in repository settings
3. **Set source** to deploy from `main` branch
4. **Access your live site** at `https://yourusername.github.io/manvapp`

### Deployment Steps:
```bash
# 1. Add all files to git
git add .

# 2. Commit your changes
git commit -m "Add volleyball scoreboard functionality"

# 3. Push to GitHub
git push origin main
```

## 🎮 Scoreboard Usage

### Mouse/Touch Controls
- Use **+/-** buttons to add/remove points
- Click **team names** to edit them
- Use **control buttons** for match management

### Keyboard Shortcuts
- `A` / `S` - Add/Remove point for Team A
- `L` / `K` - Add/Remove point for Team B
- `N` - New Match
- `U` - Undo Last Action
- `R` - Reset Current Set

### Export Format
Export generates: `[points_home]:[points_guest] (sets_home/sets_guest) timeout (yes/not)`

Example: `25:23 (2/1) timeout (not)`

## 🛠️ Development

### Local Development
```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
```

### File Structure
```
manvapp/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Responsive stylesheet
├── js/
│   └── script.js       # Scoreboard functionality
├── assets/             # Images and assets
├── .github/
│   └── copilot-instructions.md
└── package.json        # Dependencies
```

## 📱 Mobile Optimization

- **Touch-friendly** controls for mobile devices
- **Responsive design** works on all screen sizes
- **Optimized layout** for both portrait and landscape
- **Fast loading** for courtside use

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏐 Perfect for:

- **Volleyball tournaments** and competitions
- **School and recreational** volleyball games
- **Beach volleyball** matches
- **Training sessions** with score tracking
- **Live streaming** with real-time scoreboards

## Contact

For questions or support, please:
- Create an issue in this repository
- Use the contact form on the website
- Submit feature requests via GitHub Issues

---

Built with ❤️ for the volleyball community using modern web technologies.