import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios', () => {
  const get = jest.fn();
  const post = jest.fn();
  return {
    __esModule: true,
    get,
    post,
    default: { get, post },
  };
});

const mockedAxios = jest.requireMock('axios');

beforeEach(() => {
  mockedAxios.get.mockResolvedValue({ data: null });
  mockedAxios.default.get.mockResolvedValue({ data: null });
  document.documentElement.dataset.theme = 'dark';
  global.fetch = jest.fn(() => Promise.resolve({ data: null }));
});

test('defaults to dark mode and toggles between themes', () => {
  render(<App />);

  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  const toggle = screen.getByRole('button', { name: 'Switch to light mode' });

  fireEvent.click(toggle);
  expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
});
