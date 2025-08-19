import * as React from 'react';

import DemoSearchComponentFour from '@demos/DemoSearchComponentFour';
import Footer from '@system/Footer';
import GlobalModalManager from '@system/modals/GlobalModalManager';
import Navigation from '@system/Navigation';
import Page from '@components/Page';

function ExampleSearchVersionFour(props) {
  return (
    <Page
      isNotOpenSourceExample
      title="Components ➝ search concept IV"
      description="A lightweight website template to test our design system. You can view this template on GitHub and see how we write websites."
      url="https://wireframes.internet.dev/examples/components/search-4"
    >
      <DemoSearchComponentFour />
      <GlobalModalManager />
    </Page>
  );
}

export async function getServerSideProps(context) {
  return {
    props: {},
  };
}

export default ExampleSearchVersionFour;
