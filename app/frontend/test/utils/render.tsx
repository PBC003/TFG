import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthContext, type AuthContextValue } from '../../src/context/AuthContext';
import { theme } from '../../src/theme';
import { createAuthValue } from './auth';

interface RenderOptions {
  route?: string;
  authValue?: AuthContextValue;
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', authValue = createAuthValue() }: RenderOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthContext.Provider value={authValue}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </AuthContext.Provider>
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}
