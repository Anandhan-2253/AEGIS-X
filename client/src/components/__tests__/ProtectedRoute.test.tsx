import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ProtectedRoute } from '../ProtectedRoute';

const baseValue = {
  user: null,
  tokens: null,
  loading: false,
  login: async () => {},
  register: async () => {},
  refresh: async () => {},
  logout: () => {},
  hasRole: () => false,
};

describe('ProtectedRoute', () => {
  it('redirects to login when unauthenticated', () => {
    render(
      <AuthContext.Provider value={baseValue}>
        <MemoryRouter initialEntries={['/secure']}>
          <Routes>
            <Route
              path="/secure"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <div>Secure Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders child when role is allowed', () => {
    render(
      <AuthContext.Provider
        value={{
          ...baseValue,
          user: {
            id: 'u1',
            email: 'admin@example.com',
            username: 'admin',
            role: 'ADMIN',
            isActive: true,
          },
          hasRole: () => true,
        }}
      >
        <MemoryRouter initialEntries={['/secure']}>
          <Routes>
            <Route
              path="/secure"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <div>Secure Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );

    expect(screen.getByText('Secure Content')).toBeInTheDocument();
  });
});
