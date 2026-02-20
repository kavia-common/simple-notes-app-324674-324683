import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app header', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /simple notes/i });
  expect(heading).toBeInTheDocument();
});
