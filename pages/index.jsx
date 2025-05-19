// pages/index.js
import Head from 'next/head';
import Layout from '../components/Layout';
import HeroSection from '../components/HeroSection';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>TotalHub - Buscá tu hostel</title>
      </Head>
      <HeroSection />
    </Layout>
  );
}
