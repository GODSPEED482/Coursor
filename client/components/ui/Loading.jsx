"use client";

import React from "react";

const Loading = () => (
  <div className="flex items-center justify-center min-h-[100px] w-full">
    <span className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary"></span>
    <span className="sr-only">Loading...</span>
  </div>
);

export default Loading;
