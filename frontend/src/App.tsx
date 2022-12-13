import { useState } from 'react';
import {
  Alert,
  Header,
  Container,
  ContentLayout,
  SpaceBetween,
  Input,
  Button,
  Box,
  Popover,
  StatusIndicator,
  Link,
} from '@cloudscape-design/components';

import config from './config';

export default function App() {
  const [longUrl, setLongUrl] = useState('');
  const [tinyUrl, setTinyUrl] = useState('');
  const [error, setError] = useState(false);

  const handleClickConfirm = () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: longUrl }),
    };
    fetch(config.API_ENDPOINT, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => setTinyUrl(result.tiny),
        (error) => setError(true)
      );
  };

  return (
    <ContentLayout
      header={
        <Box margin={{ top: 'xxl', horizontal: 'xxl' }}>
          <Header
            variant="h1"
            description="AWS で作る短縮 URL サービス"
            actions={
              <Button href="https://github.com/nshun/aws-tiny-url" target="_blank">
                <Link external>Github</Link>
              </Button>
            }
          >
            Tiny URL
          </Header>
        </Box>
      }
    >
      <Box margin="l">
        <Box margin={{ bottom: 'm' }}>
          <Alert
            onDismiss={() => setError(false)}
            visible={error}
            dismissAriaLabel="アラートを閉じる"
            dismissible
            type="error"
            header="エラー"
          />
          <Alert
            onDismiss={() => setTinyUrl('')}
            visible={tinyUrl !== ''}
            dismissAriaLabel="アラートを閉じる"
            dismissible
            type="success"
            header="生成された短縮 URL (有効期限 1週間)"
          >
            <Popover
              size="small"
              position="bottom"
              triggerType="custom"
              dismissButton={false}
              content={<StatusIndicator type="success">URL コピー済み</StatusIndicator>}
            >
              <Button
                variant="inline-icon"
                iconName="copy"
                onClick={() => {
                  navigator.clipboard.writeText(tinyUrl);
                }}
              />
            </Popover>
            <Link external externalIconAriaLabel="新しいタブで開く" href={tinyUrl}>
              {tinyUrl.replace(/https?:\/\//, '')}
            </Link>
          </Alert>
        </Box>
        <Container header={<Header variant="h2">URL を短縮</Header>}>
          <SpaceBetween size="m">
            <Input value={longUrl} onChange={(event) => setLongUrl(event.detail.value)} placeholder="長いURL" />
            <Button variant="primary" onClick={handleClickConfirm} disabled={!longUrl}>
              送信
            </Button>
          </SpaceBetween>
        </Container>
      </Box>
      <Box textAlign="center" margin="m">
        {'© Shun Nishimura '}
        {new Date().getFullYear()}
        {'.'}
      </Box>
    </ContentLayout>
  );
}
