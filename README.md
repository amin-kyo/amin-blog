# あみメモ (Amin Blog)

技術メモ、趣味の記録、活動ログを発信する個人ブログです。

## 🚀 Tech Stack

- **Framework**: Astro 5.11.0
- **Language**: TypeScript
- **Styling**: Pure CSS with Custom Properties
- **Hosting**: Cloudflare Pages
- **Content**: Markdown/MDX

## ✨ Features

- 📱 **Responsive Design**: Mobile-first approach with elegant UI
- 🌙 **Dark Mode**: Theme switching with localStorage persistence
- 🔍 **SEO Optimized**: OpenGraph, canonical URLs, sitemap
- 🏷️ **Tag System**: Categorized content with tag filtering
- 📅 **Archive System**: Monthly archive organization
- 🔧 **Error Handling**: Comprehensive error handling and 404 page
- 🖼️ **Image Optimization**: Astro's built-in image optimization
- 📊 **Blog Statistics**: Post count, tag count, archive metrics
- 🎨 **Soft Elegance Design**: Lavender-based color palette

## 🗂️ Project Structure

```
src/
├── components/          # Reusable UI components
├── content/blog/        # Blog posts (Markdown/MDX)
├── layouts/             # Page layouts
├── pages/              # Routes and pages
├── styles/             # CSS files (variables, components, layouts)
└── utils/              # Utility functions and error handling
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run astro check
```

## 🎨 Design System

- **Color Palette**: Lavender-based with gradient accents
- **Typography**: System fonts with careful hierarchy
- **Layout**: Clean, minimal with focus on readability
- **Components**: Modular CSS with BEM-like naming

## 📝 Content Management

Blog posts are written in Markdown/MDX and stored in `src/content/blog/`. Each post includes:

- Title and description
- Publish and update dates
- Tags for categorization
- Optional hero images
- Draft status support

## 🔗 Links

- **Site**: [あみめも](https://amin-kyo.xyz)
- **Contact**: Mastodon [@amin@mstdn.jp](https://mstdn.jp/@amin)

---

Built with ❤️ using Astro