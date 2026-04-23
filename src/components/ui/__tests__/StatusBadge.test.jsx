import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge } from '../StatusBadge'

describe('StatusBadge', () => {
  it('renders pending status correctly', () => {
    render(<StatusBadge status="pending" />)
    expect(screen.getByText('Pending')).toBeDefined()
  })

  it('renders approved status correctly', () => {
    render(<StatusBadge status="approved" />)
    expect(screen.getByText('Approved')).toBeDefined()
  })

  it('renders rejected status correctly', () => {
    render(<StatusBadge status="rejected" />)
    expect(screen.getByText('Rejected')).toBeDefined()
  })

  it('renders locked status correctly', () => {
    render(<StatusBadge status="locked" />)
    expect(screen.getByText('Locked')).toBeDefined()
  })

  it('defaults to pending status if unknown status provided', () => {
    render(<StatusBadge status="unknown_status" />)
    expect(screen.getByText('Pending')).toBeDefined()
  })
})
