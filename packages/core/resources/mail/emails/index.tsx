import {
  Html,
  Head,
  Font,
  Preview,
  Body,
  Container,
  Section,
  Hr,
} from '@react-email/components';
import { Footer } from '../components/Footer.js';
import { ComponentBuilder } from './components.js';
import { Header } from '../components/Header.js';
import { Tailwind } from '@react-email/tailwind';

export const IntentMailComponent = (props?: Record<string, any>) => {
  const {
    components,
    header,
    footer,
    preview,
    theme: { isDarkThemed },
  } = props;

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Open Sans"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      {preview && <Preview>{preview}</Preview>}
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                bodyColor: isDarkThemed ? '#000000' : '#f6f9fc',
                bgColor: isDarkThemed ? '#121212' : '#ffffff',
                brand: isDarkThemed ? '#27272a' : '#656ee8',
                txt: isDarkThemed ? '#ffffff' : '#525f7f',
                tableBg: isDarkThemed ? '#18181b' : '#fbfbf9',
                tableHeader: isDarkThemed ? '#27272a' : '#f4f4f5',
                textPrimary: isDarkThemed ? '#ffffff' : '#525f7f',
                link: isDarkThemed ? '#006fee' : '#006fee',
                button: isDarkThemed ? '#006FEE' : '#006FEE',
                code: isDarkThemed ? '#282c34' : '#f4f4f4',
              },
            },
          },
        }}
      >
        <Body style={main} className="bg-bodyColor">
          <Container className="bg-bgColor px-10 py-5 mx-auto rounded-md">
            <Section>
              {header && (
                <>
                  <Header {...header} />
                  <Hr />
                </>
              )}
              {components?.map((item, index) => (
                <ComponentBuilder
                  value={item.value}
                  type={item.type}
                  // className={item.className}
                  key={`email-comp-${index}`}
                />
              ))}
              {footer && (
                <>
                  <Hr />
                  <Footer {...footer} />
                </>
              )}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

const main = {
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

export default IntentMailComponent;
