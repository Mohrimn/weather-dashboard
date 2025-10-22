import { render, screen } from '@testing-library/react';
import React from 'react';

describe('Sample test', () => {
  it('renders a confirmation message', () => {
    render(<p>Hello from the testing stack!</p>);

    expect(
      screen.getByText(/hello from the testing stack!/i)
    ).toBeInTheDocument();
  });
});
