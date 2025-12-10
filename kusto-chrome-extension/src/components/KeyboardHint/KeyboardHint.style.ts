import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

const fadeInOut = keyframes`
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  15% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  85% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
`

export const Container = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.85);
  padding: 16px 24px;
  border-radius: 16px;
  z-index: 2147483646;
  animation: ${fadeInOut} 1.5s ease-in-out forwards;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`

export const KeyBox = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  background: linear-gradient(180deg, #4a4a4a 0%, #333 100%);
  border: 1px solid #5a5a5a;
  border-radius: 8px;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 
    0 2px 0 #222,
    0 3px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
`

export const Plus = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 20px;
  font-weight: 400;
`
