import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';
import PageWrapper from './PageWrapper';
import { useLocation } from 'react-router-dom';

// Pages that need full-bleed layout (no container padding)
const FULL_BLEED_ROUTES = ['/processing'];

// Pages with a narrower max-width (forms look better constrained)
const NARROW_ROUTES = ['/new-screening', '/login'];

export default function AppLayout() {
  const location = useLocation();

  const isFullBleed = FULL_BLEED_ROUTES.includes(location.pathname);
  const isNarrow    = NARROW_ROUTES.includes(location.pathname);

  return (
    <>
      <Navbar/>
      <PageWrapper
        maxWidth={isNarrow ? 'md' : 'xl'}
        noPadding={isFullBleed}
      >
        {/* Outlet renders whichever page component matches the current route */}
        <Outlet />
      </PageWrapper>
    </>
  );
}