# RetinaScan 🩺

An AI-powered web application for diabetic retinopathy screening support, designed for nurses and ophthalmic technicians working in resource-limited healthcare settings.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State & API calls | React Query + Axios |
| PDF generation | @react-pdf/renderer |
| Routing | React Router v6 |
| Backend | FastAPI (Python) |
| Database | Firebase Firestore |

> The ML model (EfficientNetB3 trained on APTOS 2019) is served separately via the FastAPI backend and is not included in this repository.

---

## Getting started

### Prerequisites

- Node.js 20+
- npm or yarn
- A running instance of the RetinaScan FastAPI backend (see backend repo)

### Clone and install

```bash
git clone https://github.com/your-username/retinascan-web.git
cd retinascan-web
npm install


### Run in development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
npm run preview
```

---

## Contributing

Contributions are welcome. To get started:

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature-name`
3. Make your changes and commit — `git commit -m "add: your feature description"`
4. Push to your fork — `git push origin feature/your-feature-name`
5. Open a pull request against `main`

Please keep pull requests focused on a single change. For significant changes, open an issue first to discuss the approach.

---

## Licence

MIT