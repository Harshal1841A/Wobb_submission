import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SimilarCreatorsRail } from './SimilarCreatorsRail';

describe('SimilarCreatorsRail', () => {
  it('renders similar creators and navigates on click', () => {
    const similarUsers = [
      {
        user_id: '123',
        username: 'nike',
        picture: 'https://example.com/pic.jpg',
        fullname: 'Nike Official',
        followers: 1000000,
        is_verified: true,
        engagements: 50000,
        score: 1.5,
      },
    ];

    render(
      <MemoryRouter initialEntries={['/profile/cristiano']}>
        <Routes>
          <Route
            path="/profile/cristiano"
            element={<SimilarCreatorsRail similarUsers={similarUsers} platform="instagram" />}
          />
          <Route path="/profile/nike" element={<div>Navigated to Nike</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Related Profiles in Dossier System')).toBeDefined();
    expect(screen.getByText('@nike')).toBeDefined();

    const card = screen.getByText('@nike').closest('[role="button"]')!;
    fireEvent.click(card);
    expect(screen.getByText('Navigated to Nike')).toBeDefined();
  });
});
