import styled from 'styled-components';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import Slider from 'react-slick';
import Modal from 'react-modal';
import { useState, useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const RoomCard = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #ccc;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
  width: 100%; /* agregamos esto */

  @media (min-width: 768px) {
    flex-direction: row;
    height: 220px;
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;

  @media (min-width: 768px) {
    width: 300px;
    height: 100%;
    aspect-ratio: unset;
  }
`;

const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;

const RoomContent = styled.div`
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 767px) {
    width: 100%;
    justify-content: flex-start;
    margin-bottom: 1rem; /* 👈 Agregamos este espacio solo en mobile */
  }
`;


const RoomTitle = styled.h3`
  margin: 0 0 0.5rem 0;
`;

const RoomInfo = styled.p`
  margin: 0.25rem 0;
  color: #555;
`;

const Price = styled.p`
  font-weight: bold;
  margin-top: 0.5rem;
`;

const ButtonLink = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.25rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-weight: bold;
  border-radius: 4px;
  margin-top: 1rem;
  text-decoration: none;
  text-align: center;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }

  @media (max-width: 767px) {
    width: 100%;
  }
`;

const StyledBackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: transparent;
  color: #333;
  border: 1px solid #ccc;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const NoResults = styled.p`
  font-style: italic;
  margin-top: 2rem;
`;

const InfoRow = styled.div`
  margin: 1.5rem 0;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (min-width: 600px) {
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 2rem;
  }
`;

const InfoLabel = styled.span`
  font-weight: bold;
`;

const InfoValue = styled.span`
  color: #333;
`;

const ViewPhotosButton = styled.button`
  margin-top: 0.5rem;
  background: none;
  color: #0070f3;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
`;

const FeatureListWrapper = styled.div`
  width: 100%;
  max-width: 100%;
`;


const FeatureList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 10px;
`;


const FeatureItem = styled.div`
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #333;
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 767px) {
    padding: 2px 6px;
    font-size: 0.8rem;
  }
`;

const FeatureMore = styled.div`
  background: #e0e0e0;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 767px) {
    padding: 2px 6px;
    font-size: 0.8rem;
  }
`;

const RoomBottomRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
`;

const LeftActions = styled.div`
  @media (min-width: 768px) {
    flex: 1;
    display: flex;
    align-items: flex-start;
  }
`;

const RightActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;

  @media (min-width: 768px) {
    flex: 1;
    align-items: flex-end;
  }
`;


Modal.setAppElement('#__next');

export default function AvailabilityPage({ hostel, availableRooms, from, to, guests }) {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [modalImages, setModalImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [featuresModalRoom, setFeaturesModalRoom] = useState(null);
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);

  const locale = router.locale || 'es';
  const localeMap = { es, en: enUS };

  const formattedFrom = format(parseISO(from), 'P', { locale: localeMap[locale] });
  const formattedTo = format(parseISO(to), 'P', { locale: localeMap[locale] });

  const nights = Math.ceil((parseISO(to).getTime() - parseISO(from).getTime()) / (1000 * 60 * 60 * 24));

  const openModal = (images) => {
    setModalImages(images);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImages([]);
  };

  const openFeaturesModal = (room) => {
    setFeaturesModalRoom(room);
    setIsFeaturesModalOpen(true);
  };

  const closeFeaturesModal = () => {
    setIsFeaturesModalOpen(false);
    setFeaturesModalRoom(null);
  };

  const sliderSettings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const listRefs = useRef({});
  const [visibleCounts, setVisibleCounts] = useState({});
  useEffect(() => {
    const updateVisibleCounts = () => {
      const newCounts = {};
      Object.entries(listRefs.current).forEach(([roomId, container]) => {
        if (!container) return;
        const children = Array.from(container.children);
        const containerWidth = container.offsetWidth;
        let totalWidth = 0;
        let count = 0;
        for (let child of children) {
          const style = window.getComputedStyle(child);
          const margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
          const width = child.offsetWidth + margin;
          if (totalWidth + width <= containerWidth) {
            totalWidth += width;
            count++;
          } else {
            break;
          }
        }
        newCounts[roomId] = count;
      });
      setVisibleCounts(newCounts);
    };

    updateVisibleCounts();
    window.addEventListener('resize', updateVisibleCounts);
    return () => window.removeEventListener('resize', updateVisibleCounts);
  }, [availableRooms]);

  return (
    <Layout>
      <StyledBackButton onClick={() => router.back()}>
        ← {t('back')}
      </StyledBackButton>

      <Title>{t('availability.title', { hostelName: hostel.name })}</Title>

      <InfoRow>
        <div><InfoLabel>{t('availability.from')}:</InfoLabel> <InfoValue>{formattedFrom}</InfoValue></div>
        <div><InfoLabel>{t('availability.to')}:</InfoLabel> <InfoValue>{formattedTo}</InfoValue></div>
        <div><InfoLabel>{t('availability.guests')}:</InfoLabel> <InfoValue>{guests}</InfoValue></div>
      </InfoRow>

      {availableRooms.length === 0 ? (
        <NoResults>{t('availability.noResults')}</NoResults>
      ) : (
        availableRooms.map((room) => {
          const totalPrice = room.price * guests;
          const features = room.features?.length ? room.features : [];

          return (
            <RoomCard key={room.id}>
              <ImageContainer>
                {room.images?.[0]?.url && (
                  <SlideImage src={room.images[0].url} alt={room.name} />
                )}
              </ImageContainer>
              <RoomContent>
                <div>
                  <RoomTitle>{t(`roomType.${room.slug}`)}</RoomTitle>
                  <FeatureListWrapper>
                    <FeatureList ref={(el) => (listRefs.current[room.id] = el)}>
                      {features
                        .slice(0, 3)
                        .map((feature, index) => (
                          <FeatureItem key={index}>{t(`roomFeatures.${feature.slug}`)}</FeatureItem>
                        ))}

                      {features.length > 3 && (
                        <FeatureMore onClick={() => openFeaturesModal(room)}>
                          +{features.length - 3} {t('availability.more')}
                        </FeatureMore>
                      )}


                    </FeatureList>
                  </FeatureListWrapper>

                  <RoomInfo>
                    {guests} {t('availability.guests').toLowerCase()} · {nights} {t('night')}{nights > 1 ? 's' : ''}
                  </RoomInfo>
                  <Price>{t('availability.fromPrice')}: ${totalPrice}</Price>

                  {room.images?.length > 1 && (
                    <ViewPhotosButton onClick={() => openModal(room.images)}>
                      {t('availability.viewMorePhotos')}
                    </ViewPhotosButton>
                  )}
                </div>
                <ButtonLink
                  href={{
                    pathname: `/hostels/${hostel.slug}/reservations/new`,
                    query: { roomId: room.id, roomSlug: room.slug, from, to, guests },
                  }}
                >
                  {t('availability.reserve')}
                </ButtonLink>
              </RoomContent>
            </RoomCard>
          );
        })
      )}

      {/* Modal de fotos */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Galería de fotos"
        style={{
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1000 },
          content: {
            inset: 0,
            padding: 0,
            border: 'none',
            borderRadius: 0,
            backgroundColor: '#000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}
      >
        <div style={{ width: '100%', maxWidth: '800px', height: '80vh' }}>
          <Slider {...sliderSettings}>
            {modalImages.map((img) => (
              <div key={img.id}>
                <img src={img.url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
            ))}
          </Slider>
        </div>
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <button onClick={closeModal} style={{ background: 'white', color: '#000', padding: '6px 12px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>
            {t('common.close')}
          </button>
        </div>
      </Modal>

      {/* Modal de características */}
      <Modal
        isOpen={isFeaturesModalOpen}
        onRequestClose={closeFeaturesModal}
        contentLabel="Características"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          },
          content: {
            position: 'static',
            maxWidth: '90vw',
            padding: '1.5rem',
            borderRadius: '12px',
            backgroundColor: '#fff',
            overflow: 'auto',
          },
        }}
      >
        <h2>{t('availability.roomFeaturesTitle')}</h2>
        <FeatureList>
          {featuresModalRoom?.features?.map((feature, i) => (
            <FeatureItem key={i}>{t(`roomFeatures.${feature.slug}`)}</FeatureItem>
          ))}
        </FeatureList>
        <div style={{ textAlign: 'right', marginTop: '1rem' }}>
          <button
            onClick={closeFeaturesModal}
            style={{
              padding: '6px 12px',
              fontWeight: 'bold',
              border: '1px solid #ccc',
              borderRadius: '6px',
              background: '#f8f8f8',
              cursor: 'pointer',
            }}
          >
            {t('common.close')}
          </button>
        </div>
      </Modal>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const { from, to, guests } = context.query;

  if (!slug || !from || !to || !guests) {
    return { notFound: true };
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${baseUrl}/public/hostels/${slug}/availability?from=${from}&to=${to}&guests=${guests}`);

  if (!res.ok) {
    return { notFound: true };
  }

  const data = await res.json();


  return {
    props: {
      ...(await serverSideTranslations(context.locale, ['common'])),
      hostel: data.hostel,
      availableRooms: data.availableRooms,
      from,
      to,
      guests,
    },
  };
}
