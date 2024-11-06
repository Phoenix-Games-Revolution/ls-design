import React from 'react';
import { Redirect } from '@docusaurus/router';
import { useBaseUrl } from '@docusaurus/core';

export default function Home(): JSX.Element {
  const baseUrl = useBaseUrl('/gdd/introduction');
  return <Redirect to={baseUrl} />;
}
