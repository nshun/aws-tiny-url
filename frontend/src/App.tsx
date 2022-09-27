import { useState } from 'react';
import {
  Header,
  Container,
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
        (error) => console.error(error)
      );
  };

  return (
    <Box margin="xl">
      <SpaceBetween size="m">
        <Header variant="h1">URL 短縮サービス</Header>

        <Container>
          <SpaceBetween size="s">
            <Input value={longUrl} onChange={(event) => setLongUrl(event.detail.value)} placeholder="長い URL" />
            <Button variant="primary" onClick={handleClickConfirm} disabled={!longUrl}>
              送信
            </Button>
          </SpaceBetween>
        </Container>

        <Box display={tinyUrl ? 'block' : 'none'}>
          <Container>
            <Header variant="h3">生成された短縮 URL</Header>
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
              {tinyUrl}
            </Link>
          </Container>
        </Box>
      </SpaceBetween>
    </Box>
  );
}
