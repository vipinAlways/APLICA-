import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

function Hello() {
  return <h1>Hello World</h1>;
}

test('renders hello world', () => {
  render(<Hello />);
  expect(screen.getByText('Hello World')).toBeInTheDocument();
});
