import styled from "styled-components";

export const StyledBackButton = styled.button`
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

export const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

export const Form = styled.form`
  max-width: 500px;
  display: grid;
  gap: 1rem;
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  font-weight: bold;
`;

export const Input = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  margin-top: 0.3rem;
`;

export const Button = styled.button`
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Message = styled.p`
  margin-top: 1rem;
  font-weight: bold;
`;

export const OptionGroup = styled.div`
  display: grid;
  gap: 0.5rem;
  margin: 1rem 0;
`;

export const PriceLine = styled.label`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
`;

export const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

export const ModalBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  text-align: center;
`;

export const ModalButton = styled.button`
  margin-top: 1.5rem;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
`;

export const DiscountOption = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;

  button {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: #f9f9f9;
    cursor: pointer;
    font-weight: bold;

    &:hover {
      background: #eee;
    }
  }
`;

export const ReservationSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 2rem 0;

  .reservation-details,
  .price-options {
    width: 100%;
  }

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;

    .reservation-details,
    .price-options {
      width: 50%;
    }

    .price-options {
      padding-left: 2rem;
    }
  }
`;
