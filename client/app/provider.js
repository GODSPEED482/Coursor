"use client";

import { SessionProvider } from 'next-auth/react'

import React from 'react'

const Provider = ({ children }) => {
  return (
    <SessionProvider refetchInterval={10}>{children}</SessionProvider>
  );
};

export default Provider;