import React from 'react';
import { RouteObject } from 'react-router-dom';

// Define routes that can be shared between client and server
const routes: RouteObject[] = [
  {
    path: '/',
    element: <>Home Page</>,
  },
  {
    path: '/about',
    element: <>About Page</>,
  },
  {
    path: '*',
    element: <>404 Page</>,
  },
];

export default routes;
