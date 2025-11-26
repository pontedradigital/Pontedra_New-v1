import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Depoimentos from '@/sections/Depoimentos'

describe('Depoimentos carousel', () => {
  beforeEach(() => {
    render(<Depoimentos />)
  })

  it('navega adiante e retorna ao início (wrap-around 1→5→1)', async () => {
    const nextBtn = screen.getByRole('button', { name: /Próximo/i })
    const counter = () => screen.getAllByText(/\d+\/\d+/)[0]

    expect(counter().textContent).toMatch(/^1\/5$/)
    await userEvent.click(nextBtn)
    await userEvent.click(nextBtn)
    await userEvent.click(nextBtn)
    await userEvent.click(nextBtn)
    expect(counter().textContent).toMatch(/^5\/5$/)
    await userEvent.click(nextBtn)
    expect(counter().textContent).toMatch(/^1\/5$/)
  })

  it('navega para trás do último ao primeiro (5→1)', async () => {
    const prevBtn = screen.getAllByRole('button', { name: /Anterior/i })[0]
    const nextBtn = screen.getAllByRole('button', { name: /Próximo/i })[0]
    const counter = () => screen.getAllByText(/\d+\/\d+/)[0]

    await userEvent.click(nextBtn)
    await userEvent.click(nextBtn)
    await userEvent.click(nextBtn)
    await userEvent.click(nextBtn)
    expect(counter().textContent).toMatch(/^5\/5$/)
    await userEvent.click(prevBtn)
    expect(counter().textContent).toMatch(/^4\/5$/)
    await userEvent.click(prevBtn)
    await userEvent.click(prevBtn)
    await userEvent.click(prevBtn)
    expect(counter().textContent).toMatch(/^1\/5$/)
  })

  it('mantém número de slides estável e estado ativo acessível', () => {
    const slides = screen.getAllByTestId('testimonial-slide')
    expect(slides.length).toBeGreaterThanOrEqual(5)
    const active = screen.getAllByRole('group').find(el => el.getAttribute('aria-current') === 'true')
    expect(active).toBeDefined()
  })
})
