import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

// Minimal smoke test to validate render and basic text

describe('App', () => {
  it('renders heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /todo list/i })).toBeInTheDocument()
  })
})

