import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const MessageBox = styled.div`
  background-color: #f0f8ff;
  border: 1px solid #b0d4ff;
  padding: 1.5rem;
  border-radius: 12px;
  max-width: 600px;
  margin: 2rem auto;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 1rem;
`;

const Paragraph = styled.p`
  font-size: 1rem;
  margin: 0.5rem 0;
`;

export const Button = styled.button`
  background-color: #0070f3;
  color: white;
  font-size: 1rem;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background-color: #005ac1;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

export default function ConfirmationPage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { slug, email } = router.query;

  return (
    <Layout>
      <MessageBox>
        <Title>{t('reservation_confirmed')}</Title>

        {email ? (
          <>
            <Paragraph>
              {t('email_sent_to')} <strong>{email}</strong>.
            </Paragraph>
            <Paragraph>{t('email_not_received')}</Paragraph>
            <Paragraph>
              📧 hosteltotalsalta@gmail.com
              <br />
              📞 +54 9 11 2843-7601
            </Paragraph>
          </>
        ) : (
          <Paragraph>{t('reservation_successful')}</Paragraph>
        )}
        <Button onClick={() => router.push(`/hostels/${slug}`)}>
          {t('back_to_home')}
        </Button>
      </MessageBox>
    </Layout>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
