import { render, screen } from '@testing-library/react';
import App from './App';

test('renders MLB Trivia Challenge title', () => {
  render(<App />);
  const titleElement = screen.getByText(/MLB Trivia Challenge/i);
  expect(titleElement).toBeInTheDocument();
});
