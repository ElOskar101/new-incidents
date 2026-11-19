import { Outlet } from 'react-router'
import { Header } from '@/layouts/header'
import { Container } from '@/layouts/container'

export function HomeLayout() {
  return (
    <Container>
      <Header />
      <Outlet />
    </Container>
  )
}
