import { render, screen } from '@testing-library/react';
import Home from '../app/page';

test('renders home page text', () => {
  render(<Home />);
  expect(screen.getByText(/welcome/i)).toBeInTheDocument();
});
