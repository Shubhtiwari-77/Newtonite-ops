# Vanilla HTML Portfolio

This is a vanilla HTML/CSS/JavaScript version of the portfolio website.

## Features

- ✅ Pure HTML5, CSS3, and JavaScript (no React dependencies)
- ✅ Responsive design for all devices
- ✅ EmailJS integration for contact form
- ✅ Smooth scroll animations
- ✅ Portfolio filtering
- ✅ Animated achievement counters
- ✅ Parallax effects

## File Structure

```
vanilla/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── app.js          # Main application logic
│   └── data.js         # Portfolio data
└── README.md           # This file
```

## Setup

1. **No build required!** Just open `index.html` in a browser.

2. **For local development:**
   ```bash
   # Use any simple HTTP server
   npx serve vanilla
   # or
   python3 -m http.server 8000
   ```

3. **For deployment:**
   - Upload the entire `vanilla/` folder to your web hosting
   - Point your domain to this directory
   - Ensure all asset paths in `../src/assets/` are accessible

## EmailJS Configuration

The contact form uses EmailJS with these credentials:
- Service ID: `service_h3vp06r`
- Template ID: `template_isgpq8d`
- Public Key: `Zh1yT_NY3OYKuoQ8V`

Update in `js/app.js` if needed:
```javascript
const CONFIG = {
    email: 'tiwarishubh832@gmail.com',
    emailjs: {
        serviceId: 'your_service_id',
        templateId: 'your_template_id',
        publicKey: 'your_public_key'
    }
};
```

## Asset Paths

All images reference `../src/assets/` relative paths. Ensure assets are in the correct location:
- Portfolio images: `../src/assets/project-*.png`
- Skill icons: `../src/assets/sk-*.png`
- Blog photos: `../src/assets/blog/*.jpg`
- Profile images: `../src/assets/man.png`, `man1.png`, `man3.png`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Deployment Options

### Option 1: GitHub Pages (from vanilla-html branch)
```bash
git add .
git commit -m "Add vanilla HTML version"
git push origin vanilla-html
```
Configure GitHub Pages to use `vanilla-html` branch.

### Option 2: Netlify/Vercel
Simply drag and drop the `vanilla/` folder.

### Option 3: Traditional hosting
Upload files via FTP to your web hosting provider.

## Performance

- No JavaScript frameworks = Faster load times
- Minimal dependencies (only EmailJS CDN)
- Optimized CSS with responsive design
- Lazy loading ready for images

## Customization

### Change Colors
Edit CSS variables in `css/styles.css`:
```css
:root {
    --color-dark: #111111;
    --color-light: #F2F2F2;
    --color-accent: #007bff;
}
```

### Add Projects
Edit `js/data.js`:
```javascript
const projects = [
    {
        id: 9,
        title: 'New Project',
        subtitle: 'Project Subtitle',
        description: 'Description here...',
        category: 'website', // website, dashboard, or mobile-app
        image: '../src/assets/new-project.png'
    }
];
```

### Modify Sections
Edit `index.html` - all sections are clearly marked with comments.

## License

Personal portfolio - All rights reserved.
