import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';
import PageWrapper from './PageWrapper';
import { useLocation } from 'react-router-dom';

// Pages that need full-bleed layout (no container padding)
const FULL_BLEED_ROUTES = ['/processing'];

export default function AppLayout() {
  const location = useLocation();

  const isFullBleed = FULL_BLEED_ROUTES.includes(location.pathname);

  return (
    <>
      <Navbar/>
      <PageWrapper
        noPadding={isFullBleed}
      >
        {/* Outlet renders whichever page component matches the current route */}
        <Outlet />
      </PageWrapper>
    </>
  );
}