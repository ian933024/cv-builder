# CV Generator Project Guidelines

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run predeploy` - Run build before deployment
- `npm run deploy` - Deploy to GitHub Pages
- `npx eslint src/**/*.jsx` - Lint specific file(s)

## Code Style
- **Framework**: React with Vite, SASS for styling
- **Imports**: Group imports by type (React, external libraries, local components)
- **Component Structure**: Functional components with hooks
- **State Management**: useState/useEffect for local state, localStorage for persistence
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Props**: Destructure props in component parameters
- **Event Handlers**: name as `handle[Event]` or `[action][Subject]`
- **Dark Mode**: Support both light and dark themes via CSS classes

## Project Patterns
- Component organization: editors/ for input forms, preview/ for CV display
- Maintain consistent form data structure across components
- Use nanoid for generating unique IDs
- Follow airbnb + prettier ESLint configuration