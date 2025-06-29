# VLAST 🚀

A sophisticated GitHub repository management interface built with React and TypeScript, featuring elegant design, interactive analytics, and powerful batch operations.

![VLAST](https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop)

## ✨ Features

- **🎨 Sophisticated Design**: Minimal dark theme with elegant glassmorphism effects and 3D floating elements
- **⚡ Quick Actions**: Toggle repository visibility and delete repositories with confirmation
- **📊 Analytics Dashboard**: Interactive charts showing user profile statistics and repository data
- **🔍 Advanced Filtering**: Search, filter by visibility, and sort by programming language
- **🛡️ Secure**: Tokens stored locally, never transmitted to external servers
- **📱 Responsive**: Optimized for desktop, tablet, and mobile devices
- **🎭 Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **⚡ Performance Optimized**: React Query for caching, memoization, and code splitting
- **🔒 Type Safe**: Full TypeScript implementation with strict typing

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **3D Graphics**: React Three Fiber + Drei
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Fetching**: React Query (TanStack Query)
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- GitHub Personal Access Token

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd vlast-galactic-github-manager
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:5173`

### GitHub Token Setup

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select the following scopes:
   - `repo` - Full control of private repositories
   - `delete_repo` - Delete repositories
   - `user` - Read user profile data
4. Copy the generated token
5. Paste it in the application's token submission page

## 🔧 Configuration

### Environment Configuration

The application uses real GitHub API data exclusively. All configuration is handled in `src/config/environment.ts`:

```typescript
export const config = {
  isDevelopment: false, // Always uses real GitHub API
  githubApi: {
    baseUrl: 'https://api.github.com',
    tokenKey: 'github_access_token',
  },
  requiredScopes: ['repo', 'delete_repo', 'user'],
};
```

## 📁 Project Structure

```
src/
├── components/
│   ├── LandingPage.tsx       # Hero page with 3D elements
│   ├── TokenSubmission.tsx   # GitHub token input form
│   ├── Dashboard.tsx         # Main repository dashboard
│   ├── RepoCard.tsx          # Individual repository card
│   ├── RepoDetailModal.tsx   # Detailed repository view
│   ├── UserProfileChart.tsx  # User profile analytics
│   ├── WidgetComponent.tsx   # Statistics widgets
│   ├── Background3D.tsx      # 3D floating shapes
│   ├── ErrorBoundary.tsx     # Error boundary component
│   └── LoadingSpinner.tsx    # Loading component
├── hooks/
│   ├── useAuth.ts           # Authentication management
│   ├── useRepositories.ts   # Repository CRUD operations
│   ├── useUser.ts           # User profile data
│   └── useRepositoryFiles.ts # File operations
├── utils/
│   ├── api.ts               # GitHub API client
│   ├── formatters.ts        # Utility functions
│   └── constants.ts         # Application constants
├── types/
│   └── index.ts             # TypeScript type definitions
├── config/
│   └── environment.ts       # Environment configuration
├── App.tsx                  # Main app with routing
└── main.tsx                 # Application entry point
```

## 🎮 Usage

### Navigation Flow

1. **Landing Page**: Introduction with animated 3D elements
2. **Token Submission**: Secure token input with validation
3. **Dashboard**: Repository management interface

### Key Features

- **Repository Cards**: Click any repository card to view detailed information
- **Quick Actions**: Use the visibility toggle and delete buttons on each card
- **Search & Filter**: Use the search bar and dropdown filters to find specific repositories
- **User Profile**: Toggle the profile view to see GitHub user statistics and analytics
- **View Modes**: Switch between grid and list views using the toolbar
- **Create Repository**: Use the "New Repository" button to create repositories

### Keyboard Shortcuts

- `Ctrl/Cmd + K`: Focus search input
- `Escape`: Close modals and dropdowns

## 🔒 Security & Privacy

- **Local Storage**: Tokens are stored in your browser's localStorage
- **No External Transmission**: Your token never leaves your device
- **Revocable**: You can revoke tokens anytime from GitHub settings
- **HTTPS Only**: All GitHub API calls use secure HTTPS connections

## ⚡ Performance Features

- **React Query Caching**: Intelligent data caching with automatic invalidation
- **Code Splitting**: Lazy loading of components for faster initial load
- **Memoization**: React.memo and useMemo for optimized re-renders
- **Bundle Optimization**: Separate chunks for vendors, UI components, and features

## 🎨 Customization

### Color Scheme

The application uses a purple-based color palette. To customize:

1. Edit the Tailwind configuration in `tailwind.config.js`
2. Update the gradient classes in components
3. Modify the 3D element colors in `Background3D.tsx`

### 3D Elements

Customize floating shapes in `src/components/Background3D.tsx`:

```typescript
const shapes: FloatingShapeProps[] = [
  {
    position: [-8, 2, -5],
    rotationSpeed: [0.01, 0.02, 0],
    color: '#8B5CF6',
    shape: 'sphere',
  },
  // Add more shapes...
];
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Set up environment variables if needed

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Adding New Features

1. Create new components in `src/components/`
2. Add routes in `src/App.tsx` if needed
3. Create custom hooks in `src/hooks/` for data management
4. Update types in `src/types/index.ts`
5. Test with real GitHub API data

## 📊 API Reference

### GitHub API Endpoints Used

- `GET /user` - Fetch user profile information
- `GET /user/repos` - Fetch user repositories
- `POST /user/repos` - Create new repository
- `PATCH /repos/{owner}/{repo}` - Update repository settings
- `DELETE /repos/{owner}/{repo}` - Delete repository
- `GET /repos/{owner}/{repo}/contents/{path}` - Get repository contents
- `PUT /repos/{owner}/{repo}/contents/{path}` - Upload file
- `DELETE /repos/{owner}/{repo}/contents/{path}` - Delete file

### Required Token Scopes

- `repo`: Full control of private repositories
- `delete_repo`: Delete repositories
- `user`: Read user profile data

## 🐛 Troubleshooting

### Common Issues

1. **Token Validation Failed**
   - Ensure your token has the required scopes
   - Check if the token hasn't expired
   - Verify you're using a classic token, not fine-grained

2. **3D Elements Not Rendering**
   - Ensure WebGL is supported in your browser
   - Try disabling browser extensions that might block WebGL

3. **Charts Not Displaying**
   - Check browser console for errors
   - Ensure you have repositories with language data

4. **TypeScript Errors**
   - Run `npm run type-check` to see all type errors
   - Ensure all dependencies are properly installed

### Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [GitHub API](https://docs.github.com/en/rest) for repository data
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) for 3D graphics
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Recharts](https://recharts.org/) for data visualization
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons
- [TanStack Query](https://tanstack.com/query) for data fetching and caching

---

Built with precision for developers who demand excellence