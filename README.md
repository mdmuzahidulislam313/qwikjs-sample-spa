# TaskNest

A task manager SPA built with Qwik.js, TailwindCSS, and QwikCity.

## Features

- Create, delete, and manage projects.
- Add, edit, delete, and complete tasks within projects.
- View all tasks from all projects on a central dashboard.
- Responsive design with light and dark modes.
- Data persistence using `localStorage`.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Setup

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/tasknest.git
    cd tasknest
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```

### Running in Development

To start the development server, run:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To create a production build, run:

```bash
npm run build
```

This will generate a static build in the `dist` directory.

### Previewing the Production Build

To preview the production build locally, run:

```bash
npm run preview
```

## Deployment

### Netlify / Vercel

This application is a static site and can be deployed to any static hosting service like Netlify or Vercel.

-   **Build Command:** `npm run build`
-   **Publish Directory:** `dist`

Simply connect your Git repository to your preferred service and configure the build settings as shown above.
