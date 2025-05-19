import Link from 'next/link';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 960px;
  margin: auto;
  padding: 2rem 1rem;
`;

const Nav = styled.nav`
  background: #004aad;
  color: white;
  padding: 1rem 0;
`;

const NavContent = styled.div`
  max-width: 960px;
  margin: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1rem;

  a {
    color: white;
    text-decoration: none;
    font-weight: bold;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Footer = styled.footer`
  text-align: center;
  font-size: 0.9rem;
  color: #777;
  margin-top: 4rem;
  padding: 2rem 1rem;
  border-top: 1px solid #eee;
`;

export default function Layout({ children }) {
  return (
    <>
      <Nav>
        <NavContent>
          <Link href="/" style={{ fontWeight: 'bold', color: 'white', fontSize: '1.2rem' }}>
            TotalHub
          </Link>


          <NavLinks>
            <Link href="/">Home</Link>
            <Link href="/reservations/lookup">Mis reservas</Link>
          </NavLinks>
        </NavContent>
      </Nav>

      <Container>{children}</Container>

      <Footer>© {new Date().getFullYear()} TotalHub</Footer>
    </>
  );
}
