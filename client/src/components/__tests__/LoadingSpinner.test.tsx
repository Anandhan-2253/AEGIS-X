import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders label', () => {
    render(<LoadingSpinner label="Fetching" />);
    expect(screen.getByText('Fetching')).toBeInTheDocument();
  });
});
