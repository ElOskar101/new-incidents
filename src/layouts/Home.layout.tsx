import { Outlet } from 'react-router'
import { Header } from '@/layouts/header'
import { Container } from '@/layouts/container'

export function HomeLayout() {
  return (
    <Container>
      <Header />
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
    </Container>
  )
}
